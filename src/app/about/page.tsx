import React from 'react';
import { Metadata } from 'next';
import { ShieldCheck, Laptop, Cpu, Terminal } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'About the Conference',
  description: 'Understand the mission of AI Summit 2026 Chennai — hands-on skills in autonomous systems, custom model fine-tuning, and neural circuits.',
};

export default function AboutPage() {
  const targets = [
    {
      icon: <Terminal className="w-5 h-5 text-accent-signal" />,
      title: 'Engineering Students',
      desc: 'Move past API-wrapping. Learn to compile models, run SLMs locally, and interface AI with physical microcontrollers.'
    },
    {
      icon: <Laptop className="w-5 h-5 text-accent-signal" />,
      title: 'Fresh Graduates',
      desc: 'Understand exactly what tech companies in Chennai look for. Build a real deployment-ready portfolio.'
    },
    {
      icon: <Cpu className="w-5 h-5 text-accent-signal" />,
      title: 'Working Professionals',
      desc: 'Explore the shift from bulky LLM calls to optimized autonomous agents running on local infrastructures.'
    }
  ];

  const benefits = [
    { title: 'Zero Cost', desc: 'No ticket fees. Access is completely free for registered attendees.' },
    { title: 'Local Deployment Focus', desc: 'Learn model compression, local deployment, and Edge AI frameworks.' },
    { title: 'Project Exhibition', desc: 'Present your models to Chennai-based tech leaders and get direct feedback.' },
    { title: 'E-Certificate', desc: 'Earn a verified digital credential showcasing your participation in the tracks.' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      {/* Headings */}
      <SectionHeading
        title="ABOUT THE EVENT"
        subtitle="Bridging the gap between conceptual AI theory and practical autonomous system engineering."
      />

      {/* Main Copy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mb-20 text-left">
        <div className="lg:col-span-2 space-y-6 text-slate-600 leading-relaxed font-sans text-sm md:text-base font-medium">
          <p>
            <strong className="text-[#002060] font-black">AI Summit 2026</strong> is a free, technical-first conference organized by <span className="text-[#002060] font-bold">unAi Tech Pvt. Ltd.</span> Our core mission is simple: to democratize advanced artificial intelligence engineering and make it highly practical for students, graduates, and working professionals in Chennai and across India.
          </p>
          <p>
            Unlike generic AI summits that focus solely on high-level business use cases or simple API integrations, AI Summit 2026 focuses on the <span className="text-[#2563EB] font-bold">science and architectural engineering of autonomous systems</span>. We will explore deep topics including running small language models (SLMs) on low-compute edge devices, training local reinforcement learning agents, and compiling computer vision models.
          </p>
          <p>
            Attendees will participate in interactive tracks, learn directly from engineering practitioners, see live project exhibitions, and walk away with a verified digital e-certificate that proves they built and deployed systems.
          </p>
        </div>

        {/* Organizer Box */}
        <div className="bg-white border border-[#D2E0EE] p-6 rounded-xl flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="font-display font-bold text-base text-[#002060] mb-2">
              Who is unAi Tech?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              unAi Tech Pvt. Ltd. is an AI engineering and EdTech company headquartered in Chennai, India. We construct software architectures for autonomous systems and design intensive training programs to bring students up to speed with modern AI deployment practices.
            </p>
          </div>
          <div className="border-t border-[#D2E0EE]/50 mt-4 pt-4 text-xs font-mono font-bold text-[#2563EB]">
            <a href="https://unaitech.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Visit website &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Targets */}
      <div className="mb-20">
        <h3 className="font-display text-xl md:text-2xl font-black text-[#002060] text-center mb-10 uppercase">
          Who Should Attend?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {targets.map((target, idx) => (
            <Card key={idx} variant="default" className="flex flex-col space-y-4 text-left border-[#D2E0EE]">
              <div className="bg-[#2563EB]/5 w-10 h-10 rounded-lg border border-[#D2E0EE] flex items-center justify-center">
                {target.icon}
              </div>
              <h4 className="font-display font-bold text-base text-[#002060]">
                {target.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                {target.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-slate-50 border border-[#D2E0EE] rounded-xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/5 rounded-full blur-3xl pointer-events-none" />
        <h3 className="font-display text-xl md:text-2xl font-black text-[#002060] mb-8 text-left uppercase">
          Conference Highlights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex space-x-3.5 text-left">
              <div className="mt-1 bg-white p-1 rounded-lg border border-[#D2E0EE] shadow-sm shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm md:text-base text-[#002060]">
                  {benefit.title}
                </h4>
                <p className="text-xs md:text-sm text-slate-600 mt-1 font-sans font-medium">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
