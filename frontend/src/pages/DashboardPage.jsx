import React, { useState, useEffect } from 'react';
import { Bell, Eye, EyeOff, Plus, ArrowUpRight, Clock, Info, Sprout, ChevronRight, Flame, Sparkles } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import Loader from '../components/Loader';
import ClaimModal from '../components/ClaimModal';
import PaymentModal from '../components/PaymentModal';
import SuccessModal from '../components/SuccessModal';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [showValue, setShowValue] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading Credora Growth Engine..." />;

  const user = dashboardData?.user || { name: 'Anish P' };
  const portfolio = dashboardData?.portfolio || { total_value: 5842.00, invested_amount: 5000.00, total_returns: 842.00 };
  const activeCycle = dashboardData?.active_cycle || { current_day: 14, total_days: 22, days_left: 8, plan_name: '22-Day Growth Cycle' };
  const unclaimedAmount = dashboardData?.unclaimed_amount || 42.00;
  const unclaimedCount = dashboardData?.unclaimed_count || 1;
  const streakCount = dashboardData?.streak_count || 18;

  // Calculate circular progress percentage (14 / 22 = ~63.6%)
  const progressPercent = Math.round((activeCycle.current_day / activeCycle.total_days) * 100);

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-24 text-gray-900">
      
      {/* --- Top Welcome Bar --- */}
      <div className="bg-white px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
        <div>
          <span className="text-xs font-semibold text-gray-400 block">Good Morning,</span>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#062E23] tracking-tight">{user.name || 'Anish'} 👋</h1>
            
            {/* Streak Counter Header Badge */}
            <div className="bg-orange-50 border border-orange-200 text-orange-600 px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-black shadow-xs">
              <Flame size={12} className="fill-orange-500 text-orange-500" />
              <span>{streakCount}d</span>
            </div>
          </div>
        </div>

        <button className="relative p-2.5 text-gray-500 hover:text-gray-900 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#00A859] rounded-full ring-2 ring-white"></span>
        </button>
      </div>

      <div className="px-5 pt-4 space-y-4">
        
        {/* --- Dark Emerald Hero Portfolio Card --- */}
        <div className="bg-gradient-to-br from-[#0B3B2F] via-[#062E23] to-[#031D16] rounded-3xl p-6 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-emerald-200">Portfolio Value</span>
              <button onClick={() => setShowValue(!showValue)} className="text-emerald-300 hover:text-white">
                {showValue ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
            
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              ▲ 16.8% vs last cycle
            </span>
          </div>

          {/* Portfolio Amount */}
          <div className="text-4xl font-extrabold tracking-tight mb-4">
            {showValue ? `₹${portfolio.total_value.toLocaleString('en-IN', { minimumFractionDigits: 0 })}` : '••••••••'}
          </div>

          {/* Current Cycle Growth Row */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-gray-300 font-medium">Current Cycle Growth</span>
            <span className="font-extrabold text-emerald-300 text-sm">
              +{formatCurrency(portfolio.total_returns || 842)}
            </span>
          </div>
        </div>

        {/* --- "Claim to Unlock" Today's Growth Card --- */}
        <div className="bg-gradient-to-br from-amber-50 via-amber-50/60 to-yellow-50/40 rounded-3xl p-5 border border-amber-200/80 shadow-md shadow-amber-500/5 relative overflow-hidden">
          
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">
                <Sprout size={16} className="text-[#00A859]" />
                <span>Today's Growth Ready</span>
              </div>
              
              <div className="text-3xl font-black text-[#00A859]">
                +₹{unclaimedAmount.toLocaleString('en-IN')} 🎉
              </div>
            </div>

            {/* Plant Sprout Glass Illustration */}
            <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-sm border border-amber-200 flex items-center justify-center text-3xl animate-bounce">
              🪴
            </div>
          </div>

          {/* Claim Today's Growth Button */}
          <button
            onClick={() => setShowClaimModal(true)}
            className="w-full bg-[#00A859] hover:bg-[#008f4c] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            <span>{unclaimedCount > 1 ? `Claim ${unclaimedCount} Days Rewards (+₹${unclaimedAmount})` : "Claim Today's Growth"}</span>
          </button>

          <p className="text-[11px] text-amber-800 text-center font-medium mt-2">
            Growth accrues automatically. Claim anytime to unlock it into visible cash balance.
          </p>
        </div>

        {/* --- 22-Day Growth Cycle Circular Progress Card --- */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#062E23]">22-Day Growth Cycle</h2>
            <span className="text-xs font-bold text-[#00A859] bg-emerald-50 px-2.5 py-1 rounded-full">
              {activeCycle.days_left} Days Remaining
            </span>
          </div>

          <div className="flex items-center gap-5">
            {/* SVG Circular Progress Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#00A859] transition-all duration-1000 ease-out"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Day</span>
                <span className="text-base font-black text-[#062E23]">{activeCycle.current_day} / 22</span>
              </div>
            </div>

            {/* Cycle Details */}
            <div className="space-y-1.5 flex-1">
              <div className="text-sm font-extrabold text-[#062E23]">{activeCycle.plan_name}</div>
              <div className="text-xs text-gray-500 font-medium">1% Daily Returns • Mon-Fri Active</div>
              
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold">
                <Clock size={14} className="text-[#00A859]" />
                <span>Next Credit: <strong className="text-[#062E23]">Tomorrow • 10:00 AM</strong></span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* --- Claim Growth Modal --- */}
      <ClaimModal 
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        unclaimedData={{ unclaimed_amount: unclaimedAmount, unclaimed_count: unclaimedCount, streak_count: streakCount }}
        onClaimSuccess={() => fetchDashboardData()}
      />

      {/* --- Deposit Modal --- */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={5000}
        onSuccess={() => {
          setShowPaymentModal(false);
          setShowSuccessModal(true);
          fetchDashboardData();
        }}
      />

      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Investment Cycle Active!"
        message="Your 22-day growth cycle has started."
      />

    </div>
  );
};

export default DashboardPage;
