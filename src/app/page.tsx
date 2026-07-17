import React from 'react';
import Link from 'next/link';
import { 
  Calendar, MapPin, Award, BookOpen, Users, ArrowRight,
  TrendingUp, Sparkles, Network, GraduationCap, CheckCircle
} from 'lucide-react';
import CountdownTimer from '@/components/ui/CountdownTimer';
import CircuitBackground from '@/components/ui/CircuitBackground';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function LandingPage() {
  const stats = [
    { value: '1000+', label: 'Attendees', icon: <Users className="w-5 h-5 text-white" /> },
    { value: '55+', label: 'Speakers', icon: <GraduationCap className="w-5 h-5 text-white" /> },
    { value: 'Workshops', label: '& Masterclasses', icon: <BookOpen className="w-5 h-5 text-white" /> },
    { value: '100+', label: 'Colleges', icon: <Award className="w-5 h-5 text-white" /> },
    { value: '30+', label: 'Corporate Partners', icon: <Network className="w-5 h-5 text-white" /> },
    { value: 'AI Expo', label: '& Innovations', icon: <Sparkles className="w-5 h-5 text-white" /> },
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
    <div className="relative w-full min-h-screen bg-white overflow-hidden flex flex-col font-sans">
      {/* Hero Section Container with responsive background image */}
      <section 
        className="relative z-10 w-full min-h-[85vh] flex items-center bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero_tech_bg.png')" }}
      >
        {/* Soft responsive overlay for 100% text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/70 lg:bg-gradient-to-r lg:from-white/98 lg:via-white/90 lg:to-white/20 z-0" />

        {/* Neural network animation overlay for futuristic touch */}
        <div className="absolute inset-0 z-5 pointer-events-none opacity-40">
          <CircuitBackground />
        </div>

        {/* Content wrapper */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl text-left flex flex-col items-start">
            
            {/* Host Branding Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-[#2563EB]/25 bg-[#2563EB]/5 text-[#2563EB] text-xs font-mono tracking-wider mb-6">
              <span className="font-extrabold uppercase">unAi Tech Pvt. Ltd.</span>
              <span className="opacity-40 font-normal">|</span>
              <span className="font-bold text-[#0B3A82]">#AIForEveryIndian</span>
            </div>

            {/* National Summit Title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#002060] leading-none mb-4 uppercase">
              NATIONAL <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0B3A82]">
                AI SUMMIT 2026
              </span>
            </h1>

            {/* Core Moto Subtitle */}
            <h2 className="text-xs sm:text-sm font-mono tracking-widest text-[#2563EB] font-extrabold uppercase mb-6 bg-[#2563EB]/5 px-3 py-1 rounded">
              AI FOR EVERY INDIAN — LEARN. BUILD. LEAD.
            </h2>

            {/* Short Event Summary Description */}
            <p className="text-slate-700 text-base sm:text-lg max-w-xl leading-relaxed mb-8 font-semibold">
              AI SUMMIT 2026 is a high-level leadership platform where policy, academia, industry, and innovation converge to accelerate responsible AI adoption and nation-building.
            </p>

            {/* Date & Venue Box with high contrast */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-8 w-full sm:w-auto">
              <div className="flex items-center space-x-3 bg-[#002060] text-white px-4 py-3 rounded-lg shadow-sm border border-white/10">
                <Calendar className="w-5 h-5 text-white/90" />
                <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
                  AUGUST 2026, THIRD WEEK
                </span>
              </div>
              <div className="flex items-center space-x-3 bg-white text-[#002060] px-4 py-3 rounded-lg shadow-md border border-[#D2E0EE]">
                <MapPin className="w-5 h-5 text-[#2563EB]" />
                <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
                  IIT RESEARCH PARK, CHENNAI
                </span>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="mb-10 w-full sm:w-auto">
              <CountdownTimer />
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-56 h-13 group gap-2 text-base font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-500/25">
                  Register Now
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/venue" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-56 h-13 text-base border-2 border-[#D2E0EE] text-[#002060] hover:bg-slate-50 font-bold bg-white/80">
                  Venue details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics section with beautiful contrast */}
      <section className="relative z-10 w-full bg-[#002060] text-white py-12 md:py-16 shadow-inner border-y border-[#2563EB]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm transition-transform hover:scale-105">
                <div className="mb-3.5 bg-[#2563EB] p-3 rounded-xl border border-white/10 shadow-md shadow-blue-500/20">
                  {stat.icon}
                </div>
                <h3 className="font-display font-black text-xl md:text-2xl text-white tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-[10px] md:text-xs text-white/80 mt-1 font-mono uppercase tracking-widest font-bold">
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
          <span className="text-xs font-mono font-bold tracking-widest text-[#2563EB] uppercase px-3 py-1 rounded bg-[#2563EB]/5 border border-[#2563EB]/15">
            CONFERENCE INSIGHTS
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-black text-[#002060] mt-4 uppercase">
            KEY SUMMIT HIGHLIGHTS
          </h2>
          <div className="h-[4px] w-14 bg-[#2563EB] mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {highlights.map((item, idx) => (
            <Card key={idx} hoverEffect={true} className="p-6 md:p-8 flex items-start space-x-5 border border-[#D2E0EE] bg-white transition-all shadow-sm hover:shadow-md">
              <div className="bg-[#002060] p-3.5 rounded-xl border border-[#2563EB]/20 shrink-0 shadow-sm">
                {item.icon}
              </div>
              <div className="space-y-2 text-left">
                <h3 className="font-display font-bold text-lg md:text-xl text-[#002060]">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-sans font-medium">
                  {item.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Strip Section */}
      <section className="relative z-10 w-full bg-slate-50 border-y border-[#D2E0EE] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center space-x-3 bg-white p-5 rounded-xl border border-[#D2E0EE] shadow-sm hover:shadow-md transition-shadow">
                <CheckCircle className="w-5.5 h-5.5 text-[#2563EB] shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-[#002060] font-sans leading-tight text-left">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation preview blocks */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="signal" className="flex flex-col justify-between h-64 p-6 bg-white border-[#D2E0EE] shadow-sm hover:shadow-md">
            <div className="text-left">
              <h3 className="font-display font-bold text-lg md:text-xl text-[#002060] mb-3">
                Distinguished Speakers
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-sans font-medium">
                Meet our lineup of leaders, researchers, and government ministers including Prof. V. Kamakoti (IITM) and Sridhar Vembu (Zoho).
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#D2E0EE]/50 text-left">
              <Link
                href="/chief-guests"
                className="inline-flex items-center space-x-1.5 text-xs font-mono tracking-wider font-bold uppercase text-[#2563EB] hover:underline"
              >
                <span>View Speakers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          <Card variant="ember" className="flex flex-col justify-between h-64 p-6 bg-white border-[#D2E0EE] shadow-sm hover:shadow-md">
            <div className="text-left">
              <h3 className="font-display font-bold text-lg md:text-xl text-[#002060] mb-3">
                Conference Agenda
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-sans font-medium">
                Browse our two-day agenda containing deep-tech keynotes, hands-on masterclasses, and networking exhibitions.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#D2E0EE]/50 text-left">
              <Link
                href="/agenda"
                className="inline-flex items-center space-x-1.5 text-xs font-mono tracking-wider font-bold uppercase text-[#0B3A82] hover:underline"
              >
                <span>Explore Agenda</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          <Card variant="signal" className="flex flex-col justify-between h-64 p-6 bg-white border-[#D2E0EE] shadow-sm hover:shadow-md">
            <div className="text-left">
              <h3 className="font-display font-bold text-lg md:text-xl text-[#002060] mb-3">
                Venue & Location
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-sans font-medium">
                Get directions, map linkages, and transit info to reach the IIT Madras Research Park in Taramani, Chennai.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#D2E0EE]/50 text-left">
              <Link
                href="/venue"
                className="inline-flex items-center space-x-1.5 text-xs font-mono tracking-wider font-bold uppercase text-[#2563EB] hover:underline"
              >
                <span>Location details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Decorative Poster strip: collaborate innovate transform */}
      <div className="relative z-10 w-full py-4 bg-[#002060] text-white/50 text-[10px] md:text-xs font-mono tracking-widest uppercase text-center border-t border-white/5">
        Collaborate • Innovate • Transform
      </div>
    </div>
  );
}
