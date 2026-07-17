import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'ember' | 'signal';
  hoverEffect?: boolean;
}

export default function Card({
  children,
  variant = 'default',
  hoverEffect = true,
  className = '',
  ...props
}: CardProps) {
  const borderColors = {
    default: 'border-[#D2E0EE]',
    ember: 'border-[#0B3A82]/45',
    signal: 'border-[#2563EB]/45',
  };

  const hoverStyles = hoverEffect 
    ? 'hover:border-opacity-100 hover:translate-y-[-2px] hover:shadow-md transition-all duration-300' 
    : '';

  const borderHighlight = {
    default: '',
    ember: 'relative before:absolute before:top-0 before:left-0 before:w-full before:h-[3px] before:bg-[#0B3A82] overflow-hidden',
    signal: 'relative before:absolute before:top-0 before:left-0 before:w-full before:h-[3px] before:bg-[#2563EB] overflow-hidden',
  };

  return (
    <div
      className={`bg-white border ${borderColors[variant]} rounded-xl p-6 shadow-sm ${hoverStyles} ${borderHighlight[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
