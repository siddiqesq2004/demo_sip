import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PhoneFrame = ({ children }) => {
  const location = useLocation();

  // Dynamic Live Time state
  const [timeStr, setTimeStr] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  // Dynamic Live Battery state
  const [batteryLevel, setBatteryLevel] = useState(98);

  // Keep time updated live every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real device battery percentage if Web Battery API is supported
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        setBatteryLevel(Math.round(battery.level * 100));
        const onLevelChange = () => setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', onLevelChange);
      }).catch(() => {});
    }
  }, []);

  // Dark pages that have a dark header background
  const isDarkHeaderPage = ['/splash', '/admin/login'].includes(location.pathname);
  const textColor = isDarkHeaderPage ? 'text-white' : 'text-gray-900';
  const fillColor = isDarkHeaderPage ? '#FFFFFF' : '#111827';

  // Calculate battery inner fill width (max 18px)
  const batteryInnerWidth = Math.max(2, Math.min(18, (batteryLevel / 100) * 18));
  const batteryColor = batteryLevel <= 20 ? '#EF4444' : '#34D399';

  return (
    <>
      {/* Desktop - phone frame mockup */}
      <div className="hidden md:flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900 items-center justify-center p-6">
        <div className="relative">
          {/* Phone outer body */}
          <div
            className="relative w-[390px] h-[812px] bg-black rounded-[3.2rem] border-[7px] border-gray-800 overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]"
            style={{ boxShadow: '0 25px 70px rgba(0,0,0,0.8), inset 0 0 0 2px rgba(255,255,255,0.1)' }}
          >
            {/* Dynamic Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-black rounded-b-2xl z-50 flex items-center justify-center pointer-events-none">
              <div className="w-[50px] h-[4px] bg-gray-700/80 rounded-full mt-1"></div>
            </div>

            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-[44px] bg-transparent z-40 flex items-center justify-between px-7 pt-2 pointer-events-none">
              <span className={`text-[12px] font-bold tracking-tight ${textColor}`}>{timeStr}</span>
              <div className={`flex items-center space-x-1.5 ${textColor}`}>
                <span className="text-[10px] font-bold mr-0.5">{batteryLevel}%</span>
                {/* Signal Icon */}
                <svg width="15" height="11" viewBox="0 0 16 12" fill={fillColor}>
                  <rect x="0" y="8" width="3" height="4" rx="0.5" />
                  <rect x="4" y="5" width="3" height="7" rx="0.5" />
                  <rect x="8" y="2" width="3" height="10" rx="0.5" />
                  <rect x="12" y="0" width="3" height="12" rx="0.5" />
                </svg>
                {/* WiFi Icon */}
                <svg width="14" height="11" viewBox="0 0 24 24" fill={fillColor}>
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                </svg>
                {/* Dynamic Battery Icon */}
                <svg width="22" height="11" viewBox="0 0 25 12">
                  <rect x="0" y="1" width="21" height="10" rx="2" fill="none" stroke={fillColor} strokeWidth="1.2" />
                  <rect x="22" y="4" width="2" height="4" rx="0.5" fill={fillColor} />
                  <rect x="1.5" y="2.5" width={batteryInnerWidth} height="7" rx="1" fill={batteryColor} />
                </svg>
              </div>
            </div>

            {/* App Content Frame */}
            <div className="w-full h-full bg-white relative flex flex-col overflow-hidden">
              {children}
            </div>

            {/* Home indicator bar */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-black rounded-full z-50 pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Mobile devices - true full screen */}
      <div className="md:hidden w-full h-screen bg-white relative flex flex-col overflow-hidden">
        {children}
      </div>
    </>
  );
};

export default PhoneFrame;
