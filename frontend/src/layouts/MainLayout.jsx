import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import PhoneFrame from '../components/PhoneFrame';
import NetworkStatusListener from '../components/NetworkStatusListener';

const MainLayout = () => {
  const location = useLocation();

  return (
    <PhoneFrame>
      <div className="w-full h-full bg-white flex flex-col relative overflow-hidden">
        {/* Network Status Offline/Online Listener */}
        <NetworkStatusListener />
        
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div key={location.pathname} className="animate-page-slide min-h-full">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </PhoneFrame>
  );
};

export default MainLayout;
