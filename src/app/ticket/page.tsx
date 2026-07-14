'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, Calendar, MapPin, CheckCircle, Info, Ticket } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
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

  const [loading, setLoading] = useState(true);
  const [ticketData, setTicketData] = useState<TicketDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/register');
          return;
        }

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
          .eq('user_id', session.user.id)
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
  }, [supabase, router]);

  if (loading) {
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
      <div className="w-full max-w-md">
        {/* Pass Frame Container */}
        <Card hoverEffect={false} className="p-0 border-border-card overflow-hidden shadow-2xl relative">
          
          {/* Header segment */}
          <div className="bg-surface border-b border-border-card p-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-accent-signal" />
              <span className="font-display font-bold text-xs uppercase tracking-widest text-text-muted">
                CONFERENCE ENTRY PASS
              </span>
            </div>
            {ticketData.checked_in ? (
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase px-2 py-0.5 rounded">
                Verified In
              </span>
            ) : (
              <span className="bg-accent-signal/10 border border-accent-signal/20 text-accent-signal text-[10px] font-mono uppercase px-2 py-0.5 rounded">
                Active Pass
              </span>
            )}
          </div>

          {/* Body segment */}
          <div className="p-6 flex flex-col items-center">
            {/* Attendee Metadata */}
            <div className="text-center mb-6">
              <h2 className="font-display font-bold text-xl md:text-2xl text-text-primary">
                {profile?.full_name || 'Attendee'}
              </h2>
              <p className="text-xs text-text-muted font-mono mt-1">
                {profile?.email}
              </p>
              <p className="text-xs text-accent-ember font-semibold mt-1">
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
              <div className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded p-4 flex items-start space-x-3 text-emerald-400">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider">Checked In</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Verified at the door. Check-in registered on{' '}
                    <span className="font-mono text-emerald-400">
                      {new Date(ticketData.checked_in_at || '').toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full bg-surface border border-border-card rounded p-4 flex items-start space-x-3 text-text-muted">
                <Info className="w-5 h-5 text-accent-signal shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
                    Entry instructions
                  </h4>
                  <p className="text-[11px] leading-relaxed mt-0.5">
                    Show this QR code to the event staff at the IIT Madras Research Park entrance on Feb 15. Single-use only.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer segment recap */}
          <div className="bg-ink border-t border-border-card px-6 py-4 flex justify-between items-center text-[10px] font-mono text-text-muted">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-accent-signal" />
              <span>FEB 15 & 16</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-accent-signal" />
              <span>IITM RP, CHENNAI</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
