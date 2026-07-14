import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'signal' | 'ember' | 'muted' | 'success' | 'danger';
}

export default function Badge({ children, variant = 'signal' }: BadgeProps) {
  const styles = {
    signal: 'bg-accent-signal/10 text-accent-signal border-accent-signal/20',
    ember: 'bg-accent-ember/10 text-accent-ember border-accent-ember/20',
    muted: 'bg-surface text-text-muted border-border-card',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] md:text-xs font-mono border ${styles[variant]}`}>
      {children}
    </span>
  );
}
