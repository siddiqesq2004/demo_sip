import React from 'react';

export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  className = '',
  required = false
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-gray-400 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-slate-900 border rounded-xl py-3 text-sm transition-all focus:outline-none focus:ring-2 ${
            Icon ? 'pl-11 pr-4' : 'px-4'
          } ${
            error
              ? 'border-red-500 focus:ring-red-500/20 text-red-900 placeholder-red-300'
              : 'border-gray-800 text-white placeholder-gray-400 focus:border-credora-gold focus:ring-credora-gold/20'
          }`}
        />
      </div>
      {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}
