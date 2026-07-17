'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Scan, CheckCircle, AlertTriangle, XCircle, ShieldAlert,
  Cpu, History, Camera, Keyboard
} from 'lucide-react';
import { validateScan, ScanResult } from '@/app/actions/scan';
import { getRecentScanLogs } from '@/app/actions/admin';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ScanLog } from '@/lib/types';
import type { Html5Qrcode } from 'html5-qrcode';

export default function AuthenticationPage() {
  const router = useRouter();

  // Scanner states
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Scan result overlay states
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Scan logs
  const [recentLogs, setRecentLogs] = useState<ScanLog[]>([]);
  const [logsError, setLogsError] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const resultTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadRecentLogs = async () => {
    try {
      const res = await getRecentScanLogs();
      if (res.success) {
        setRecentLogs((res.data || []) as unknown as ScanLog[]);
      } else {
        setLogsError(true);
      }
    } catch (err) {
      console.error(err);
      setLogsError(true);
    }
  };

  useEffect(() => {
    const logTimer = setTimeout(() => {
      loadRecentLogs();
    }, 0);
    
    // Clean up scanner on unmount
    return () => {
      clearTimeout(logTimer);
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch (e) {
          console.error('Scanner cleanup error:', e);
        }
      }
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    };
  }, []);

  // Start Camera scanning via html5-qrcode
  const startScanner = async () => {
    setPermissionError(null);
    setScanning(true);

    try {
      // Dynamically import to prevent SSR rendering issues
      const { Html5Qrcode } = await import('html5-qrcode');

      // Check if container exists
      const qrReader = document.getElementById('qr-reader');
      if (!qrReader) return;

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Success callback
          try {
            await html5QrCode.stop();
          } catch (e) {
            console.error('Stop error on decode:', e);
          }
          setScanning(false);
          await handleValidateScan(decodedText);
        },
        () => {
          // Keep logging/scanning errors quiet during active scanning
        }
      );

    } catch (err: unknown) {
      console.error('Camera init error:', err);
      setPermissionError(err instanceof Error ? err.message : 'Could not initialize camera. Ensure permission is granted.');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (e) {
        console.error(e);
      }
    }
    setScanning(false);
  };

  // Validate QR scan or manual input
  const handleValidateScan = async (code: string) => {
    if (!code.trim()) return;

    setProcessing(true);
    setShowResultPanel(true);
    setLastScanResult(null);

    // Clear previous auto-dismiss timers
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);

    try {
      const res = await validateScan(code);
      setLastScanResult(res);

      // Reload scan feed
      await loadRecentLogs();

      // Auto dismiss overlay after 8 seconds of inactivity if successful
      if (res.success) {
        resultTimerRef.current = setTimeout(() => {
          setShowResultPanel(false);
        }, 8000);
      }
    } catch (err) {
      console.error(err);
      setLastScanResult({
        success: false,
        resultType: 'invalid',
        message: 'Network error. Could not reach server.',
      });
    } finally {
      setProcessing(false);
      setManualCode('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleValidateScan(manualCode);
  };

  const getOverlayStyles = () => {
    if (processing) return 'border-[#D2E0EE] bg-white/95 text-[#002060]';
    if (!lastScanResult) return 'border-[#D2E0EE] bg-white/95';

    switch (lastScanResult.resultType) {
      case 'success':
        return 'border-emerald-500/50 bg-emerald-50/95 text-emerald-950';
      case 'already_used':
        return 'border-amber-500/50 bg-amber-50/95 text-amber-950';
      case 'expired':
        return 'border-red-500/50 bg-red-50/95 text-red-950';
      default:
        return 'border-red-500/50 bg-red-50/95 text-red-950';
    }
  };

  const getResultIcon = () => {
    if (processing) return <Cpu className="w-12 h-12 text-[#2563EB] animate-spin" />;
    if (!lastScanResult) return null;

    switch (lastScanResult.resultType) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-emerald-600" />;
      case 'already_used':
        return <AlertTriangle className="w-16 h-16 text-amber-600" />;
      default:
        return <XCircle className="w-16 h-16 text-red-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      {/* Header section */}
      <div className="border-b border-[#D2E0EE] pb-6 flex items-center justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-[#0B3A82] font-bold bg-[#0B3A82]/10 px-2 py-0.5 border border-[#0B3A82]/20 rounded">
            DOOR SCANNING TOOL
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-black text-[#002060] mt-2 uppercase">
            Attendee Verification Terminal
          </h1>
        </div>
        <Button variant="secondary" size="sm" onClick={() => router.push('/admin')} className="border-[#D2E0EE] text-[#002060] bg-white hover:bg-slate-50 font-bold">
          Admin Dashboard
        </Button>
      </div>

      {/* Main scanner grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Scanner Panel */}
        <Card hoverEffect={false} className="p-6 space-y-6 relative min-h-[380px] flex flex-col justify-between bg-white border-[#D2E0EE] shadow-sm">
          <div className="space-y-4 text-left">
            <h3 className="font-display font-bold text-base md:text-lg text-[#002060] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#2563EB]" />
              QR Reader Viewport
            </h3>

            {permissionError && (
              <div className="p-4 rounded bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2 font-semibold">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-600" />
                <span>{permissionError}</span>
              </div>
            )}

            {/* Viewfinder display */}
            <div className="bg-slate-50 border border-[#D2E0EE] rounded-xl aspect-square max-w-[280px] mx-auto overflow-hidden flex items-center justify-center relative">
              {scanning ? (
                <div id="qr-reader" className="w-full h-full" />
              ) : (
                <div className="text-center p-6 flex flex-col items-center space-y-3.5">
                  <Scan className="w-12 h-12 text-[#476282] animate-pulse" />
                  <p className="text-[11px] font-mono text-[#476282] font-semibold">
                    Camera is currently offline
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Trigger controls */}
          <div className="pt-4">
            {scanning ? (
              <Button variant="secondary" fullWidth onClick={stopScanner} className="border-[#D2E0EE] text-[#002060] bg-white hover:bg-slate-50 font-bold">
                Turn Camera Off
              </Button>
            ) : (
              <Button variant="primary" fullWidth onClick={startScanner} className="gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold">
                <Camera className="w-4.5 h-4.5" />
                Activate Camera
              </Button>
            )}
          </div>

          {/* Scan result overlay */}
          {showResultPanel && (
            <div className={`absolute inset-0 z-20 border rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${getOverlayStyles()}`}>
              <button
                onClick={() => setShowResultPanel(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-[#002060] font-bold text-sm cursor-pointer"
              >
                Close (Esc)
              </button>

              <div className="mb-4">
                {getResultIcon()}
              </div>

              {processing ? (
                <p className="font-mono text-sm">Verifying QR Token...</p>
              ) : (
                lastScanResult && (
                  <div className="space-y-2 max-w-xs">
                    <h3 className="font-display font-bold text-lg leading-tight uppercase">
                      {lastScanResult.success ? 'Access Granted' : 'Access Denied'}
                    </h3>
                    <p className="text-xs md:text-sm opacity-90 leading-relaxed font-sans font-medium">
                      {lastScanResult.message}
                    </p>
                    
                    {/* Additional meta */}
                    {lastScanResult.payload && (
                      <div className="font-mono text-[10px] opacity-75 border-t border-slate-200 pt-2 mt-2">
                        {lastScanResult.payload.attendeeName && (
                          <div>NAME: {lastScanResult.payload.attendeeName}</div>
                        )}
                        {lastScanResult.payload.universityName && (
                          <div>UNIV: {lastScanResult.payload.universityName}</div>
                        )}
                        {lastScanResult.payload.currentCount !== undefined && (
                          <div>SCANS: {lastScanResult.payload.currentCount} / {lastScanResult.payload.maxLimit}</div>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </Card>

        {/* Manual Input & Audit History */}
        <div className="space-y-6 text-left">
          {/* Manual Input card */}
          <Card hoverEffect={false} className="p-6 space-y-4 bg-white border-[#D2E0EE] shadow-sm">
            <h3 className="font-display font-bold text-base md:text-lg text-[#002060] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-[#2563EB]" />
              Manual Code Verification
            </h3>

            <form onSubmit={handleManualSubmit} className="flex gap-2 font-sans">
              <input
                type="text"
                placeholder="Enter QR token UUID..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-grow bg-slate-50 border border-[#D2E0EE] rounded-lg px-3 py-2 text-[#002060] text-xs font-mono focus:outline-none focus:border-[#2563EB] font-semibold"
              />
              <Button type="submit" variant="secondary" size="sm" className="h-10 border-[#D2E0EE] text-[#002060] bg-white hover:bg-slate-50 font-bold">
                Verify
              </Button>
            </form>
          </Card>

          {/* Audit Logs card */}
          <Card hoverEffect={false} className="p-6 flex flex-col justify-between min-h-[300px] bg-white border-[#D2E0EE] shadow-sm">
            <div>
              <h3 className="font-display font-bold text-base md:text-lg text-[#002060] border-b border-slate-100 pb-2 flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-[#0B3A82]" />
                Live Verification Feed
              </h3>

              {logsError ? (
                <p className="text-xs text-red-600 font-mono py-4">Failed to load scan feed.</p>
              ) : recentLogs.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-6 text-center font-semibold">No scans recorded today.</p>
              ) : (
                <div className="space-y-3 font-sans text-xs max-h-[220px] overflow-y-auto pr-1">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-slate-50 border border-[#D2E0EE] rounded-xl p-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 truncate text-left">
                        <div className="font-bold text-[#002060] truncate">
                          {log.qr_type === 'individual'
                            ? log.attendee_name || 'Individual Pass'
                            : `${log.university_name || 'University'} Group`}
                        </div>
                        <div className="font-mono text-[9px] text-[#476282] font-semibold flex items-center gap-1.5">
                          <span>{log.qr_type.toUpperCase()}</span>
                          <span>•</span>
                          <span>
                            {new Date(log.scanned_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Badge
                          variant={
                            log.result === 'success'
                              ? 'success'
                              : log.result === 'already_used'
                              ? 'ember'
                              : 'danger'
                          }
                        >
                          {log.result.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
