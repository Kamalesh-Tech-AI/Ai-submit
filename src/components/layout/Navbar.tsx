'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Cpu, LogOut, Ticket, Settings, Scan } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import Button from '../ui/Button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();

  const role = profile?.role || null;

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Chief Guests', href: '/chief-guests' },
    { label: 'Agenda', href: '/agenda' },
    { label: 'Venue', href: '/venue' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 border-b border-[#D2E0EE] shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo / Title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2.5 focus:outline-none">
              <div className="w-9 h-9 rounded-md bg-[#2563EB] flex items-center justify-center shadow-sm shadow-[#2563EB]/25">
                <Cpu className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="font-display font-black text-lg md:text-xl tracking-wider text-[#002060]">
                AI SUBMIT <span className="text-[#2563EB]">2026</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold tracking-wide transition-colors duration-200 focus:outline-none ${
                  isActive(link.href) ? 'text-[#2563EB]' : 'text-[#476282] hover:text-[#2563EB]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Staff / Admin Links */}
            {(role === 'staff' || role === 'admin') && (
              <div className="flex items-center space-x-4 border-l border-[#D2E0EE] pl-4">
                <Link
                  href="/admin"
                  title="Admin Dashboard"
                  className={`flex items-center space-x-1 text-sm font-semibold transition-colors ${
                    isActive('/admin') ? 'text-[#0B3A82]' : 'text-[#476282] hover:text-[#0B3A82]'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
                <Link
                  href="/authentication"
                  title="Scan Check-in"
                  className={`flex items-center space-x-1 text-sm font-semibold transition-colors ${
                    isActive('/authentication') ? 'text-[#0B3A82]' : 'text-[#476282] hover:text-[#0B3A82]'
                  }`}
                >
                  <Scan className="w-4 h-4" />
                  <span>Scan</span>
                </Link>
              </div>
            )}

            {/* Auth CTAs */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <Link href="/ticket">
                    <Button variant="primary" size="sm" className="gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                      <Ticket className="w-4 h-4" />
                      My Ticket
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 border-[#D2E0EE] text-[#002060] bg-slate-50 hover:bg-slate-100"
                    onClick={handleLogout}
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Link href="/register">
                  <Button variant="primary" size="sm" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                    Register — Free
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile hamburger menu */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#476282] hover:text-[#002060] hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-[#D2E0EE]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'text-[#2563EB] bg-[#2563EB]/5'
                    : 'text-[#476282] hover:text-[#002060] hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {(role === 'staff' || role === 'admin') && (
              <div className="border-t border-[#D2E0EE] mt-2 pt-2 space-y-1">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                    isActive('/admin') ? 'text-[#0B3A82] bg-[#0B3A82]/5' : 'text-[#476282] hover:text-[#002060]'
                  }`}
                >
                  <Settings className="w-4.5 h-4.5" />
                  <span>Admin Dashboard</span>
                </Link>
                <Link
                  href="/authentication"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                    isActive('/authentication') ? 'text-[#0B3A82] bg-[#0B3A82]/5' : 'text-[#476282] hover:text-[#002060]'
                  }`}
                >
                  <Scan className="w-4.5 h-4.5" />
                  <span>Scan Check-in</span>
                </Link>
              </div>
            )}

            {/* Auth Actions in Mobile Menu */}
            <div className="border-t border-[#D2E0EE] pt-4 pb-2 px-3">
              {user ? (
                <div className="flex flex-col space-y-2">
                  <div className="text-xs text-[#476282] px-1 truncate">
                    Signed in as <span className="font-bold text-[#002060]">{user.email}</span>
                  </div>
                  <Link href="/ticket" onClick={() => setIsOpen(false)} className="w-full">
                    <Button variant="primary" fullWidth className="gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                      <Ticket className="w-4.5 h-4.5" />
                      My Ticket
                    </Button>
                  </Link>
                  <Button variant="secondary" fullWidth className="gap-2 border-[#D2E0EE] text-[#002060] bg-slate-50 hover:bg-slate-100" onClick={handleLogout}>
                    <LogOut className="w-4.5 h-4.5" />
                    Log Out
                  </Button>
                </div>
              ) : (
                <Link href="/register" onClick={() => setIsOpen(false)} className="w-full block">
                  <Button variant="primary" fullWidth className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                    Register — Free
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
