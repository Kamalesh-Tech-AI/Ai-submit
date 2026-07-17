'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, CheckCircle, Ticket, Plus, Download,
  Search, ShieldAlert, Cpu, Ban, QrCode, Lock, Mail, Eye, EyeOff
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  getAdminStats, getRegistrations, getBulkQRCodes,
  createBulkQR, deactivateBulkQR, exportRegistrationsCSV
} from '@/app/actions/admin';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Registration, BulkQRCode } from '@/lib/types';

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile, signOut } = useAuth();
  const supabase = createClient();

  // Authentication states for Admin panel
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    checkedInIndividuals: 0,
    totalBulkIssued: 0,
    checkedInBulk: 0,
  });
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [bulkCodes, setBulkCodes] = useState<BulkQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states for bulk QR creation
  const [univName, setUnivName] = useState('');
  const [maxLimit, setMaxLimit] = useState<number>(50);
  const [creatingBulk, setCreatingBulk] = useState(false);

  // Search/filter states for registrations table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, student, professional
  const [filterCheckIn, setFilterCheckIn] = useState('all'); // all, yes, no

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const statsRes = await getAdminStats();
      if ('error' in statsRes) {
        setErrorMsg(statsRes.error || 'An error occurred.');
        setLoading(false);
        return;
      }
      setStats(statsRes);

      const regRes = await getRegistrations();
      if (regRes.success) {
        setRegistrations((regRes.data || []) as unknown as Registration[]);
      }

      const bulkRes = await getBulkQRCodes();
      if (bulkRes.success) {
        setBulkCodes((bulkRes.data || []) as unknown as BulkQRCode[]);
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch admin dashboard records.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger loading data only if user is authorized admin/staff
  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, loadDashboardData]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    try {
      // 1. Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (error) {
        throw error;
      }

      // 2. Fetch the newly logged-in profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileErr || !profileData) {
        throw new Error('Could not retrieve user role details.');
      }

      // 3. Verify user has staff/admin role
      if (profileData.role !== 'admin' && profileData.role !== 'staff') {
        // Log them out immediately so they do not remain in an unauthorized state
        await supabase.auth.signOut();
        throw new Error('Access Denied: This account does not have administrator permissions.');
      }

      // 4. Update the global AuthProvider context
      await refreshProfile();
      setAdminPassword('');
      setAdminEmail('');
    } catch (err: any) {
      console.error('Admin Login failed:', err);
      setLoginError(err.message || 'Incorrect email or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleCreateBulkQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!univName || maxLimit <= 0) return;

    setCreatingBulk(true);
    try {
      const res = await createBulkQR(univName, maxLimit);
      if (res.success) {
        setUnivName('');
        setMaxLimit(50);
        // Refresh data
        await loadDashboardData();
      } else {
        alert(res.error || 'Failed to create bulk code.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingBulk(false);
    }
  };

  const handleDeactivateBulk = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this university group code? No further entry scans will be allowed.')) return;

    try {
      const res = await deactivateBulkQR(id);
      if (res.success) {
        await loadDashboardData();
      } else {
        alert(res.error || 'Failed to deactivate.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await exportRegistrationsCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ai_submit_registrations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Export failed.');
    }
  };

  const downloadBulkQR = (univName: string, token: string) => {
    // Hidden canvas download approach
    const container = document.createElement('div');
    document.body.appendChild(container);

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    container.appendChild(canvas);

    const renderedCanvas = document.getElementById(`qr-canvas-${token}`) as HTMLCanvasElement;
    if (renderedCanvas) {
      const pngUrl = renderedCanvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${univName.toLowerCase().replace(/\s+/g, '-')}-group-pass.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      alert('Unable to find preview canvas. Make sure the code is visible.');
    }

    document.body.removeChild(container);
  };

  // Client-side filtering logic
  const filteredRegs = registrations.filter((reg) => {
    const p = reg.profiles;
    const nameMatch = (p?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (p?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const univMatch = (p?.university || '').toLowerCase().includes(searchQuery.toLowerCase());
    const searchMatch = nameMatch || emailMatch || univMatch;

    const typeMatch = filterType === 'all' || p?.attendee_type === filterType;
    
    let checkMatch = true;
    if (filterCheckIn === 'yes') checkMatch = reg.checked_in;
    if (filterCheckIn === 'no') checkMatch = !reg.checked_in;

    return searchMatch && typeMatch && checkMatch;
  });

  const pageLoading = authLoading || (isAdmin && loading);

  if (pageLoading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Cpu className="w-10 h-10 text-[#2563EB] animate-spin" />
          <p className="text-sm font-mono text-slate-600 font-semibold">Verifying credentials and loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render Login Card if not admin
  if (!isAdmin) {
    return (
      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <Card hoverEffect={false} className="p-6 md:p-8 bg-white border-[#D2E0EE] shadow-lg text-left">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-12 h-12 rounded-lg bg-[#0B3A82] flex items-center justify-center mb-4 shadow-md shadow-[#0B3A82]/15">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display font-black text-xl md:text-2xl text-[#002060]">
                ADMINISTRATOR PORTAL
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 font-sans font-semibold">
                Sign in with staff credentials to manage passes
              </p>
            </div>

            {loginError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs md:text-sm flex items-start space-x-2 font-semibold">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 font-sans">
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    id="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@unaitech.com"
                    className="w-full bg-slate-50 border border-[#D2E0EE] rounded-lg pl-9 pr-4 py-2.5 text-[#002060] text-sm focus:outline-none focus:border-[#2563EB] font-semibold"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-[#D2E0EE] rounded-lg pl-9 pr-10 py-2.5 text-[#002060] text-sm focus:outline-none focus:border-[#2563EB] font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-[#002060] focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loginLoading || !adminEmail || !adminPassword}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold h-11"
                >
                  {loginLoading ? 'Signing in...' : 'Sign In as Staff'}
                </Button>
              </div>

              <div className="pt-2 text-center">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => router.push('/')}
                  className="border-[#D2E0EE] text-[#002060] bg-white hover:bg-slate-50 font-semibold"
                >
                  Back to Home
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Otherwise render the full admin dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-left">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#D2E0EE] pb-6 gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-[#0B3A82] font-bold bg-[#0B3A82]/10 px-2 py-0.5 border border-[#0B3A82]/20 rounded">
            ADMIN STAFF PORTAL
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-black text-[#002060] mt-2 uppercase">
            Event Registration & Passes Dashboard
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm" onClick={loadDashboardData} className="border-[#D2E0EE] text-[#002060] bg-white hover:bg-slate-50 font-bold">
            Refresh Data
          </Button>
          <Button variant="primary" size="sm" className="gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Registered', val: stats.totalRegistrations, icon: <Users className="w-5 h-5 text-[#2563EB]" /> },
          { label: 'Checked In (Indiv)', val: stats.checkedInIndividuals, icon: <CheckCircle className="w-5 h-5 text-emerald-600" /> },
          { label: 'Bulk QR Codes Issued', val: stats.totalBulkIssued, icon: <Ticket className="w-5 h-5 text-[#0B3A82]" /> },
          { label: 'Bulk Check-ins Used', val: stats.checkedInBulk, icon: <QrCode className="w-5 h-5 text-[#0B3A82]" /> },
        ].map((m, idx) => (
          <div key={idx} className="bg-white border border-[#D2E0EE] rounded-xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">{m.label}</span>
              <p className="font-mono text-2xl md:text-3xl font-black text-[#002060] mt-1">{m.val}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-[#D2E0EE]">{m.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bulk QR Manager Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card hoverEffect={false} className="p-6 space-y-5 bg-white border-[#D2E0EE] shadow-sm">
            <h3 className="font-display font-bold text-base md:text-lg text-[#002060] border-b border-slate-100 pb-2">
              Generate University Group QR
            </h3>

            <form onSubmit={handleCreateBulkQR} className="space-y-4 font-sans text-left">
              <div>
                <label htmlFor="univName" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  University Name
                </label>
                <input
                  type="text"
                  id="univName"
                  value={univName}
                  onChange={(e) => setUnivName(e.target.value)}
                  required
                  placeholder="e.g. SRM University"
                  className="w-full bg-slate-50 border border-[#D2E0EE] rounded-lg px-3 py-2 text-[#002060] text-sm focus:outline-none focus:border-[#2563EB] font-semibold"
                />
              </div>

              <div>
                <label htmlFor="maxLimit" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Max Scan Limit (Capped Uses)
                </label>
                <input
                  type="number"
                  id="maxLimit"
                  value={maxLimit}
                  onChange={(e) => setMaxLimit(parseInt(e.target.value) || 0)}
                  required
                  min={1}
                  placeholder="e.g. 50"
                  className="w-full bg-slate-50 border border-[#D2E0EE] rounded-lg px-3 py-2 text-[#002060] text-sm focus:outline-none focus:border-[#2563EB] font-semibold"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={creatingBulk || !univName || maxLimit <= 0}
                className="gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold h-11"
              >
                <Plus className="w-4.5 h-4.5" />
                {creatingBulk ? 'Generating...' : 'Create Group Pass'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Existing Group Pass List */}
        <div className="lg:col-span-2">
          <Card hoverEffect={false} className="p-6 h-full flex flex-col justify-between bg-white border-[#D2E0EE] shadow-sm">
            <div>
              <h3 className="font-display font-bold text-base md:text-lg text-[#002060] border-b border-slate-100 pb-2 mb-4">
                Active University Group Passes
              </h3>

              {bulkCodes.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-6 text-center font-semibold">No group passes issued yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 font-mono uppercase tracking-wider">
                        <th className="py-2.5">University</th>
                        <th className="py-2.5 text-center">Scans Used</th>
                        <th className="py-2.5 text-center">Status</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bulkCodes.map((code) => (
                        <tr key={code.id} className="hover:bg-slate-50">
                          <td className="py-3 font-bold text-[#002060]">{code.university_name}</td>
                          <td className="py-3 text-center font-mono font-bold text-[#476282]">
                            {code.current_count} / {code.max_limit}
                          </td>
                          <td className="py-3 text-center">
                            <Badge variant={code.status === 'active' ? 'success' : 'danger'}>
                              {code.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Preview canvas for downloading */}
                              <div className="hidden">
                                <QRCodeCanvas
                                  id={`qr-canvas-${code.qr_token}`}
                                  value={JSON.stringify({ type: 'bulk', token: code.qr_token })}
                                  size={150}
                                />
                              </div>
                              <button
                                onClick={() => downloadBulkQR(code.university_name, code.qr_token)}
                                title="Download QR Pass"
                                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {code.status === 'active' && (
                                <button
                                  onClick={() => handleDeactivateBulk(code.id)}
                                  title="Deactivate Code"
                                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Registrations List Table */}
      <Card hoverEffect={false} className="p-6 bg-white border-[#D2E0EE] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
          <h3 className="font-display font-black text-base md:text-lg text-[#002060] uppercase">
            Individual Attendees Registry ({filteredRegs.length})
          </h3>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative font-sans text-xs">
              <Search className="w-4 h-4 text-[#476282] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, university..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-[#D2E0EE] rounded-lg pl-9 pr-4 py-2.5 text-[#002060] w-48 md:w-56 focus:outline-none focus:border-[#2563EB] transition-all font-semibold"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-[#D2E0EE] rounded-lg px-3 py-2.5 text-xs text-[#002060] font-sans focus:outline-none focus:border-[#2563EB] font-semibold"
            >
              <option value="all">All Types</option>
              <option value="student">Students</option>
              <option value="professional">Professionals</option>
            </select>

            {/* Checked-In Filter */}
            <select
              value={filterCheckIn}
              onChange={(e) => setFilterCheckIn(e.target.value)}
              className="bg-slate-50 border border-[#D2E0EE] rounded-lg px-3 py-2.5 text-xs text-[#002060] font-sans focus:outline-none focus:border-[#2563EB] font-semibold"
            >
              <option value="all">All Status</option>
              <option value="yes">Checked In</option>
              <option value="no">Not Checked In</option>
            </select>
          </div>
        </div>

        {filteredRegs.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono py-10 text-center font-semibold">No matching registrations found.</p>
        ) : (
          <div className="overflow-x-auto font-semibold">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-mono uppercase tracking-wider">
                  <th className="py-3">Name</th>
                  <th className="py-3">Contact</th>
                  <th className="py-3">College / Organisation</th>
                  <th className="py-3">Type</th>
                  <th className="py-3 text-center">Checked In</th>
                  <th className="py-3 text-right">Registration Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredRegs.map((reg) => {
                  const p = reg.profiles;
                  return (
                    <tr key={reg.id} className="hover:bg-slate-50">
                      <td className="py-3.5 font-bold text-[#002060]">{p?.full_name || 'Anonymous'}</td>
                      <td className="py-3.5 text-slate-600 font-semibold">
                        <div>{p?.email}</div>
                        <div className="font-mono text-[10px] mt-0.5 text-slate-500">{p?.phone || '-'}</div>
                      </td>
                      <td className="py-3.5 text-[#0B3A82] font-bold">{p?.university || '-'}</td>
                      <td className="py-3.5 capitalize font-mono text-[11px] text-[#476282]">{p?.attendee_type || '-'}</td>
                      <td className="py-3.5 text-center">
                        {reg.checked_in ? (
                          <div className="flex flex-col items-center">
                            <Badge variant="success">YES</Badge>
                            <span className="text-[9px] font-mono text-slate-500 mt-1">
                              {reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="danger">NO</Badge>
                        )}
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-500">
                        {new Date(reg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
