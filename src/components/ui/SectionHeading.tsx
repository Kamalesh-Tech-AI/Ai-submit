import React from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  accent?: 'signal' | 'ember';
}

export default function SectionHeading({
  title,
  subtitle,
  align = 'center',
  accent = 'signal',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start';
  const accentColor = accent === 'signal' ? 'bg-accent-signal' : 'bg-accent-ember';

  return (
    <div className={`flex flex-col mb-10 ${alignment}`}>
      <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
        {title}
      </h2>
      <div className={`h-[3px] w-12 ${accentColor} mt-3 rounded-full`} />
      {subtitle && (
        <p className="text-text-muted mt-3 text-sm md:text-base max-w-xl font-sans">
          {subtitle}
        </p>
      )}
    </div>
  );
}
