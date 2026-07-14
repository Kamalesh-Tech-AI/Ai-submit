'use client';

import React, { useState, useEffect } from 'react';
import { EVENT_DATE } from '@/lib/mock-data';

const calculateTimeLeft = () => {
  const targetTime = new Date(EVENT_DATE).getTime();
  const now = new Date().getTime();
  const difference = targetTime - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  };
};

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  if (timeLeft.isExpired) {
    return (
      <div className="font-display text-center py-2 px-4 rounded-md border border-accent-ember/30 bg-accent-ember/5 text-accent-ember font-semibold tracking-wide">
        EVENT IS LIVE IN CHENNAI!
      </div>
    );
  }

  const items = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ];

  return (
    <div className="flex justify-center space-x-3 md:space-x-5">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="bg-surface border border-border-card rounded-lg w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-lg relative overflow-hidden">
            {/* Subtle glow background */}
            <div className="absolute inset-0 bg-radial-gradient from-accent-signal/5 to-transparent pointer-events-none" />
            <span className="font-mono text-xl md:text-3xl font-bold text-text-primary tracking-tight">
              {formatNumber(item.value)}
            </span>
          </div>
          <span className="text-[10px] md:text-xs font-mono tracking-widest text-text-muted mt-2">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
