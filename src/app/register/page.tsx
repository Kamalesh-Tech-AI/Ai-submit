'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, ShieldAlert, CheckCircle, Info, Menu, Search, X, Edit3 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { completeRegistration, getReservedSeats } from '@/app/actions/register';
import Button from '@/components/ui/Button';

// Seat status types
type SeatStatus = 'available' | 'reserved' | 'accessible' | 'selected';

interface SeatConfig {
  row: string;
  seats: {
    number: number;
    accessible?: boolean;
  }[];
}

// Exact D7 Auditorium layout structure based on reference image:
// Row A: 1-14
// Row B: 1-14
// Row C: 1-14
// [Aisle Gap]
// Row D: 1-11 (Accessible seats: 2, 3, 6, 9, 10)
// Row E: 1-13
// Row F: 1-13
// Row G: 1-13
// Row H: 1-13
// Row I: 1-17 (with zoom icon on left)
const D7_AUDITORIUM_ROWS: SeatConfig[] = [
  { row: 'A', seats: Array.from({ length: 14 }, (_, i) => ({ number: i + 1 })) },
  { row: 'B', seats: Array.from({ length: 14 }, (_, i) => ({ number: i + 1 })) },
  { row: 'C', seats: Array.from({ length: 14 }, (_, i) => ({ number: i + 1 })) },
  // Row D has 11 seats, with specific accessible seats (2, 3, 6, 9, 10)
  {
    row: 'D',
    seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => ({
      number: num,
      accessible: [2, 3, 6, 9, 10].includes(num),
    })),
  },
  { row: 'E', seats: Array.from({ length: 13 }, (_, i) => ({ number: i + 1 })) },
  { row: 'F', seats: Array.from({ length: 13 }, (_, i) => ({ number: i + 1 })) },
  { row: 'G', seats: Array.from({ length: 13 }, (_, i) => ({ number: i + 1 })) },
  { row: 'H', seats: Array.from({ length: 13 }, (_, i) => ({ number: i + 1 })) },
  { row: 'I', seats: Array.from({ length: 17 }, (_, i) => ({ number: i + 1 })) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signInWithGoogle, signInAnonymously, refreshProfile } = useAuth();

  const [localLoading, setLocalLoading] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    university: '',
    attendeeType: 'student' as 'student' | 'professional',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch reserved seats from DB
  useEffect(() => {
    async function loadReserved() {
      const seats = await getReservedSeats();
      setReservedSeats(seats);
    }
    loadReserved();
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      if (profile && profile.phone && profile.university) {
        // If already completed registration, redirect
        router.push('/ticket');
      } else {
        setFormData((prev) => ({
          ...prev,
          fullName: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
          phone: profile?.phone || '',
          university: profile?.university || '',
          attendeeType: profile?.attendee_type || 'student',
        }));
        setNeedsProfile(true);
      }
    } else {
      setNeedsProfile(false);
    }
  }, [user, profile, authLoading, router]);

  const handleSeatClick = (seatCode: string, isReserved: boolean) => {
    if (isReserved) return;
    if (selectedSeat === seatCode) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seatCode);
      setErrorMsg(null);
    }
  };

  const handleNextClick = () => {
    if (!selectedSeat) {
      setErrorMsg('Please select a seat from the auditorium grid before proceeding.');
      return;
    }
    setErrorMsg(null);
    setShowCheckoutModal(true);
  };

  const handleGoogleSignIn = async () => {
    setLocalLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error('OAuth Error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to authenticate with Google.');
      setLocalLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLocalLoading(true);
    setErrorMsg(null);
    try {
      await signInAnonymously();
    } catch (err: unknown) {
      console.error('Anonymous Auth Error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to initialize anonymous session.');
      setLocalLoading(false);
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
      seatNumber: selectedSeat || undefined,
    });

    if (res.success) {
      await refreshProfile();
      router.push('/ticket');
    } else {
      setErrorMsg(res.error || 'Failed to complete registration.');
      setSubmitting(false);
    }
  };

  const loading = authLoading || localLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Cpu className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-sm font-mono text-neutral-400 font-semibold">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center select-none font-sans pb-12">
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl px-6 py-4 flex items-center justify-between border-b border-neutral-900">
        <div className="flex items-center space-x-1 font-black tracking-wider text-lg md:text-xl">
          <span className="text-red-600 font-extrabold">CH</span>
          <span className="text-white">TEST CINEMA</span>
        </div>
        <button className="text-amber-400 p-1 hover:text-amber-300 transition-colors" aria-label="Menu">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Select Seats Subheader */}
      <div className="w-full max-w-4xl flex items-center justify-center my-6 px-4">
        <div className="flex-1 border-t border-neutral-800"></div>
        <span className="px-6 text-xs md:text-sm tracking-widest text-neutral-400 uppercase font-medium">
          Select seats
        </span>
        <div className="flex-1 border-t border-neutral-800"></div>
      </div>

      {/* Main Movie / Event Title & Subtitles */}
      <div className="text-center px-4 mb-8">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight text-white mb-2">
          Hotel Transylvania 3: Summer Vacation
        </h1>
        <div className="flex items-center justify-center space-x-1.5 text-xs md:text-sm font-medium text-[#EAB308] mb-1">
          <span>Tuesday, Feb 25 @ 6:00 PM</span>
          <Edit3 className="w-3.5 h-3.5 inline cursor-pointer text-amber-400 hover:text-amber-300" />
        </div>
        <p className="text-xs md:text-sm font-medium text-[#EAB308]">
          123 Test Avenue , Fort Wayne 46802
        </p>
      </div>

      {/* Metallic Trapezoid Screen */}
      <div className="w-full max-w-2xl px-4 flex justify-center mb-10">
        <div
          className="w-full max-w-xl h-10 bg-gradient-to-b from-neutral-700 to-neutral-800 border-t border-neutral-600 flex items-center justify-center shadow-lg shadow-black/50"
          style={{ clipPath: 'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)' }}
        >
          <span className="text-xs md:text-sm font-semibold tracking-wider text-neutral-200">
            Screen 5
          </span>
        </div>
      </div>

      {/* Auditorium Seating Chart Container */}
      <div className="w-full max-w-5xl overflow-x-auto px-4 py-2 flex flex-col items-center">
        <div className="inline-block min-w-max space-y-2">
          {D7_AUDITORIUM_ROWS.map((rowConfig, rowIndex) => {
            const isRowD = rowConfig.row === 'D';
            const isRowI = rowConfig.row === 'I';

            return (
              <React.Fragment key={rowConfig.row}>
                {/* Aisle gap before Row D to match movie layout */}
                {isRowD && <div className="h-6"></div>}

                <div className="flex items-center justify-center space-x-2 md:space-x-2.5">
                  {/* Left Label area */}
                  <div className="w-6 flex items-center justify-end pr-1 text-xs font-bold text-neutral-300">
                    {isRowI && <Search className="w-4 h-4 text-neutral-400 mr-1 shrink-0" />}
                    <span>{rowConfig.row}</span>
                  </div>

                  {/* Seat Row Grid */}
                  <div className="flex items-center space-x-1.5 md:space-x-2">
                    {rowConfig.seats.map((seat) => {
                      const seatCode = `${rowConfig.row}${seat.number}`;
                      const isReserved = reservedSeats.includes(seatCode);
                      const isSelected = selectedSeat === seatCode;
                      const isAccessible = !!seat.accessible;

                      // Determine visual styling according to legend
                      let seatClass = 'bg-[#34D399] text-neutral-950 font-bold hover:brightness-110'; // Available green
                      if (isReserved) {
                        seatClass = 'bg-[#374151] text-neutral-500 cursor-not-allowed opacity-80'; // Reserved dark gray
                      } else if (isSelected) {
                        seatClass = 'bg-[#EAB308] text-black font-extrabold ring-2 ring-amber-300 scale-105'; // Selected yellow
                      } else if (isAccessible) {
                        seatClass = 'bg-[#2563EB] text-white font-bold hover:brightness-110'; // Accessible blue
                      }

                      return (
                        <button
                          key={seatCode}
                          onClick={() => handleSeatClick(seatCode, isReserved)}
                          disabled={isReserved}
                          title={`Seat ${seatCode} (${isReserved ? 'Reserved' : isAccessible ? 'Accessible' : 'Available'})`}
                          className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl text-[11px] md:text-xs flex items-center justify-center transition-all duration-150 ${seatClass}`}
                        >
                          {seat.number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-10 mb-8 px-4 text-xs md:text-sm text-neutral-300 font-medium">
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded bg-[#EAB308]"></span>
          <span>Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded bg-[#34D399]"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded bg-[#374151]"></span>
          <span>Reserved</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded bg-[#2563EB]"></span>
          <span>Accessible</span>
        </div>
      </div>

      {/* Selected Seat Indicator Banner if chosen */}
      {selectedSeat && (
        <div className="mb-4 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider animate-pulse">
          SELECTED SEAT: HALL D7 • SEAT {selectedSeat}
        </div>
      )}

      {/* Error message display if any */}
      {errorMsg && (
        <div className="mb-6 px-4 py-2 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs md:text-sm flex items-center space-x-2 max-w-md">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Action Button NEXT */}
      <div className="mb-12">
        <button
          onClick={handleNextClick}
          className="px-16 py-3 rounded-xl bg-[#ca8a04] hover:bg-[#a16207] active:scale-95 text-black font-extrabold text-sm md:text-base tracking-widest transition-all shadow-lg shadow-amber-900/30"
        >
          NEXT
        </button>
      </div>

      {/* Footer Navigation Links */}
      <footer className="w-full border-t border-neutral-900 pt-6 text-center text-xs text-neutral-500 flex items-center justify-center space-x-6">
        <a href="#" className="hover:text-neutral-400 transition-colors">Privacy policy</a>
        <a href="#" className="hover:text-neutral-400 transition-colors">Terms of use</a>
        <a href="#" className="hover:text-neutral-400 transition-colors">Purchase terms</a>
      </footer>

      {/* Checkout / Registration Form Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 text-center">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Complete Registration</h3>
              <p className="text-xs text-amber-400 font-mono font-bold mt-1">
                Reserved Seat: Hall D7 • Seat {selectedSeat}
              </p>
            </div>

            {/* If user is not authenticated: Show Google & Demo options */}
            {!user && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-400 text-center">
                  Sign in to confirm your ticket pass for Hall D7.
                </p>

                <Button
                  onClick={handleGoogleSignIn}
                  variant="secondary"
                  fullWidth
                  className="gap-2 py-3 bg-white text-black hover:bg-neutral-200 font-semibold"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-800"></div>
                  </div>
                  <span className="relative bg-neutral-900 px-3 text-[10px] uppercase font-bold text-neutral-500">
                    OR
                  </span>
                </div>

                <Button
                  onClick={handleAnonymousSignIn}
                  variant="secondary"
                  fullWidth
                  className="gap-2 py-3 border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-bold"
                >
                  Verify via Demo Account
                </Button>
              </div>
            )}

            {/* If user is authenticated: Show details form */}
            {user && (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="10-digit mobile number"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    College / Organisation
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Anna University"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Attendee Type
                  </label>
                  <select
                    name="attendeeType"
                    value={formData.attendeeType}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="student">Student / Research Scholar</option>
                    <option value="professional">Working Professional</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !formData.fullName || !formData.phone || !formData.university}
                    className="w-full py-3 rounded-xl bg-[#ca8a04] hover:bg-[#a16207] text-black font-extrabold text-sm tracking-wider transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Confirming Reservation...' : 'CONFIRM & GET PASS'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
