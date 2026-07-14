'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { completeRegistration } from '@/app/actions/register';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { User } from '@supabase/supabase-js';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    university: '',
    attendeeType: 'student' as 'student' | 'professional',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkProfile = async (userId: string) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('Profile fetch error:', error);
          setErrorMsg('Could not fetch registration details.');
          setLoading(false);
          return;
        }

        if (!profile || !profile.phone || !profile.university) {
          // Needs profile completion
          setFormData({
            fullName: profile?.full_name || sessionUser?.user_metadata?.full_name || sessionUser?.user_metadata?.name || '',
            phone: profile?.phone || '',
            university: profile?.university || '',
            attendeeType: profile?.attendee_type || 'student',
          });
          setNeedsProfile(true);
        } else {
          // Profile is complete, direct to ticket
          router.push('/ticket');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Error checking account status.');
      } finally {
        setLoading(false);
      }
    };

    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSessionUser(session.user);
        checkProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setSessionUser(session.user);
        checkProfile(session.user.id);
      } else {
        setSessionUser(null);
        setNeedsProfile(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, sessionUser?.user_metadata?.full_name, sessionUser?.user_metadata?.name]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/register`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      console.error('OAuth Error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to authenticate with Google.');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.university) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const res = await completeRegistration({
      fullName: formData.fullName,
      phone: formData.phone,
      university: formData.university,
      attendeeType: formData.attendeeType,
    });

    setSubmitting(false);

    if (res.success) {
      router.push('/ticket');
    } else {
      setErrorMsg(res.error || 'Failed to complete registration.');
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <Cpu className="w-10 h-10 text-accent-signal animate-spin glow-signal" />
          <p className="text-sm font-mono text-text-muted">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Card hoverEffect={false} className="p-6 md:p-8">
          {/* Header branding */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-lg bg-accent-signal flex items-center justify-center mb-4 shadow-md shadow-accent-signal/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-display font-bold text-xl md:text-2xl text-text-primary">
              AI SUBMIT 2026
            </h2>
            <p className="text-xs text-text-muted mt-1.5 font-sans">
              IITM Research Park • Chennai, India
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded bg-red-500/5 border border-red-500/20 text-red-400 text-xs md:text-sm flex items-start space-x-2">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Flow 1: Not Signed In — Show Google OAuth button */}
          {!sessionUser && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-display font-bold text-sm text-text-primary">
                  Conference Registration
                </h3>
                <p className="text-xs text-text-muted mt-1 font-sans">
                  Sign in with Google. Access is completely free for all verified participants.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleGoogleSignIn}
                  variant="secondary"
                  fullWidth
                  className="gap-2.5 py-3 h-12 bg-white text-black hover:bg-gray-100 border-transparent font-semibold shadow-md"
                >
                  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </Button>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded bg-surface border border-border-card text-[11px] text-text-muted leading-relaxed font-sans mt-4">
                <Info className="w-4 h-4 text-accent-signal shrink-0 mt-0.5" />
                <span>By signing up, you will immediately receive an individual entrance pass with a secure QR code.</span>
              </div>
            </div>
          )}

          {/* Flow 2: Signed In but profile incomplete — Show details form */}
          {sessionUser && needsProfile && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Google Account Authenticated</span>
                </div>
                <h3 className="font-display font-bold text-sm text-text-primary">
                  Complete Profile
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Provide your academic/professional details to issue your QR pass.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-left">
                <div>
                  <label htmlFor="fullName" className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full bg-ink border border-border-card rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-signal"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="10-digit mobile number"
                    className="w-full bg-ink border border-border-card rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-signal"
                  />
                </div>

                <div>
                  <label htmlFor="university" className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                    College / Organisation
                  </label>
                  <input
                    type="text"
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Anna University"
                    className="w-full bg-ink border border-border-card rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-signal"
                  />
                </div>

                <div>
                  <label htmlFor="attendeeType" className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                    Attendee Type
                  </label>
                  <select
                    id="attendeeType"
                    name="attendeeType"
                    value={formData.attendeeType}
                    onChange={handleInputChange}
                    className="w-full bg-ink border border-border-card rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-signal"
                  >
                    <option value="student">Student / Research Scholar</option>
                    <option value="professional">Working Professional</option>
                  </select>
                </div>

                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={submitting || !formData.fullName || !formData.phone || !formData.university}
                    className="h-11 py-2.5 font-semibold"
                  >
                    {submitting ? 'Registering...' : 'Generate Entry Pass'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
