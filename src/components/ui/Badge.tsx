import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'signal' | 'ember' | 'muted' | 'success' | 'danger';
}

export default function Badge({ children, variant = 'signal' }: BadgeProps) {
  const styles = {
    signal: 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/25 font-bold',
    ember: 'bg-[#0B3A82]/10 text-[#0B3A82] border-[#0B3A82]/25 font-extrabold',
    muted: 'bg-slate-100 text-[#476282] border-[#D2E0EE] font-semibold',
    success: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 font-bold',
    danger: 'bg-red-500/10 text-red-700 border-red-500/25 font-bold',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] md:text-xs font-mono border ${styles[variant]}`}>
      {children}
    </span>
  );
}
