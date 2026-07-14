'use client';

import React, { useState } from 'react';
import { Clock, User } from 'lucide-react';
import { AGENDA_ITEMS } from '@/lib/mock-data';
import SectionHeading from '@/components/ui/SectionHeading';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

export default function AgendaPage() {
  const [selectedDay, setSelectedDay] = useState<1 | 2>(1);

  const filteredAgenda = AGENDA_ITEMS.filter((item) => item.day === selectedDay);

  const trackBadgeColors = (track: string) => {
    switch (track) {
      case 'Keynote':
        return 'ember' as const;
      case 'Skill Building':
        return 'signal' as const;
      case 'Tech Innovation':
        return 'signal' as const;
      default:
        return 'muted' as const;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
      {/* Page Heading */}
      <SectionHeading
        title="CONFERENCE AGENDA"
        subtitle="Twin tracks running side-by-side: Hands-on Skill Building and Edge Technology Innovation."
      />

      {/* Day Selector Tabs */}
      <div className="flex justify-center mb-12">
        <div className="bg-surface border border-border-card p-1.5 rounded-lg flex space-x-2">
          <button
            onClick={() => setSelectedDay(1)}
            className={`px-5 py-2.5 rounded-md font-display font-semibold text-sm transition-all cursor-pointer ${
              selectedDay === 1
                ? 'bg-accent-signal text-white shadow-md'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            DAY 1 — FEB 15
          </button>
          <button
            onClick={() => setSelectedDay(2)}
            className={`px-5 py-2.5 rounded-md font-display font-semibold text-sm transition-all cursor-pointer ${
              selectedDay === 2
                ? 'bg-accent-signal text-white shadow-md'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            DAY 2 — FEB 16
          </button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative border-l border-border-card ml-4 md:ml-32 space-y-6">
        {filteredAgenda.map((session) => (
          <div key={session.id} className="relative pl-6 md:pl-10 group">
            {/* Timeline bullet */}
            <div className="absolute left-[-5px] top-7 w-2.5 h-2.5 bg-accent-signal rounded-full border border-ink group-hover:scale-125 transition-transform" />

            {/* Time label for larger viewports */}
            <div className="hidden md:block absolute left-[-140px] top-4 w-28 text-right font-mono text-xs font-semibold text-text-primary tracking-wider">
              {session.time}
            </div>

            {/* Session Card */}
            <Card hoverEffect={true} className="p-5">
              <div className="flex flex-col space-y-2">
                {/* Mobile-only time label */}
                <div className="flex md:hidden items-center text-xs font-mono text-text-muted space-x-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-accent-signal" />
                  <span>{session.time}</span>
                </div>

                {/* Track Badge & Day Indicator */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={trackBadgeColors(session.track)}>
                    {session.track.toUpperCase()}
                  </Badge>
                </div>

                {/* Session Title */}
                <h4 className="font-display font-bold text-base md:text-lg text-text-primary pt-1">
                  {session.title}
                </h4>

                {/* Speaker info */}
                {session.speaker && (
                  <div className="flex items-center space-x-2 text-xs md:text-sm text-text-muted pt-1">
                    <User className="w-4 h-4 text-accent-signal shrink-0" />
                    <span>{session.speaker}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
