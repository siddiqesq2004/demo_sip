import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, Trophy, User } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { path: '/', label: 'Home', icon: Home, exact: true },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/leaderboard', label: 'Ranks', icon: Trophy },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 items-center px-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 tab-press py-1 rounded-xl transition-all ${
                  isActive 
                    ? 'text-[#062E23] font-bold scale-105' 
                    : 'text-gray-400 font-medium hover:text-gray-600'
                }`
              }
            >
              <Icon size={22} strokeWidth={2} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
