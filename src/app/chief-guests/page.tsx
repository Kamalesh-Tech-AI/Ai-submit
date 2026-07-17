import React from 'react';
import { Metadata } from 'next';
import { CHIEF_GUESTS } from '@/lib/mock-data';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Chief Guests & Speakers',
  description: 'Meet the industry experts and researchers keynoting and teaching at AI Submit 2026 in Chennai.',
};

export default function ChiefGuestsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      {/* Page Heading */}
      <SectionHeading
        title="CHIEF GUESTS & SPEAKERS"
        subtitle="Meet the practitioners, AI architects, and medical specialists hosting masterclasses and panel discussions."
        accent="ember"
      />

      {/* Grid of Guests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {CHIEF_GUESTS.map((guest) => (
          <Card
            key={guest.id}
            variant="ember"
            className="flex flex-col h-full hover:shadow-lg hover:shadow-accent-ember/5"
          >
            {/* Image / Photo */}
            <div className="relative w-full aspect-square bg-ink border border-border-card rounded-md overflow-hidden mb-5">
              {/* Fallback pattern */}
              <div className="absolute inset-0 circuit-grid opacity-20" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={guest.imageUrl}
                alt={guest.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Speaker Information */}
            <div className="flex-grow flex flex-col justify-between text-left">
              <div>
                <h3 className="font-display font-black text-lg md:text-xl text-[#002060]">
                  {guest.name}
                </h3>
                <p className="text-xs text-[#2563EB] font-mono font-bold uppercase tracking-wider mt-1.5 bg-[#2563EB]/5 inline-block px-2 py-0.5 rounded">
                  {guest.designation}
                </p>
                <p className="text-xs text-[#0B3A82] font-extrabold mt-2">
                  {guest.organization}
                </p>
                
                <p className="text-xs md:text-sm text-slate-600 mt-4 leading-relaxed font-sans font-medium">
                  {guest.bio}
                </p>
              </div>

              {/* Decorative signature hairline */}
              <div className="border-t border-[#D2E0EE] mt-5 pt-3 flex justify-between items-center text-[10px] font-mono text-[#476282] font-bold">
                <span>AI SUMMIT SPEAKER</span>
                <span>ID: {guest.id.toUpperCase()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
