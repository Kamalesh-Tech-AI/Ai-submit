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
import type { Html5QrcodeScanner } from 'html5-qrcode';

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

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
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
          scannerRef.current.clear();
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
      const { Html5QrcodeScanner } = await import('html5-qrcode');

      // Check if container exists
      const qrReader = document.getElementById('qr-reader');
      if (!qrReader) return;

      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          aspectRatio: 1.0,
        },
        /* verbose= */ false
      );

      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          // Success callback
          scanner.clear(); // stop scanner on successful decode
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
        await scannerRef.current.clear();
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
    if (processing) return 'border-border-card bg-surface/90 text-text-primary';
    if (!lastScanResult) return 'border-border-card bg-surface/95';

    switch (lastScanResult.resultType) {
      case 'success':
        return 'border-emerald-500/50 bg-emerald-950/90 text-emerald-300';
      case 'already_used':
        return 'border-amber-500/50 bg-amber-950/90 text-amber-300';
      case 'expired':
        return 'border-red-500/50 bg-red-950/90 text-red-300';
      default:
        return 'border-red-500/50 bg-red-950/90 text-red-300';
    }
  };

  const getResultIcon = () => {
    if (processing) return <Cpu className="w-12 h-12 text-accent-signal animate-spin" />;
    if (!lastScanResult) return null;

    switch (lastScanResult.resultType) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-emerald-400" />;
      case 'already_used':
        return <AlertTriangle className="w-16 h-16 text-amber-400" />;
      default:
        return <XCircle className="w-16 h-16 text-red-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      {/* Header section */}
      <div className="border-b border-border-card pb-6 flex items-center justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-accent-ember font-semibold bg-accent-ember/10 px-2 py-0.5 border border-accent-ember/20 rounded">
            DOOR SCANNING TOOL
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary mt-2">
            Attendee Verification Terminal
          </h1>
        </div>
        <Button variant="secondary" size="sm" onClick={() => router.push('/admin')}>
          Admin Dashboard
        </Button>
      </div>

      {/* Main scanner grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Scanner Panel */}
        <Card hoverEffect={false} className="p-6 space-y-6 relative min-h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base md:text-lg text-text-primary border-b border-border-card pb-2 flex items-center gap-2">
              <Camera className="w-5 h-5 text-accent-signal" />
              QR Reader Viewport
            </h3>

            {permissionError && (
              <div className="p-4 rounded bg-red-500/5 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{permissionError}</span>
              </div>
            )}

            {/* Viewfinder display */}
            <div className="bg-ink border border-border-card rounded-md aspect-square max-w-[280px] mx-auto overflow-hidden flex items-center justify-center relative">
              {scanning ? (
                <div id="qr-reader" className="w-full h-full" />
              ) : (
                <div className="text-center p-6 flex flex-col items-center space-y-3.5">
                  <Scan className="w-12 h-12 text-text-muted animate-pulse" />
                  <p className="text-[11px] font-mono text-text-muted">
                    Camera is currently offline
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Trigger controls */}
          <div className="pt-4">
            {scanning ? (
              <Button variant="secondary" fullWidth onClick={stopScanner}>
                Turn Camera Off
              </Button>
            ) : (
              <Button variant="primary" fullWidth onClick={startScanner} className="gap-2">
                <Camera className="w-4.5 h-4.5" />
                Activate Camera
              </Button>
            )}
          </div>

          {/* Scan result overlay */}
          {showResultPanel && (
            <div className={`absolute inset-0 z-20 border rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all ${getOverlayStyles()}`}>
              <button
                onClick={() => setShowResultPanel(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary font-semibold text-sm cursor-pointer"
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
                    <h3 className="font-display font-bold text-lg leading-tight">
                      {lastScanResult.success ? 'Access Granted' : 'Access Denied'}
                    </h3>
                    <p className="text-xs md:text-sm opacity-90 leading-relaxed font-sans">
                      {lastScanResult.message}
                    </p>
                    
                    {/* Additional meta */}
                    {lastScanResult.payload && (
                      <div className="font-mono text-[10px] opacity-75 border-t border-white/10 pt-2 mt-2">
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
        <div className="space-y-6">
          {/* Manual Input card */}
          <Card hoverEffect={false} className="p-6 space-y-4">
            <h3 className="font-display font-bold text-base md:text-lg text-text-primary border-b border-border-card pb-2 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-accent-signal" />
              Manual Code Verification
            </h3>

            <form onSubmit={handleManualSubmit} className="flex gap-2 font-sans">
              <input
                type="text"
                placeholder="Enter QR token UUID..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-grow bg-ink border border-border-card rounded px-3 py-2 text-text-primary text-xs font-mono focus:outline-none focus:border-accent-signal"
              />
              <Button type="submit" variant="secondary" size="sm" className="h-10">
                Verify
              </Button>
            </form>
          </Card>

          {/* Audit Logs card */}
          <Card hoverEffect={false} className="p-6 flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="font-display font-bold text-base md:text-lg text-text-primary border-b border-border-card pb-2 flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-accent-ember" />
                Live Verification Feed
              </h3>

              {logsError ? (
                <p className="text-xs text-red-400 font-mono py-4">Failed to load scan feed.</p>
              ) : recentLogs.length === 0 ? (
                <p className="text-xs text-text-muted font-mono py-6 text-center">No scans recorded today.</p>
              ) : (
                <div className="space-y-3 font-sans text-xs max-h-[220px] overflow-y-auto pr-1">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-ink border border-border-card/45 rounded p-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 truncate">
                        <div className="font-semibold text-text-primary truncate">
                          {log.qr_type === 'individual'
                            ? log.attendee_name || 'Individual Pass'
                            : `${log.university_name || 'University'} Group`}
                        </div>
                        <div className="font-mono text-[9px] text-text-muted flex items-center gap-1.5">
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
