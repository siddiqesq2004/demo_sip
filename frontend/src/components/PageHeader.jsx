import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({
  title,
  subtitle,
  showBack = false,
  rightElement
}) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between pt-12 pb-3.5 px-5 bg-credora-deep text-white shadow-sm border-b border-emerald-950/60 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-emerald-800/40 text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-emerald-200/70">{subtitle}</p>}
        </div>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}
