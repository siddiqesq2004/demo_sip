import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Eye, Plus, ArrowUp, Clock, Info, X, CheckCircle, TrendingUp, ShieldAlert, Gift, CreditCard, Check } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/Loader';
import { SkeletonDashboard } from '../components/Skeleton';
import { formatCurrency } from '../utils/formatters';

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'Just now';
  try {
    if (dateStr.includes('AM') || dateStr.includes('PM') || dateStr.toLowerCase().includes('today') || dateStr.toLowerCase().includes('yesterday')) {
      return dateStr;
    }
    let normalized = dateStr;
    if (dateStr.includes(' ') && !dateStr.includes('T') && !dateStr.includes('Z')) {
      normalized = dateStr.replace(' ', 'T') + 'Z';
    }
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return dateStr;
    
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return dateStr;
  }
};

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  // Chart Timeframe Selection State
  const [chartTimeframe, setChartTimeframe] = useState('1M');

  // Withdrawal Mobile Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('18920');
  const [withdrawRemarks, setWithdrawRemarks] = useState('');
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);
  const [primaryBank, setPrimaryBank] = useState({
    id: 1, name: 'HDFC Bank Ltd', accNo: '•••• •••• 4921', ifsc: 'HDFC0001234'
  });

  const navigate = useNavigate();

  // Interactive Chart Path Definitions
  const chartPoints = {
    '1W': { path: 'M 0,65 Q 50,55 100,48 T 200,32 T 300,16', fill: 'M 0,65 Q 50,55 100,48 T 200,32 T 300,16 L 300,90 L 0,90 Z', growth: '+17.7%', cx: 300, cy: 16 },
    '1M': { path: 'M 0,78 Q 50,68 100,52 T 200,34 T 300,12', fill: 'M 0,78 Q 50,68 100,52 T 200,34 T 300,12 L 300,90 L 0,90 Z', growth: '+32.0%', cx: 300, cy: 12 },
    '1Y': { path: 'M 0,86 Q 50,76 100,58 T 200,28 T 300,8', fill: 'M 0,86 Q 50,76 100,58 T 200,28 T 300,8 L 300,90 L 0,90 Z', growth: '+150.8%', cx: 300, cy: 8 },
    'ALL': { path: 'M 0,88 Q 50,80 100,62 T 200,22 T 300,5', fill: 'M 0,88 Q 50,80 100,62 T 200,22 T 300,5 L 300,90 L 0,90 Z', growth: '+401.7%', cx: 300, cy: 5 }
  };

  // Demo Notifications List
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'payout',
      title: 'Daily Return Credited',
      desc: '₹1,065.10 (1%) credited to your portfolio for Day 8.',
      time: 'Today, 09:30 AM',
      unread: true,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-[#00A859]'
    },
    {
      id: 2,
      type: 'milestone',
      title: 'Cycle Progress Update',
      desc: 'You completed 36% of 22 Day Growth Cycle.',
      time: 'Yesterday, 06:00 PM',
      unread: true,
      icon: CheckCircle,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 3,
      type: 'security',
      title: 'Security Login Alert',
      desc: 'Successful login from Chrome on Windows.',
      time: '21 July 2026, 12:45 PM',
      unread: false,
      icon: ShieldAlert,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 4,
      type: 'promo',
      title: 'Referral Program Active',
      desc: 'Earn ₹500 credited per friend who starts an investment.',
      time: '18 July 2026',
      unread: false,
      icon: Gift,
      color: 'bg-orange-50 text-orange-500'
    }
  ]);

  const demoFallback = {
    user: { name: localStorage.getItem('credora_user') ? JSON.parse(localStorage.getItem('credora_user')).name : 'Anish P' },
    portfolio: { total_value: 125430, invested_amount: 106510, total_returns: 18920, all_time_profit_percent: 17.76 },
    today_earning: { amount: 1065.10, percent: 1.0 },
    active_cycle: { plan_name: '22 Day Growth Cycle', current_day: 8, total_days: 22, days_left: 14, progress_percent: 36, next_payout_date: '28 July 2026' }
  };

  const fetchDashboard = async () => {
    try {
      const [resDashboard, resBanks] = await Promise.all([
        api.get('/dashboard'),
        api.get('/bank-accounts')
      ]);
      const dashboardData = resDashboard.data || demoFallback;
      setData(dashboardData);
      if (dashboardData.notifications) {
        setNotifications(dashboardData.notifications);
        setUnreadCount(dashboardData.notifications.filter(n => n.unread).length);
      }
      if (resBanks.data && resBanks.data.bank_accounts) {
        const primary = resBanks.data.bank_accounts.find(a => a.isPrimary) || resBanks.data.bank_accounts[0];
        if (primary) setPrimaryBank(primary);
      }
    } catch (error) {
      console.error('Error fetching dashboard data, using demo fallback:', error);
      setData(demoFallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const timer = setInterval(fetchDashboard, 1500);
    return () => clearInterval(timer);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  const handleConfirmWithdrawal = async () => {
    const amountNum = parseFloat(withdrawAmount || 0);
    if (amountNum > 0) {
      try {
        await api.post('/withdraw', {
          amount: amountNum,
          bank_name: primaryBank.name,
          account_no: primaryBank.accNo,
          ifsc: primaryBank.ifsc,
          remarks: withdrawRemarks || 'Personal Payout'
        });
        fetchDashboard();
      } catch (e) {
        console.log('Submitted demo withdrawal for approval');
      }
    }

    setShowWithdrawModal(false);
    setShowWithdrawSuccess(true);
  };

  if (loading) return <SkeletonDashboard />;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-[#667085]">Failed to load dashboard</div>;

  const { user, portfolio, today_earning: todayEarning, active_cycle: activeCycle } = data;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 relative">
      {/* Dark Emerald Header Section */}
      <div className="bg-[#062E23] px-4 pt-12 pb-6 rounded-b-3xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-gray-400 text-sm">Good morning,</p>
            <h1 className="text-white text-2xl font-bold">{user?.name || 'Anish P'} 👋</h1>
          </div>
          
          {/* Functional Notification Bell Button */}
          <button 
            onClick={() => setShowNotifications(true)}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white relative transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#00A859] rounded-full ring-2 ring-[#062E23] animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Portfolio Card */}
        <div className="bg-gradient-to-r from-[#0B3B2F] to-[#062E23] rounded-2xl p-5 mt-4 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-white/80 mb-2">
              <span className="text-sm">Total Portfolio Value</span>
              <Eye size={16} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              {formatCurrency(portfolio?.total_value || 125430)}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="bg-[#00A859]/20 text-[#00A859] px-2 py-1 rounded-md text-xs font-semibold">
                +{formatCurrency(portfolio?.total_returns || 18920)} ({portfolio?.all_time_profit_percent || 17.76}%)
              </span>
              <span className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded-full">All Time</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between mt-6 pt-6 border-t border-white/10 relative z-10">
            <button onClick={() => navigate('/invest')} className="flex flex-col items-center space-y-2 group">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition">
                <Plus size={20} className="text-white" />
              </div>
              <span className="text-xs text-white/80">Add Money</span>
            </button>
            <button onClick={() => setShowWithdrawModal(true)} className="flex flex-col items-center space-y-2 group">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition">
                <ArrowUp size={20} className="text-white" />
              </div>
              <span className="text-xs text-white/80">Withdraw</span>
            </button>
            <button onClick={() => navigate('/activity')} className="flex flex-col items-center space-y-2 group">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition">
                <Clock size={20} className="text-white" />
              </div>
              <span className="text-xs text-white/80">History</span>
            </button>
          </div>
        </div>
      </div>

      {/* White Content Section */}
      <div className="px-4 py-6 space-y-4">
        {/* Interactive Growth Performance Chart Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[#667085] text-xs font-medium">Growth Performance</p>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[#101828] text-base font-extrabold">{formatCurrency(portfolio?.total_value || 125430)}</span>
                <span className="bg-[#00A859]/10 text-[#00A859] px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {chartPoints[chartTimeframe].growth}
                </span>
              </div>
            </div>

            {/* Timeframe Pills */}
            <div className="flex bg-gray-100 p-0.5 rounded-lg space-x-0.5">
              {['1W', '1M', '1Y', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                    chartTimeframe === tf
                      ? 'bg-[#062E23] text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="pt-2">
            <svg viewBox="0 0 300 90" className="w-full h-24 overflow-visible">
              <defs>
                <linearGradient id="dashboardChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00A859" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00A859" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={chartPoints[chartTimeframe].fill} fill="url(#dashboardChartGrad)" />
              <path d={chartPoints[chartTimeframe].path} fill="none" stroke="#00A859" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx={chartPoints[chartTimeframe].cx} cy={chartPoints[chartTimeframe].cy} r="4" fill="#D4AF37" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Today's Earning Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[#667085] text-sm mb-1">Today's Earning</p>
            <div className="flex items-center space-x-2">
              <h3 className="text-[#101828] text-xl font-bold">{formatCurrency(todayEarning?.amount || 1065.10)}</h3>
              <span className="bg-[#00A859]/10 text-[#00A859] px-1.5 py-0.5 rounded text-xs font-semibold">
                +{todayEarning?.percent || 1}%
              </span>
            </div>
          </div>
          <div className="text-4xl">💰</div>
        </div>

        {/* 22 Day Growth Cycle Card */}
        {activeCycle && (
          <div 
            onClick={() => navigate('/portfolio')}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:border-emerald-200 transition-colors"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-[#101828] font-semibold">{activeCycle.plan_name || '22 Day Growth Cycle'}</h3>
                <Info size={16} className="text-[#667085]" />
              </div>
              <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-semibold">
                {activeCycle.days_left || 14} Days Left
              </span>
            </div>
            
            <p className="text-sm text-[#101828] font-medium mb-2">Day {activeCycle.current_day || 8} of {activeCycle.total_days || 22}</p>
            
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
              <div 
                className="bg-gradient-to-r from-[#00A859] to-[#D4AF37] h-2.5 rounded-full" 
                style={{ width: `${((activeCycle.current_day || 8) / (activeCycle.total_days || 22)) * 100}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-[#667085]">
              Next Payout on {activeCycle.next_payout_date || '28 July 2026'}
            </p>
          </div>
        )}
      </div>

      {/* --- NOTIFICATIONS BOTTOM SHEET MODAL --- */}
      {showNotifications && (
        <div onClick={() => setShowNotifications(false)} className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center pb-[68px] p-3">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-h-[75vh] overflow-y-auto scrollbar-hide rounded-3xl p-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[#101828]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-[#00A859] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-[#00A859] font-semibold hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setShowNotifications(false)} className="p-1 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notifications Feed */}
            <div className="space-y-3 mb-2">
              {([...notifications].sort((a, b) => {
                const timeA = a.time ? new Date(a.time).getTime() : 0;
                const timeB = b.time ? new Date(b.time).getTime() : 0;
                if (isNaN(timeA) || isNaN(timeB)) return 0;
                return timeB - timeA;
              })).map((item) => {
                const getNotificationMetadata = (type) => {
                  switch (type) {
                    case 'payout':
                      return { icon: TrendingUp, color: 'bg-emerald-50 text-[#00A859]' };
                    case 'milestone':
                      return { icon: CheckCircle, color: 'bg-blue-50 text-blue-600' };
                    case 'security':
                      return { icon: ShieldAlert, color: 'bg-purple-50 text-purple-600' };
                    case 'promo':
                      return { icon: Gift, color: 'bg-orange-50 text-orange-500' };
                    case 'withdrawal_pending':
                      return { icon: Clock, color: 'bg-amber-50 text-amber-600' };
                    case 'withdrawal_approved':
                      return { icon: CheckCircle, color: 'bg-emerald-50 text-[#00A859]' };
                    case 'withdrawal_rejected':
                      return { icon: X, color: 'bg-red-50 text-red-600' };
                    default:
                      return { icon: Info, color: 'bg-gray-50 text-gray-500' };
                  }
                };
                const meta = getNotificationMetadata(item.type);
                const IconComponent = meta.icon;
                return (
                  <div 
                    key={item.id} 
                    className={`p-3.5 rounded-2xl border transition-all flex items-start space-x-3 ${
                      item.unread ? 'bg-emerald-50/40 border-emerald-100' : 'bg-gray-50/70 border-gray-100'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                      <IconComponent size={18} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="font-bold text-[#101828] text-xs">{item.title}</h4>
                        <span className="text-[10px] text-gray-400">{formatDateTime(item.time)}</span>
                      </div>
                      <p className="text-xs text-[#667085] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- INSTANT WITHDRAWAL MOBILE BOTTOM SHEET MODAL --- */}
      {showWithdrawModal && (
        <div onClick={() => setShowWithdrawModal(false)} className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center pb-[68px] p-3">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-h-[78vh] overflow-y-auto scrollbar-hide rounded-3xl p-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#101828]">Instant Payout Withdrawal</h3>
                <p className="text-xs text-[#667085]">Available Returns: {formatCurrency(portfolio?.total_returns || 18920)}</p>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="p-1 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Amount Input */}
              <div>
                <label className="text-xs text-[#667085] font-medium block mb-1">Withdrawal Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base">₹</span>
                  <input 
                    type="number" 
                    value={withdrawAmount} 
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 focus:border-[#00A859] rounded-xl pl-9 pr-4 py-3 text-base font-bold text-[#101828] outline-none" 
                  />
                </div>
              </div>

              {/* Destination Bank Card */}
              <div>
                <label className="text-xs text-[#667085] font-medium block mb-1">Payout Destination</label>
                <div className="bg-gradient-to-r from-[#062E23] to-[#0B3B2F] rounded-2xl p-4 text-white shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                      <CreditCard size={20} className="text-[#34D399]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{primaryBank?.name || 'HDFC Bank Ltd'}</h4>
                      <p className="text-xs text-emerald-200 font-mono">{primaryBank?.accNo || '•••• •••• 4921'}</p>
                    </div>
                  </div>
                  <span className="bg-[#00A859] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                    <Check size={10} className="mr-0.5" /> Verified
                  </span>
                </div>
              </div>

              {/* Remarks / Reason Input */}
              <div>
                <label className="text-xs text-[#667085] font-medium block mb-1">Reason / Remarks for Withdrawal</label>
                <input 
                  type="text" 
                  value={withdrawRemarks} 
                  onChange={(e) => setWithdrawRemarks(e.target.value)}
                  placeholder="e.g. Monthly Savings, Personal Payout, Emergency"
                  className="w-full bg-gray-50 border border-gray-300 focus:border-[#00A859] rounded-xl px-4 py-2.5 text-xs text-[#101828] outline-none" 
                />
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-medium">Speed:</span>
                <span className="font-bold text-[#00A859]">Instant IMPS Transfer (24x7)</span>
              </div>
            </div>

            <button onClick={handleConfirmWithdrawal} className="w-full bg-[#00A859] hover:bg-[#00904d] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-colors">
              Confirm Instant Withdrawal {formatCurrency(parseFloat(withdrawAmount || 0))}
            </button>
          </div>
        </div>
      )}

      {/* --- WITHDRAWAL SUBMITTED MOBILE MODAL --- */}
      {showWithdrawSuccess && (
        <div onClick={() => setShowWithdrawSuccess(false)} className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-6 animate-fade-in">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-xs rounded-3xl p-6 text-center shadow-2xl animate-slide-up flex flex-col items-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-600 border border-amber-200">
              <Clock size={36} />
            </div>
            <h3 className="text-lg font-bold text-[#101828] mb-1">Withdrawal Requested!</h3>
            <p className="text-xs text-[#667085] mb-4 leading-relaxed">
              Your request for <strong className="text-[#101828]">{formatCurrency(parseFloat(withdrawAmount || 18920))}</strong> is queued for review by our officials. Once approved, funds will credit to your {primaryBank?.name || 'HDFC Bank Ltd'} account ({primaryBank?.accNo || '•••• •••• 4921'}). Please check your notification drawer frequently for live status updates.
            </p>
            <div className="w-full bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 text-[11px] text-amber-800 font-medium mb-5">
              <span>⏳ Status: Awaiting Official Review</span>
            </div>
            <button 
              onClick={() => setShowWithdrawSuccess(false)}
              className="w-full bg-[#062E23] text-white py-3.5 rounded-xl font-bold text-xs shadow-md"
            >
              Understand & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
