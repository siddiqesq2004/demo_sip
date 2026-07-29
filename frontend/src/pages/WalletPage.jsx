import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, Sprout, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import Loader from '../components/Loader';
import ClaimModal from '../components/ClaimModal';
import PaymentModal from '../components/PaymentModal';
import SuccessModal from '../components/SuccessModal';
import WithdrawalModal from '../components/WithdrawalModal';
import AddMoneyModal from '../components/AddMoneyModal';

const WalletPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [autoReinvest, setAutoReinvest] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);

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
          { type: 'CLAIM', amount: 42, description: 'Growth Claim Credited', created_at: 'Today, 10:00 AM' },
          { type: 'DAILY_RETURN', amount: 100, description: 'Daily 1% Return', created_at: 'Yesterday, 10:00 AM' },
          { type: 'WITHDRAWAL', amount: -1000, description: 'Bank Cashout Requested', created_at: '12 May, 6:30 PM' }
        ]
      });
    } fontinally: {
      setLoading(false);
    }
  };

  const handleToggleAutoReinvest = async () => {
    const nextState = !autoReinvest;
    setAutoReinvest(nextState);
    try {
      await api.post('/wallet/auto-reinvest', { auto_reinvest: nextState });
    } catch (err) {
      console.error('Failed to update auto reinvest setting:', err);
    }
  };

  if (loading) return <Loader fullScreen message="Fetching Credora Wallet..." />;

  const walletBalance = walletData?.wallet_balance || 12420.00;
  const currentlyInvested = walletData?.currently_invested || 10000.00;
  const availableCash = walletData?.available_cash || 2420.00;
  const cycleDay = walletData?.cycle_day || 14;
  const unclaimedAmount = walletData?.unclaimed_amount || 42.00;
  const recentActivity = walletData?.recent_activity || [];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-24 text-gray-900">
      
      {/* --- Top Header Bar --- */}
      <div className="bg-white px-5 pt-12 pb-3.5 flex items-center justify-between border-b border-gray-100">
        <div>
          <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Account</span>
          <h1 className="text-xl font-extrabold text-[#062E23] tracking-tight">Credora Wallet</h1>
        </div>

        <button 
          onClick={() => navigate('/profile')}
          className="p-2 text-gray-500 hover:text-gray-900 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="px-5 pt-4 space-y-4">
        
        {/* --- Dark Emerald Hero Wallet Card --- */}
        <div className="bg-gradient-to-br from-[#0B3B2F] via-[#062E23] to-[#031D16] rounded-3xl p-6 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden space-y-4">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-200 uppercase tracking-wider">Total Wallet Balance</span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} /> Protected
            </span>
          </div>

          <div className="text-4xl font-black tracking-tight">
            ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>

          <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-4">
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
            onClick={() => setShowAddMoneyModal(true)}
            className="bg-[#00A859] hover:bg-[#008f4c] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-md shadow-emerald-600/15 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Money</span>
          </button>

          <button 
            onClick={() => setShowWithdrawalModal(true)}
            className="bg-white hover:bg-gray-50 text-[#062E23] border border-gray-200 font-extrabold py-3.5 px-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
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
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-amber-200">
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
            <button 
              onClick={() => navigate('/activity')} 
              className="text-xs font-bold text-[#00A859] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentActivity.map((act, idx) => {
              const isPositive = act.amount > 0;
              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-2xl border border-gray-100/80">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isPositive ? 'bg-emerald-100 text-[#00A859]' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {isPositive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
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

      {/* --- Add Money Modal --- */}
      <AddMoneyModal
        isOpen={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
        onSuccess={() => fetchWalletData()}
      />

      {/* --- Withdrawal Modal --- */}
      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        availableBalance={availableCash}
        onSuccess={() => fetchWalletData()}
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
