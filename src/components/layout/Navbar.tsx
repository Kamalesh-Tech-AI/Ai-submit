'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Cpu, LogOut, Ticket, Settings, Scan } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '../ui/Button';

import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchRole = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        if (data && !error) {
          setRole(data.role);
        }
      } catch (err) {
        console.error('Error fetching role in Navbar:', err);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchRole(session.user.id);
        } else {
          setRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
    <nav className="sticky top-0 z-50 glass-panel border-b border-border-card bg-ink/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo / Title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2.5 focus:outline-none">
              <div className="w-9 h-9 rounded-md bg-accent-signal flex items-center justify-center glow-signal">
                <Cpu className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="font-display font-bold text-lg md:text-xl tracking-wider text-text-primary">
                AI SUBMIT <span className="text-accent-signal">2026</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 focus:outline-none hover:text-accent-signal ${
                  isActive(link.href) ? 'text-accent-signal' : 'text-text-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Staff / Admin Links */}
            {(role === 'staff' || role === 'admin') && (
              <div className="flex items-center space-x-4 border-l border-border-card pl-4">
                <Link
                  href="/admin"
                  title="Admin Dashboard"
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-accent-ember ${
                    isActive('/admin') ? 'text-accent-ember' : 'text-text-muted'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
                <Link
                  href="/authentication"
                  title="Scan Check-in"
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-accent-ember ${
                    isActive('/authentication') ? 'text-accent-ember' : 'text-text-muted'
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
                    <Button variant="primary" size="sm" className="gap-2">
                      <Ticket className="w-4 h-4" />
                      My Ticket
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={handleLogout}
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Link href="/register">
                  <Button variant="primary" size="sm">
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
              className="inline-flex items-center justify-center p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-accent-signal"
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
        <div className="lg:hidden bg-surface border-b border-border-card">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-accent-signal bg-accent-signal/5 font-semibold'
                    : 'text-text-muted hover:text-text-primary hover:bg-ink'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {(role === 'staff' || role === 'admin') && (
              <div className="border-t border-border-card mt-2 pt-2 space-y-1">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive('/admin') ? 'text-accent-ember bg-accent-ember/5' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Settings className="w-4.5 h-4.5" />
                  <span>Admin Dashboard</span>
                </Link>
                <Link
                  href="/authentication"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive('/authentication') ? 'text-accent-ember bg-accent-ember/5' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Scan className="w-4.5 h-4.5" />
                  <span>Scan Check-in</span>
                </Link>
              </div>
            )}

            {/* Auth Actions in Mobile Menu */}
            <div className="border-t border-border-card pt-4 pb-2 px-3">
              {user ? (
                <div className="flex flex-col space-y-2">
                  <div className="text-xs text-text-muted px-1 truncate">
                    Signed in as <span className="font-semibold text-text-primary">{user.email}</span>
                  </div>
                  <Link href="/ticket" onClick={() => setIsOpen(false)} className="w-full">
                    <Button variant="primary" fullWidth className="gap-2">
                      <Ticket className="w-4.5 h-4.5" />
                      My Ticket
                    </Button>
                  </Link>
                  <Button variant="secondary" fullWidth className="gap-2" onClick={handleLogout}>
                    <LogOut className="w-4.5 h-4.5" />
                    Log Out
                  </Button>
                </div>
              ) : (
                <Link href="/register" onClick={() => setIsOpen(false)} className="w-full block">
                  <Button variant="primary" fullWidth>
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
