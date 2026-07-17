import React from 'react';
import Link from 'next/link';
import { 
  Calendar, MapPin, Award, BookOpen, Users, ArrowRight,
  TrendingUp, Sparkles, Network, Briefcase, GraduationCap, CheckCircle
} from 'lucide-react';
import CountdownTimer from '@/components/ui/CountdownTimer';
import CircuitBackground from '@/components/ui/CircuitBackground';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function LandingPage() {
  const stats = [
    { value: '1000+', label: 'Attendees', icon: <Users className="w-5 h-5 text-accent-signal" /> },
    { value: '50+', label: 'Speakers', icon: <GraduationCap className="w-5 h-5 text-accent-signal" /> },
    { value: 'Workshops', label: '& Masterclasses', icon: <BookOpen className="w-5 h-5 text-accent-signal" /> },
    { value: '100+', label: 'Colleges', icon: <Award className="w-5 h-5 text-accent-signal" /> },
    { value: '30+', label: 'Corporate Partners', icon: <Network className="w-5 h-5 text-accent-signal" /> },
    { value: 'AI Expo', label: '& Innovations', icon: <Sparkles className="w-5 h-5 text-accent-signal" /> },
  ];

  const highlights = [
    {
      title: 'Visionary Speakers',
      desc: 'Insights from leaders and pioneers shaping the future of artificial intelligence in India.',
      icon: <Users className="w-6 h-6 text-white" />,
    },
    {
      title: 'Academic & Industry Collaboration',
      desc: 'Forging stronger partnerships to foster meaningful technological progress and local innovation.',
      icon: <Network className="w-6 h-6 text-white" />,
    },
    {
      title: 'Strategic Discussions',
      desc: 'In-depth dialogue on regulatory policy, hardware frameworks, and real-world societal impact.',
      icon: <TrendingUp className="w-6 h-6 text-white" />,
    },
    {
      title: 'Future-Ready Insights',
      desc: 'Exploring emerging trends, local deployments, and compilation methods that define tomorrow.',
      icon: <Sparkles className="w-6 h-6 text-white" />,
    },
  ];

  const benefits = [
    'Certificates for All Attendees',
    'Network with Leaders & Innovators',
    'Discover Career & Startup Opportunities',
    'Be Part of India\'s Biggest AI Movement',
  ];

  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden flex flex-col">
      {/* Abstract Circuit constellation background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F4F6F9] to-white z-0">
        <CircuitBackground />
      </div>

      {/* Hero Section with Diagonal Blue Accents */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:py-28 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Text Block */}
        <div className="w-full lg:w-3/5 text-left flex flex-col items-start">
          {/* Organizer Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-accent-signal/20 bg-accent-signal/5 text-accent-signal text-xs font-mono tracking-wider mb-6">
            <span className="font-bold">unAi Tech Pvt. Ltd.</span>
            <span className="opacity-40">|</span>
            <span className="font-semibold text-accent-ember font-sans">#AIForEveryIndian</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-tight mb-4">
            NATIONAL <br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-signal via-accent-ember to-[#0B3A82]">
              AI SUMMIT 2026
            </span>
          </h1>

          {/* Tagline */}
          <h2 className="text-sm sm:text-base font-mono tracking-widest text-accent-signal font-bold uppercase mb-6">
            AI FOR EVERY INDIAN — LEARN. BUILD. LEAD.
          </h2>

          {/* About description */}
          <p className="text-text-muted text-base sm:text-lg max-w-2xl leading-relaxed mb-8 font-sans">
            AI SUMMIT 2026 is a high-level leadership platform where policy, academia, industry, and innovation converge to accelerate responsible AI adoption and nation-building.
          </p>

          {/* Event details summary */}
          <div className="flex flex-wrap gap-4 sm:gap-6 mb-8 text-xs sm:text-sm text-text-primary font-mono bg-white/70 border border-border-card px-5 py-3 rounded-lg shadow-sm backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-accent-signal" />
              <span className="font-bold">AUGUST 2026, THIRD WEEK</span>
            </div>
            <span className="hidden sm:inline text-border-card">|</span>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-accent-signal" />
              <span className="font-bold">IIT RESEARCH PARK, CHENNAI</span>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="mb-10 w-full sm:w-auto">
            <CountdownTimer />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-56 h-13 group gap-2 text-base font-semibold">
                Register Now
                <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/venue" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-56 h-13 text-base">
                Venue details
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Graphic Block representing the Poster geometric angles */}
        <div className="w-full lg:w-2/5 h-[350px] sm:h-[450px] relative hidden lg:block select-none pointer-events-none">
          {/* Main Diagonal Panel */}
          <div className="absolute right-0 top-0 w-full h-full bg-[#002060] rounded-2xl shadow-2xl overflow-hidden transform skew-y-3 border-r-8 border-accent-signal">
            {/* Geometric layered shapes */}
            <div className="absolute right-0 bottom-0 w-3/4 h-full bg-gradient-to-tr from-[#2563EB] to-[#0B3A82] opacity-80 transform origin-bottom-right rotate-12" />
            <div className="absolute right-0 bottom-0 w-1/2 h-4/5 bg-[#1D4ED8] opacity-50 transform origin-bottom-right rotate-45" />
            
            {/* White highlights reflecting the poster light streaks */}
            <div className="absolute left-1/4 top-0 w-[3px] h-full bg-gradient-to-b from-white/0 via-white/55 to-white/0 transform -rotate-12 blur-[1px]" />
            <div className="absolute left-1/3 top-0 w-[2px] h-full bg-gradient-to-b from-white/0 via-white/40 to-white/0 transform -rotate-12 blur-[2px]" />

            {/* Poster Tagline Overlay */}
            <div className="absolute bottom-10 left-8 right-8 z-10 text-white transform -skew-y-3">
              <span className="text-[10px] font-mono tracking-widest text-white/70 uppercase">
                #AIForEveryIndian
              </span>
              <h3 className="font-display font-extrabold text-2xl mt-1 leading-tight text-white">
                COLLABORATE.<br />
                INNOVATE.<br />
                TRANSFORM.
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 w-full bg-[#002060] text-white py-12 md:py-16 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm transition-transform hover:scale-105">
                <div className="mb-3 bg-white/10 p-2.5 rounded-lg border border-white/10">
                  {stat.icon}
                </div>
                <h3 className="font-display font-extrabold text-xl md:text-2xl text-white">
                  {stat.value}
                </h3>
                <p className="text-[10px] md:text-xs text-white/70 mt-1 font-mono uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Highlights Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-accent-signal uppercase px-3 py-1 rounded bg-accent-signal/5 border border-accent-signal/15">
            CONFERENCE INSIGHTS
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-black text-text-primary mt-4">
            KEY SUMMIT HIGHLIGHTS
          </h2>
          <div className="h-[3px] w-12 bg-accent-signal mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {highlights.map((item, idx) => (
            <Card key={idx} hoverEffect={true} className="p-6 md:p-8 flex items-start space-x-5 border-[#D2E0EE] bg-white transition-all shadow-sm hover:shadow-md">
              <div className="bg-[#002060] p-3 rounded-xl border border-accent-signal/20 shrink-0">
                {item.icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-lg md:text-xl text-text-primary">
                  {item.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Strip Section */}
      <section className="relative z-10 w-full bg-[#F4F6F9] border-y border-[#D2E0EE] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center space-x-3 bg-white p-4.5 rounded-xl border border-[#D2E0EE] shadow-sm">
                <CheckCircle className="w-5 h-5 text-accent-signal shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-text-primary font-sans leading-tight">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Pages Router CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="signal" className="flex flex-col justify-between h-64 p-6 bg-white border-[#D2E0EE] shadow-sm hover:shadow-md">
            <div>
              <h3 className="font-display font-bold text-lg md:text-xl text-text-primary mb-3">
                Distinguished Speakers
              </h3>
              <p className="text-sm text-text-muted leading-relaxed font-sans">
                Meet our lineup of leaders, researchers, and government ministers including Prof. V. Kamakoti (IITM) and Sridhar Vembu (Zoho).
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border-card/30">
              <Link
                href="/chief-guests"
                className="inline-flex items-center space-x-1.5 text-xs font-mono tracking-wider font-semibold uppercase text-accent-signal hover:underline"
              >
                <span>View Speakers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          <Card variant="ember" className="flex flex-col justify-between h-64 p-6 bg-white border-[#D2E0EE] shadow-sm hover:shadow-md">
            <div>
              <h3 className="font-display font-bold text-lg md:text-xl text-text-primary mb-3">
                Conference Agenda
              </h3>
              <p className="text-sm text-text-muted leading-relaxed font-sans">
                Browse our two-day agenda containing deep-tech keynotes, hands-on masterclasses, and networking exhibitions.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border-card/30">
              <Link
                href="/agenda"
                className="inline-flex items-center space-x-1.5 text-xs font-mono tracking-wider font-semibold uppercase text-accent-ember hover:underline"
              >
                <span>Explore Agenda</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          <Card variant="signal" className="flex flex-col justify-between h-64 p-6 bg-white border-[#D2E0EE] shadow-sm hover:shadow-md">
            <div>
              <h3 className="font-display font-bold text-lg md:text-xl text-text-primary mb-3">
                Venue & Location
              </h3>
              <p className="text-sm text-text-muted leading-relaxed font-sans">
                Get directions, map linkages, and transit info to reach the IIT Madras Research Park in Taramani, Chennai.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border-card/30">
              <Link
                href="/venue"
                className="inline-flex items-center space-x-1.5 text-xs font-mono tracking-wider font-semibold uppercase text-accent-signal hover:underline"
              >
                <span>Location details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
