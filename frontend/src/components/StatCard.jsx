import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className = ''
}) {
  return (
    <div className={`bg-slate-900 border border-gray-800 rounded-2xl p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-credora-deep/40 text-credora-gold border border-credora-gold/20">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-extrabold text-white tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        {trend && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
