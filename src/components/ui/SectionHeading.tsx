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
  const accentColor = accent === 'signal' ? 'bg-[#2563EB]' : 'bg-[#0B3A82]';

  return (
    <div className={`flex flex-col mb-10 ${alignment}`}>
      <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-[#002060]">
        {title}
      </h2>
      <div className={`h-[4px] w-14 ${accentColor} mt-3 rounded-full`} />
      {subtitle && (
        <p className="text-slate-600 mt-4 text-sm md:text-base max-w-2xl font-sans font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}
