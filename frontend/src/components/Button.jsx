import React from 'react';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary (gold), emerald, secondary, outline, danger
  size = 'md', // sm, md, lg
  fullWidth = false,
  disabled = false,
  loading = false,
  className = ''
}) {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'gold-gradient text-credora-dark hover:brightness-105 active:scale-[0.99] shadow-md shadow-amber-500/10',
    emerald: 'bg-credora-green text-white hover:bg-emerald-600 active:scale-[0.99] shadow-md shadow-emerald-600/20',
    dark: 'bg-credora-deep text-white hover:bg-credora-card active:scale-[0.99]',
    outline: 'border border-credora-deep text-credora-deep hover:bg-credora-deep/5',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold',
    md: 'px-4 py-3 text-sm font-semibold',
    lg: 'px-6 py-4 text-base font-bold'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : children}
    </button>
  );
}
