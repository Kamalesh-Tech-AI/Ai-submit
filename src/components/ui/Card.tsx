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
    default: 'border-border-card',
    ember: 'border-accent-ember/40',
    signal: 'border-accent-signal/40',
  };

  const hoverStyles = hoverEffect 
    ? 'hover:border-opacity-100 hover:translate-y-[-2px] transition-all duration-300' 
    : '';

  // For VIP speakers, we add a golden ember bottom bar or a subtle glow
  const borderHighlight = {
    default: '',
    ember: 'relative before:absolute before:top-0 before:left-0 before:w-full before:h-[2px] before:bg-accent-ember overflow-hidden',
    signal: 'relative before:absolute before:top-0 before:left-0 before:w-full before:h-[2px] before:bg-accent-signal overflow-hidden',
  };

  return (
    <div
      className={`bg-surface border ${borderColors[variant]} rounded-lg p-5 ${hoverStyles} ${borderHighlight[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
