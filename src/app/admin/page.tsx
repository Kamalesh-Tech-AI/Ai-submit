'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, CheckCircle, Ticket, Plus, Download,
  Search, ShieldAlert, Cpu, Ban, QrCode
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  getAdminStats, getRegistrations, getBulkQRCodes,
  createBulkQR, deactivateBulkQR, exportRegistrationsCSV
} from '@/app/actions/admin';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Registration, BulkQRCode } from '@/lib/types';

export default function AdminPage() {
  const router = useRouter();

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

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDashboardData]);

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

    // Draw on canvas via standard qrcode.react drawing would require mounting it, 
    // or we can just search for the SVG/canvas on the page.
    // Instead of making a complex canvas draw, we can look up if we render a small preview canvas.
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

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <Cpu className="w-10 h-10 text-accent-ember animate-spin glow-ember" />
          <p className="text-sm font-mono text-text-muted">Loading administrator dashboard...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex-grow flex items-center justify-center px-4">
        <Card hoverEffect={false} className="max-w-md p-6 text-center border-red-500/30">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-display font-bold text-lg text-red-400 mb-2">Access Denied</h3>
          <p className="text-sm text-text-muted mb-4">{errorMsg}</p>
          <Button variant="secondary" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border-card pb-6 gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-accent-ember font-semibold bg-accent-ember/10 px-2 py-0.5 border border-accent-ember/20 rounded">
            ADMIN STAFF PORTAL
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary mt-2">
            Event Registration & Passes Dashboard
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm" onClick={loadDashboardData}>
            Refresh Data
          </Button>
          <Button variant="ember" size="sm" className="gap-1.5" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Registered', val: stats.totalRegistrations, icon: <Users className="w-5 h-5 text-accent-signal" /> },
          { label: 'Checked In (Indiv)', val: stats.checkedInIndividuals, icon: <CheckCircle className="w-5 h-5 text-emerald-400" /> },
          { label: 'Bulk QR Codes Issued', val: stats.totalBulkIssued, icon: <Ticket className="w-5 h-5 text-accent-ember" /> },
          { label: 'Bulk Check-ins Used', val: stats.checkedInBulk, icon: <QrCode className="w-5 h-5 text-accent-ember" /> },
        ].map((m, idx) => (
          <div key={idx} className="bg-surface border border-border-card rounded-lg p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">{m.label}</span>
              <p className="font-mono text-2xl md:text-3xl font-bold text-text-primary mt-1">{m.val}</p>
            </div>
            <div className="bg-ink p-3 rounded-md border border-border-card">{m.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bulk QR Manager Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card hoverEffect={false} className="p-6 space-y-5">
            <h3 className="font-display font-bold text-base md:text-lg text-text-primary border-b border-border-card pb-2">
              Generate University Group QR
            </h3>

            <form onSubmit={handleCreateBulkQR} className="space-y-4 font-sans text-left">
              <div>
                <label htmlFor="univName" className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                  University Name
                </label>
                <input
                  type="text"
                  id="univName"
                  value={univName}
                  onChange={(e) => setUnivName(e.target.value)}
                  required
                  placeholder="e.g. SRM University"
                  className="w-full bg-ink border border-border-card rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-signal"
                />
              </div>

              <div>
                <label htmlFor="maxLimit" className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
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
                  className="w-full bg-ink border border-border-card rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-signal"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={creatingBulk || !univName || maxLimit <= 0}
                className="gap-2 font-semibold"
              >
                <Plus className="w-4.5 h-4.5" />
                {creatingBulk ? 'Generating...' : 'Create Group Pass'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Existing Group Pass List */}
        <div className="lg:col-span-2">
          <Card hoverEffect={false} className="p-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-base md:text-lg text-text-primary border-b border-border-card pb-2 mb-4">
                Active University Group Passes
              </h3>

              {bulkCodes.length === 0 ? (
                <p className="text-xs text-text-muted font-mono py-6 text-center">No group passes issued yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-border-card text-text-muted font-mono uppercase tracking-wider">
                        <th className="py-2.5">University</th>
                        <th className="py-2.5 text-center">Scans Used</th>
                        <th className="py-2.5 text-center">Status</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-card/30">
                      {bulkCodes.map((code) => (
                        <tr key={code.id} className="hover:bg-surface/50">
                          <td className="py-3 font-semibold text-text-primary">{code.university_name}</td>
                          <td className="py-3 text-center font-mono font-medium">
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
                                className="p-1 rounded hover:bg-ink text-text-muted hover:text-accent-signal transition-colors cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {code.status === 'active' && (
                                <button
                                  onClick={() => handleDeactivateBulk(code.id)}
                                  title="Deactivate Code"
                                  className="p-1 rounded hover:bg-ink text-text-muted hover:text-red-400 transition-colors cursor-pointer"
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
      <Card hoverEffect={false} className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border-card pb-4 mb-6 gap-4">
          <h3 className="font-display font-bold text-base md:text-lg text-text-primary">
            Individual Attendees Registry ({filteredRegs.length})
          </h3>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative font-sans text-xs">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, university..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-ink border border-border-card rounded-md pl-9 pr-4 py-2.5 text-text-primary w-48 md:w-56 focus:outline-none focus:border-accent-signal transition-all"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-ink border border-border-card rounded-md px-3 py-2.5 text-xs text-text-primary font-sans focus:outline-none focus:border-accent-signal"
            >
              <option value="all">All Types</option>
              <option value="student">Students</option>
              <option value="professional">Professionals</option>
            </select>

            {/* Checked-In Filter */}
            <select
              value={filterCheckIn}
              onChange={(e) => setFilterCheckIn(e.target.value)}
              className="bg-ink border border-border-card rounded-md px-3 py-2.5 text-xs text-text-primary font-sans focus:outline-none focus:border-accent-signal"
            >
              <option value="all">All Status</option>
              <option value="yes">Checked In</option>
              <option value="no">Not Checked In</option>
            </select>
          </div>
        </div>

        {filteredRegs.length === 0 ? (
          <p className="text-xs text-text-muted font-mono py-10 text-center">No matching registrations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-border-card text-text-muted font-mono uppercase tracking-wider">
                  <th className="py-3">Name</th>
                  <th className="py-3">Contact</th>
                  <th className="py-3">College / Organisation</th>
                  <th className="py-3">Type</th>
                  <th className="py-3 text-center">Checked In</th>
                  <th className="py-3 text-right">Registration Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card/30">
                 {filteredRegs.map((reg) => {
                  const p = reg.profiles;
                  return (
                    <tr key={reg.id} className="hover:bg-surface/50">
                      <td className="py-3.5 font-semibold text-text-primary">{p?.full_name || 'Anonymous'}</td>
                      <td className="py-3.5 text-text-muted">
                        <div>{p?.email}</div>
                        <div className="font-mono text-[10px] mt-0.5">{p?.phone || '-'}</div>
                      </td>
                      <td className="py-3.5 text-accent-ember font-medium">{p?.university || '-'}</td>
                      <td className="py-3.5 capitalize font-mono text-[11px]">{p?.attendee_type || '-'}</td>
                      <td className="py-3.5 text-center">
                        {reg.checked_in ? (
                          <div className="flex flex-col items-center">
                            <Badge variant="success">YES</Badge>
                            <span className="text-[9px] font-mono text-text-muted mt-1">
                              {reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="danger">NO</Badge>
                        )}
                      </td>
                      <td className="py-3.5 text-right font-mono text-text-muted">
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
