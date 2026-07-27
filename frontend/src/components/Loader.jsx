import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ label = 'Loading CREDORA...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px] text-credora-surface">
      <Loader2 className="w-8 h-8 animate-spin mb-3 text-credora-gold" />
      <span className="text-sm font-medium text-gray-400">{label}</span>
    </div>
  );
}
