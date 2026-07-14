import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Award, BookOpen, Users, ArrowRight } from 'lucide-react';
import CountdownTimer from '@/components/ui/CountdownTimer';
import CircuitBackground from '@/components/ui/CircuitBackground';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function LandingPage() {
  const quickFacts = [
    { icon: <Award className="w-6 h-6 text-accent-ember" />, title: 'Free Entry', desc: 'Google Sign-in Required' },
    { icon: <Users className="w-6 h-6 text-accent-signal" />, title: 'Chief Guests', desc: '6+ Industry Pioneers' },
    { icon: <BookOpen className="w-6 h-6 text-accent-signal" />, title: 'Interactive Agenda', desc: '2-Day Practical Tracks' },
    { icon: <Award className="w-6 h-6 text-accent-ember" />, title: 'E-Certificate', desc: 'Given to All Attendees' },
  ];

  const previews = [
    {
      title: 'About the Conference',
      desc: 'Discover how AI Submit 2026 helps students and young developers bridge the gap between AI theory and real-world deployment.',
      link: '/about',
      actionText: 'Read Mission',
      accent: 'signal' as const,
    },
    {
      title: 'Chief Guests & Speakers',
      desc: 'Meet our lineup of researchers, founders, and architects from companies like UNAI Tech, Cognitive Labs, and Sankara AI.',
      link: '/chief-guests',
      actionText: 'View Speakers',
      accent: 'ember' as const,
    },
    {
      title: 'Interactive Schedule',
      desc: 'Browse times and session details for our twin tracks: Hands-on Skill Building and Edge Tech Innovation.',
      link: '/agenda',
      actionText: 'Explore Agenda',
      accent: 'signal' as const,
    },
  ];

  return (
    <div className="relative flex flex-col justify-center items-center min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Dynamic neural net constellation background */}
      <div className="absolute inset-0 bg-ink z-0">
        <CircuitBackground />
      </div>

      {/* Hero Content */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pt-16 pb-20 text-center flex flex-col items-center">
        {/* Organizer Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-accent-signal/30 bg-accent-signal/5 text-accent-signal text-xs font-mono tracking-wider mb-6 animate-pulse-slow">
          <span>HOSTED BY UNAI TECH</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6">
          AI SUBMIT <span className="text-accent-signal">2026</span>
        </h1>

        {/* Positioning Statement */}
        <p className="text-text-muted text-base sm:text-xl max-w-2xl leading-relaxed mb-10 font-sans">
          Chennai&apos;s premier AI conference. We focus on building hands-on, practical AI engineering and autonomous systems skills in students and developers.
        </p>

        {/* Event details summary */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm text-text-primary font-mono bg-surface/50 border border-border-card px-6 py-4 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4.5 h-4.5 text-accent-signal" />
            <span>FEB 15 & 16, 2026</span>
          </div>
          <span className="hidden sm:inline text-border-card">|</span>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4.5 h-4.5 text-accent-signal" />
            <span>IITM RESEARCH PARK, CHENNAI</span>
          </div>
        </div>

        {/* Countdown component */}
        <div className="mb-14">
          <CountdownTimer />
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register">
            <Button variant="primary" size="lg" className="w-56 h-13 group gap-2 text-base font-semibold">
              Register — It&apos;s Free
              <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/venue">
            <Button variant="secondary" size="lg" className="w-56 h-13 text-base">
              Location details
            </Button>
          </Link>
        </div>
      </section>

      {/* Facts Strip */}
      <section className="relative z-10 w-full bg-surface/80 border-y border-border-card py-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {quickFacts.map((fact, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-2">
                <div className="mb-3.5 bg-ink p-3 rounded-lg border border-border-card">
                  {fact.icon}
                </div>
                <h3 className="font-display font-bold text-sm md:text-base text-text-primary">
                  {fact.title}
                </h3>
                <p className="text-xs text-text-muted mt-1 font-mono">
                  {fact.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previews.map((item, idx) => (
            <Card key={idx} variant={item.accent} className="flex flex-col justify-between h-64">
              <div>
                <h3 className="font-display font-bold text-lg md:text-xl text-text-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-border-card/30">
                <Link
                  href={item.link}
                  className={`inline-flex items-center space-x-1.5 text-xs font-mono tracking-wider font-semibold uppercase hover:underline ${
                    item.accent === 'ember' ? 'text-accent-ember' : 'text-accent-signal'
                  }`}
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
