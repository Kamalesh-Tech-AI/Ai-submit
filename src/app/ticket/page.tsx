'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, Calendar, MapPin, CheckCircle, Info, Ticket } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import QRDisplay from '@/components/ui/QRDisplay';
import Card from '@/components/ui/Card';

interface TicketDetails {
  id: string;
  qr_token: string;
  checked_in: boolean;
  checked_in_at: string | null;
  profiles: {
    full_name: string | null;
    email: string | null;
    university: string | null;
    attendee_type: string;
  } | null;
}

export default function TicketPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [ticketData, setTicketData] = useState<TicketDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/register');
      return;
    }

    const fetchTicket = async () => {
      try {
        // Fetch profile and registration
        const { data: registration, error: regError } = await supabase
          .from('registrations')
          .select(`
            id,
            qr_token,
            checked_in,
            checked_in_at,
            profiles:user_id (
              full_name,
              email,
              university,
              attendee_type
            )
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (regError) {
          console.error(regError);
          setErrorMsg('Failed to load pass details.');
          return;
        }

        if (!registration) {
          // Signed in but registration row not created (profile form not completed)
          router.push('/register');
          return;
        }

        setTicketData(registration as unknown as TicketDetails);
      } catch (err) {
        console.error(err);
        setErrorMsg('An unexpected error occurred while loading ticket.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();

    // Subscribe to changes on their registration row so check-ins reflect live!
    const channel = supabase
      .channel('live-ticket-status')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'registrations' },
        (payload) => {
          setTicketData((prev) => {
            if (prev && payload.new.id === prev.id) {
              return {
                ...prev,
                checked_in: payload.new.checked_in,
                checked_in_at: payload.new.checked_in_at,
              };
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router, user, authLoading]);

  const displayLoading = authLoading || loading;

  if (displayLoading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <Cpu className="w-10 h-10 text-accent-signal animate-spin glow-signal" />
          <p className="text-sm font-mono text-text-muted">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !ticketData) {
    return (
      <div className="flex-grow flex items-center justify-center px-4">
        <Card hoverEffect={false} className="max-w-md p-6 text-center border-red-500/30">
          <h3 className="font-display font-bold text-lg text-red-400 mb-2">Error Loading Ticket</h3>
          <p className="text-sm text-text-muted mb-4">{errorMsg || 'No ticket found.'}</p>
          <button
            onClick={() => router.push('/register')}
            className="text-xs font-mono uppercase text-accent-signal hover:underline"
          >
            Go to Registration
          </button>
        </Card>
      </div>
    );
  }

  const profile = ticketData.profiles;
  // Generate the exact scan payload JSON as required:
  // Payload: { "type": "individual", "token": "<uuid>" }
  const qrPayload = JSON.stringify({
    type: 'individual',
    token: ticketData.qr_token,
  });

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-16 md:py-24">
      <div className="w-full max-w-md text-left">
        {/* Pass Frame Container */}
        <Card hoverEffect={false} className="p-0 border-[#D2E0EE] bg-white overflow-hidden shadow-xl relative rounded-2xl">
          
          {/* Header segment */}
          <div className="bg-[#F8FAFC] border-b border-[#D2E0EE] p-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-[#2563EB]" />
              <span className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">
                CONFERENCE ENTRY PASS
              </span>
            </div>
            {ticketData.checked_in ? (
              <span className="bg-emerald-50 border border-emerald-250 text-emerald-700 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded">
                Verified In
              </span>
            ) : (
              <span className="bg-[#2563EB]/10 border border-[#2563EB]/25 text-[#2563EB] text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded">
                Active Pass
              </span>
            )}
          </div>

          {/* Body segment */}
          <div className="p-6 flex flex-col items-center">
            {/* Attendee Metadata */}
            <div className="text-center mb-6">
              <h2 className="font-display font-black text-xl md:text-2xl text-[#002060]">
                {profile?.full_name || 'Attendee'}
              </h2>
              <p className="text-xs text-[#476282] font-mono font-bold mt-1">
                {profile?.email}
              </p>
              <p className="text-xs text-[#0B3A82] font-bold mt-1">
                {profile?.university}
              </p>
            </div>

            {/* Live QR generator display */}
            <div className="mb-6">
              <QRDisplay
                value={qrPayload}
                size={180}
                label={`${profile?.full_name?.toLowerCase().replace(/\s+/g, '-') || 'pass'}-ai-submit-pass`}
              />
            </div>

            {/* Check-in status display */}
            {ticketData.checked_in ? (
              <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3 text-emerald-800 font-semibold">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-emerald-950">Checked In</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Verified at the door. Check-in registered on{' '}
                    <span className="font-mono text-emerald-700 font-bold">
                      {new Date(ticketData.checked_in_at || '').toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full bg-slate-50 border border-[#D2E0EE] rounded-xl p-4 flex items-start space-x-3 text-slate-600 font-medium">
                <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#002060]">
                    Entry instructions
                  </h4>
                  <p className="text-[11px] leading-relaxed mt-0.5">
                    Show this QR code to the event staff at the IIT Madras Research Park entrance on Aug 20. Single-use only.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer segment recap */}
          <div className="bg-[#F8FAFC] border-t border-[#D2E0EE] px-6 py-4 flex justify-between items-center text-[10px] font-mono text-[#476282] font-bold">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>AUG 20 & 21</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>IITM RP, CHENNAI</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
