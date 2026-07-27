import React from 'react';

export default function Card({
  children,
  variant = 'light', // light, emerald, dark
  className = '',
  onClick
}) {
  const base = 'rounded-2xl p-5 transition-all duration-200';
  const variants = {
    light: 'bg-white border border-gray-100 shadow-sm text-gray-900',
    emerald: 'bg-gradient-to-b from-[#0B3B2F] to-[#062E23] text-white shadow-lg border border-emerald-800/40',
    dark: 'bg-credora-dark text-white border border-emerald-950',
    gold: 'gold-gradient text-credora-dark shadow-md'
  };

  return (
    <div
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.light} ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
