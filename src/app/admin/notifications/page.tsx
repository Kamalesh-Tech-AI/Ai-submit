'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, ArrowLeft, MessageSquare, Users, Filter,
  Clock, CheckCircle, AlertTriangle, History,
  ChevronDown, Eye, Cpu, Phone, PhoneOff, Zap
} from 'lucide-react';
import {
  getNotificationHistory,
  getRecipients,
  getUniqueUniversities,
  sendWhatsAppBlast,
} from '@/app/actions/notifications';
import {
  TEMPLATE_CONFIGS,
  resolveTemplate,
  type TemplateConfig,
} from '@/lib/notification-templates';
import { useAuth } from '@/components/providers/AuthProvider';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { NotificationLog } from '@/lib/types';

export default function NotificationsPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';

  // Template & message state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [resolvedMessage, setResolvedMessage] = useState('');

  // Filter state
  const [filterType, setFilterType] = useState('all');
  const [filterCheckIn, setFilterCheckIn] = useState('all');
  const [filterUniversity, setFilterUniversity] = useState('all');

  // Recipient state
  const [recipientStats, setRecipientStats] = useState({
    totalFiltered: 0,
    withPhone: 0,
    withoutPhone: 0,
  });
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  // University list
  const [universities, setUniversities] = useState<string[]>([]);

  // Campaign history
  const [history, setHistory] = useState<NotificationLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Sending state
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sendResult, setSendResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');

  // Load universities on mount
  useEffect(() => {
    if (isAdmin) {
      getUniqueUniversities().then((res) => {
        if (res.success && res.data) {
          setUniversities(res.data);
        }
      });
    }
  }, [isAdmin]);

  // Load history on mount
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await getNotificationHistory();
      if (res.success && res.data) {
        setHistory(res.data as unknown as NotificationLog[]);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadHistory();
    }
  }, [isAdmin, loadHistory]);

  // Fetch recipient count when filters change
  useEffect(() => {
    if (!isAdmin) return;

    const fetchRecipients = async () => {
      setLoadingRecipients(true);
      try {
        const res = await getRecipients({
          attendeeType: filterType,
          checkedIn: filterCheckIn,
          university: filterUniversity,
        });
        if (res.success && res.data) {
          setRecipientStats({
            totalFiltered: res.data.totalFiltered,
            withPhone: res.data.withPhone,
            withoutPhone: res.data.withoutPhone,
          });
        }
      } catch (err) {
        console.error('Failed to fetch recipients:', err);
      } finally {
        setLoadingRecipients(false);
      }
    };

    fetchRecipients();
  }, [isAdmin, filterType, filterCheckIn, filterUniversity]);

  // When template or placeholder values change, resolve the message
  useEffect(() => {
    if (selectedTemplate) {
      const resolved = resolveTemplate(selectedTemplate.messageBody, placeholderValues);
      setResolvedMessage(resolved);
    }
  }, [selectedTemplate, placeholderValues]);

  // When a template is selected, initialize placeholder values with defaults
  const handleSelectTemplate = (template: TemplateConfig) => {
    setSelectedTemplate(template);
    setSendResult(null);

    const defaults: Record<string, string> = {};
    template.placeholders.forEach((p) => {
      defaults[p.key] = p.defaultValue || '';
    });
    setPlaceholderValues(defaults);
  };

  // Handle placeholder value change
  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues((prev) => ({ ...prev, [key]: value }));
  };

  // Handle send
  const handleSend = async () => {
    if (!selectedTemplate) return;

    setShowConfirm(false);
    setSending(true);
    setSendResult(null);

    try {
      const result = await sendWhatsAppBlast({
        templateSlug: selectedTemplate.slug,
        templateName: selectedTemplate.name,
        resolvedMessage,
        filters: {
          attendeeType: filterType,
          checkedIn: filterCheckIn,
          university: filterUniversity,
        },
      });

      if (result.success) {
        setSendResult({
          type: 'success',
          message: result.message || `Successfully sent to ${result.recipientCount} recipients!`,
        });
        // Refresh history
        loadHistory();
      } else {
        setSendResult({
          type: 'error',
          message: result.error || 'Failed to send notifications.',
        });
      }
    } catch (err) {
      console.error('Send failed:', err);
      setSendResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
    } finally {
      setSending(false);
    }
  };

  // Category colors for badges
  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'reminder':
        return 'signal' as const;
      case 'update':
        return 'ember' as const;
      case 'seating':
        return 'success' as const;
      default:
        return 'muted' as const;
    }
  };

  if (authLoading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Cpu className="w-10 h-10 text-[#2563EB] animate-spin" />
          <p className="text-sm font-mono text-slate-600 font-semibold">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    router.push('/admin');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#D2E0EE] pb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#002060] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded">
              WHATSAPP NOTIFICATIONS
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-black text-[#002060] mt-2 uppercase">
              Mass Notification Center
            </h1>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-white border border-[#D2E0EE] rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'compose'
                ? 'bg-[#2563EB] text-white shadow'
                : 'text-slate-500 hover:text-[#002060]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Compose
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#2563EB] text-white shadow'
                : 'text-slate-500 hover:text-[#002060]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              History ({history.length})
            </span>
          </button>
        </div>
      </div>

      {/* Recipient Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#D2E0EE] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Total Filtered</span>
            <p className="font-mono text-2xl font-black text-[#002060] mt-1">
              {loadingRecipients ? '...' : recipientStats.totalFiltered}
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-[#D2E0EE]">
            <Users className="w-5 h-5 text-[#2563EB]" />
          </div>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-bold">With Phone Number</span>
            <p className="font-mono text-2xl font-black text-emerald-700 mt-1">
              {loadingRecipients ? '...' : recipientStats.withPhone}
            </p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <Phone className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 font-bold">No Phone (Skipped)</span>
            <p className="font-mono text-2xl font-black text-amber-700 mt-1">
              {loadingRecipients ? '...' : recipientStats.withoutPhone}
            </p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <PhoneOff className="w-5 h-5 text-amber-600" />
          </div>
        </div>
      </div>

      {/* COMPOSE TAB */}
      {activeTab === 'compose' && (
        <div className="space-y-8">
          {/* Filters Section */}
          <Card hoverEffect={false} className="p-6 bg-white border-[#D2E0EE] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-[#2563EB]" />
              <h3 className="font-display font-bold text-sm text-[#002060] uppercase tracking-wider">
                Recipient Filters
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Attendee Type
                </label>
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-slate-50 border border-[#D2E0EE] rounded-lg px-3 py-2.5 text-xs text-[#002060] font-sans focus:outline-none focus:border-[#2563EB] font-semibold appearance-none cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="student">Students Only</option>
                    <option value="professional">Professionals Only</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Check-in Status
                </label>
                <div className="relative">
                  <select
                    value={filterCheckIn}
                    onChange={(e) => setFilterCheckIn(e.target.value)}
                    className="w-full bg-slate-50 border border-[#D2E0EE] rounded-lg px-3 py-2.5 text-xs text-[#002060] font-sans focus:outline-none focus:border-[#2563EB] font-semibold appearance-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="yes">Checked In Only</option>
                    <option value="no">Not Checked In</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  University
                </label>
                <div className="relative">
                  <select
                    value={filterUniversity}
                    onChange={(e) => setFilterUniversity(e.target.value)}
                    className="w-full bg-slate-50 border border-[#D2E0EE] rounded-lg px-3 py-2.5 text-xs text-[#002060] font-sans focus:outline-none focus:border-[#2563EB] font-semibold appearance-none cursor-pointer"
                  >
                    <option value="all">All Universities</option>
                    {universities.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </Card>

          {/* Template Selector Grid */}
          <div>
            <h3 className="font-display font-bold text-sm text-[#002060] uppercase tracking-wider mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2563EB]" />
              Select Message Template
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATE_CONFIGS.map((template) => {
                const isSelected = selectedTemplate?.slug === template.slug;
                return (
                  <button
                    key={template.slug}
                    onClick={() => handleSelectTemplate(template)}
                    className={`text-left p-5 rounded-xl border-2 transition-all cursor-pointer group ${
                      isSelected
                        ? 'border-[#2563EB] bg-[#2563EB]/5 shadow-md shadow-[#2563EB]/10'
                        : 'border-[#D2E0EE] bg-white hover:border-[#2563EB]/40 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{template.icon}</span>
                      <Badge variant={categoryColor(template.category)}>
                        {template.category.toUpperCase()}
                      </Badge>
                    </div>
                    <h4 className={`font-display font-bold text-sm mb-1.5 transition-colors ${
                      isSelected ? 'text-[#2563EB]' : 'text-[#002060] group-hover:text-[#2563EB]'
                    }`}>
                      {template.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      {template.description}
                    </p>
                    {isSelected && (
                      <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">
                        <CheckCircle className="w-3 h-3" />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Editor & Preview */}
          {selectedTemplate && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Placeholder Editor */}
              <Card hoverEffect={false} className="p-6 bg-white border-[#D2E0EE] shadow-sm">
                <h3 className="font-display font-bold text-sm text-[#002060] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Fill Template Variables
                </h3>
                <div className="space-y-4">
                  {selectedTemplate.placeholders.map((placeholder) => (
                    <div key={placeholder.key}>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        {placeholder.label}
                        {placeholder.type === 'auto' && (
                          <span className="ml-2 text-emerald-600 normal-case">(auto-filled)</span>
                        )}
                      </label>
                      {placeholder.key === 'custom_message' || placeholder.key === 'day_highlights' ? (
                        <textarea
                          value={placeholderValues[placeholder.key] || ''}
                          onChange={(e) => handlePlaceholderChange(placeholder.key, e.target.value)}
                          rows={3}
                          className="w-full bg-slate-50 border border-[#D2E0EE] rounded-lg px-3 py-2.5 text-xs text-[#002060] font-sans focus:outline-none focus:border-[#2563EB] font-semibold resize-none"
                          placeholder={`Enter ${placeholder.label.toLowerCase()}...`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={placeholderValues[placeholder.key] || ''}
                          onChange={(e) => handlePlaceholderChange(placeholder.key, e.target.value)}
                          className="w-full bg-slate-50 border border-[#D2E0EE] rounded-lg px-3 py-2.5 text-xs text-[#002060] font-sans focus:outline-none focus:border-[#2563EB] font-semibold"
                          placeholder={`Enter ${placeholder.label.toLowerCase()}...`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Message Preview */}
              <Card hoverEffect={false} className="p-6 bg-white border-[#D2E0EE] shadow-sm flex flex-col">
                <h3 className="font-display font-bold text-sm text-[#002060] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#2563EB]" />
                  Message Preview
                </h3>

                {/* WhatsApp-style message bubble */}
                <div className="flex-grow bg-[#ECE5DD] rounded-xl p-4 min-h-[200px]">
                  <div className="bg-[#DCF8C6] rounded-lg rounded-tl-none p-4 max-w-[90%] shadow-sm">
                    <p className="text-sm text-[#111B21] leading-relaxed whitespace-pre-wrap font-sans">
                      {resolvedMessage || 'Select a template and fill in the placeholders to preview...'}
                    </p>
                    <div className="text-right mt-2">
                      <span className="text-[10px] text-[#667781]">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                      </span>
                    </div>
                  </div>
                </div>

                {/* Send Section */}
                <div className="mt-6 space-y-3">
                  {sendResult && (
                    <div
                      className={`p-4 rounded-xl border text-xs font-semibold flex items-start gap-2 ${
                        sendResult.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      {sendResult.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      )}
                      <span>{sendResult.message}</span>
                    </div>
                  )}

                  {!showConfirm ? (
                    <Button
                      onClick={() => setShowConfirm(true)}
                      variant="primary"
                      fullWidth
                      disabled={sending || recipientStats.withPhone === 0 || !resolvedMessage}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-sm"
                    >
                      <Send className="w-4 h-4" />
                      Send WhatsApp Blast to {recipientStats.withPhone} Recipients
                    </Button>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-amber-900">Confirm Send</p>
                          <p className="text-xs text-amber-700 mt-1 font-medium">
                            This will send a WhatsApp message to <strong>{recipientStats.withPhone}</strong> recipients
                            via your N8N webhook. This action cannot be undone.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleSend}
                          variant="primary"
                          disabled={sending}
                          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex-1"
                        >
                          {sending ? (
                            <>
                              <Cpu className="w-4 h-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Yes, Send Now
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => setShowConfirm(false)}
                          variant="secondary"
                          disabled={sending}
                          className="border-amber-300 text-amber-800 bg-white hover:bg-amber-50 font-bold"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <Card hoverEffect={false} className="p-6 bg-white border-[#D2E0EE] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-base text-[#002060] uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-[#2563EB]" />
              Campaign History
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadHistory}
              disabled={loadingHistory}
              className="border-[#D2E0EE] text-[#002060] bg-white hover:bg-slate-50 font-bold"
            >
              {loadingHistory ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-slate-500 font-semibold">No notification campaigns sent yet.</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Switch to the Compose tab to send your first WhatsApp blast.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-mono uppercase tracking-wider">
                    <th className="py-3">Template</th>
                    <th className="py-3">Message Preview</th>
                    <th className="py-3 text-center">Recipients</th>
                    <th className="py-3 text-center">Status</th>
                    <th className="py-3 text-right">Sent At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3.5 font-bold text-[#002060] max-w-[150px]">
                        {log.template_name}
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium max-w-[300px]">
                        <p className="truncate" title={log.message_sent}>
                          {log.message_sent}
                        </p>
                      </td>
                      <td className="py-3.5 text-center font-mono font-bold text-[#002060]">
                        {log.recipient_count}
                      </td>
                      <td className="py-3.5 text-center">
                        <Badge
                          variant={
                            log.status === 'sent'
                              ? 'success'
                              : log.status === 'partial'
                              ? 'ember'
                              : 'danger'
                          }
                        >
                          {log.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-500">
                        <div>
                          {new Date(log.sent_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(log.sent_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
