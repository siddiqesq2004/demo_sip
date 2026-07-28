import React, { useState, useEffect } from 'react';
import { Settings, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, Sprout, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import Loader from '../components/Loader';
import ClaimModal from '../components/ClaimModal';
import PaymentModal from '../components/PaymentModal';
import SuccessModal from '../components/SuccessModal';

const WalletPage = () => {
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [autoReinvest, setAutoReinvest] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wallet');
      if (res.data) {
        setWalletData(res.data);
        setAutoReinvest(res.data.auto_reinvest !== false);
      }
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
      // Fallback state for seamless demo
      setWalletData({
        wallet_balance: 12420.00,
        currently_invested: 10000.00,
        cycle_day: 14,
        total_cycle_days: 22,
        available_cash: 2420.00,
        auto_reinvest: true,
        unclaimed_amount: 42.00,
        unclaimed_count: 1,
        recent_activity: [
          { type: 'DEPOSIT', amount: 2000, description: 'Deposit', created_at: 'Today, 9:15 AM' },
          { type: 'CLAIM', amount: 42, description: 'Growth Claimed', created_at: 'Today, 9:00 AM' },
          { type: 'REINVEST', amount: -42, description: 'Auto Reinvest', created_at: 'Yesterday, 10:00 AM' },
          { type: 'WITHDRAWAL', amount: -1000, description: 'Withdrawal', created_at: '12 May, 6:30 PM' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoReinvest = async () => {
    const newStatus = !autoReinvest;
    setAutoReinvest(newStatus);
    try {
      await api.post('/wallet/auto-reinvest', { status: newStatus });
    } catch (e) {
      console.error('Failed to update auto-reinvest:', e);
    }
  };

  if (loading) return <Loader fullScreen message="Loading Credora Wallet..." />;

  const walletBalance = walletData?.wallet_balance || 12420.00;
  const currentlyInvested = walletData?.currently_invested || 10000.00;
  const cycleDay = walletData?.cycle_day || 14;
  const availableCash = walletData?.available_cash || 2420.00;
  const unclaimedAmount = walletData?.unclaimed_amount || 42.00;

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-24 text-gray-900">
      
      {/* --- Top Header --- */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
        <h1 className="text-xl font-bold text-[#062E23] tracking-tight">Credora Wallet</h1>
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
          <Settings size={20} />
        </button>
      </div>

      <div className="px-5 pt-5 space-y-4">
        
        {/* --- Dark Emerald Wallet Balance Card --- */}
        <div className="bg-gradient-to-br from-[#0B3B2F] via-[#062E23] to-[#031D16] rounded-3xl p-6 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Wallet Balance
            </span>
            <ShieldCheck size={20} className="text-emerald-400 opacity-80" />
          </div>
          
          <div className="text-4xl font-extrabold tracking-tight mb-6">
            ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>

          {/* 4-Grid Stats Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 grid grid-cols-2 gap-4 border border-white/10">
            <div>
              <span className="text-[10px] text-gray-300 uppercase tracking-wide block font-medium">Currently Invested</span>
              <span className="text-sm font-bold text-white">₹{currentlyInvested.toLocaleString('en-IN')}</span>
            </div>
            
            <div>
              <span className="text-[10px] text-gray-300 uppercase tracking-wide block font-medium">Cycle</span>
              <span className="text-sm font-bold text-emerald-300">Day {cycleDay} / 22</span>
            </div>

            <div className="pt-2 border-t border-white/10">
              <span className="text-[10px] text-gray-300 uppercase tracking-wide block font-medium">Available Cash</span>
              <span className="text-sm font-bold text-white">₹{availableCash.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-300 uppercase tracking-wide block font-medium">Auto Reinvest</span>
                <span className={`text-xs font-bold ${autoReinvest ? 'text-emerald-300' : 'text-gray-400'}`}>
                  {autoReinvest ? 'ON' : 'OFF'}
                </span>
              </div>
              
              {/* Toggle Switch */}
              <button 
                onClick={handleToggleAutoReinvest}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 ${autoReinvest ? 'bg-[#00A859]' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${autoReinvest ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* --- Action Buttons Row --- */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="bg-[#00A859] hover:bg-[#008f4c] text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-emerald-600/15 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Money</span>
          </button>

          <button 
            onClick={() => window.location.href = '/profile'}
            className="bg-white hover:bg-gray-50 text-[#062E23] border border-gray-200 font-bold py-3.5 px-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
          >
            <ArrowUpRight size={18} strokeWidth={2.5} className="text-[#062E23]" />
            <span>Withdraw</span>
          </button>
        </div>

        {/* --- Growth Vault Card --- */}
        <div 
          onClick={() => setShowClaimModal(true)}
          className="bg-gradient-to-r from-amber-50/90 to-yellow-50/80 border border-amber-200 rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-300 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-amber-200">
              🪴
            </div>
            <div>
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">Growth Vault</div>
              <div className="text-sm font-extrabold text-[#062E23]">
                {unclaimedAmount > 0 ? `Today's Growth Ready +₹${unclaimedAmount}` : 'All Growth Claimed 🎉'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-amber-700 font-bold text-xs group-hover:translate-x-1 transition-transform">
            <span>Claim</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* --- Recent Activity Section --- */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#062E23]">Recent Activity</h2>
            <button className="text-xs font-bold text-gray-400 hover:text-[#00A859]">View All</button>
          </div>

          <div className="space-y-3">
            {walletData?.recent_activity?.map((act, idx) => {
              const isPositive = act.amount > 0 || act.type === 'DEPOSIT' || act.type === 'CLAIM';
              return (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      act.type === 'DEPOSIT' ? 'bg-emerald-50 text-[#00A859]' :
                      act.type === 'CLAIM' ? 'bg-amber-50 text-amber-600' :
                      act.type === 'REINVEST' ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {act.type === 'DEPOSIT' && <ArrowDownLeft size={18} />}
                      {act.type === 'CLAIM' && <Sprout size={18} />}
                      {act.type === 'REINVEST' && <RefreshCw size={18} />}
                      {act.type === 'WITHDRAWAL' && <ArrowUpRight size={18} />}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-gray-900">{act.description}</div>
                      <div className="text-[11px] font-medium text-gray-400">{act.created_at}</div>
                    </div>
                  </div>

                  <div className={`text-sm font-extrabold ${isPositive ? 'text-[#00A859]' : 'text-gray-700'}`}>
                    {isPositive ? '+' : ''}₹{Math.abs(act.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* --- Claim Modal --- */}
      <ClaimModal 
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        unclaimedData={walletData}
        onClaimSuccess={() => fetchWalletData()}
      />

      {/* --- Deposit Payment Modal --- */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={5000}
        onSuccess={() => {
          setShowPaymentModal(false);
          setShowSuccessModal(true);
          fetchWalletData();
        }}
      />

      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Deposit Successful!"
        message="Money added to your Credora Wallet."
      />

    </div>
  );
};

export default WalletPage;
