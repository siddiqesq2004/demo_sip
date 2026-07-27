import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

export default function MobileFrameToggle({ children }) {
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start p-0 md:py-6">
      {/* Top Floating View Switcher Bar for Presentations */}
      <div className="hidden md:flex items-center gap-3 bg-slate-900/90 backdrop-blur border border-slate-800 text-white px-4 py-2 rounded-full mb-4 shadow-xl z-50 text-xs font-semibold">
        <span className="text-gray-400">CREDORA Presentation Mode:</span>
        <button
          onClick={() => setIsMobileFrame(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            isMobileFrame ? 'gold-gradient text-credora-dark font-bold shadow' : 'hover:text-white text-gray-400'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" /> Mobile Device Frame
        </button>
        <button
          onClick={() => setIsMobileFrame(false)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            !isMobileFrame ? 'gold-gradient text-credora-dark font-bold shadow' : 'hover:text-white text-gray-400'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" /> Full Width
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[412px] bg-slate-900 md:rounded-[40px] md:border-[10px] md:border-slate-800 md:shadow-2xl overflow-hidden min-h-screen md:min-h-[840px] relative'
            : 'max-w-md bg-slate-900 min-h-screen relative shadow-xl'
        }`}
      >
        {/* iPhone Notch in Frame Mode */}
        {isMobileFrame && (
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-36 h-4 bg-slate-800 rounded-b-xl z-50"></div>
        )}

        {children}
      </div>
    </div>
  );
}
