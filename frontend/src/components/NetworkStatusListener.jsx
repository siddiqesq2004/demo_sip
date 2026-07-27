import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const NetworkStatusListener = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showBackOnline) return null;

  return (
    <div className="absolute top-[44px] left-0 right-0 z-50 px-3 transition-all duration-300 animate-slide-down pointer-events-auto">
      {!isOnline ? (
        <div className="bg-red-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg border border-red-700/50">
          <div className="flex items-center space-x-2">
            <WifiOff size={15} className="text-red-300 animate-pulse" />
            <span>No Network Connection</span>
          </div>
          <span className="text-[10px] bg-red-800 px-2 py-0.5 rounded-md font-medium text-red-200">Offline Mode</span>
        </div>
      ) : (
        <div className="bg-[#00A859]/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg border border-emerald-600/50">
          <Wifi size={15} className="text-white" />
          <span>Internet Connection Restored</span>
        </div>
      )}
    </div>
  );
};

export default NetworkStatusListener;
