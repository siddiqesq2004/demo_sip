import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../utils/formatters';
import { Users, TrendingUp, DollarSign, Activity, ShieldCheck, BarChart3 } from 'lucide-react';

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marketRateData, setMarketRateData] = useState(null);
  const [newRate, setNewRate] = useState('');
  const [settingRate, setSettingRate] = useState(false);

  useEffect(() => {
    const email = (admin?.email || '').toLowerCase();
    const isNeha = email.includes('neha') || admin?.role === 'SUPPORT_AGENT' || admin?.permissions === 'SUPPORT_CHAT_ONLY';
    const isKaran = email.includes('karan') || admin?.role === 'WITHDRAWAL_APPROVER' || admin?.permissions === 'WITHDRAWALS_ONLY';

    if (isNeha) {
      navigate('/admin/support', { replace: true });
    } else if (isKaran) {
      navigate('/admin/withdrawals', { replace: true });
    } else {
      fetchStats();
      fetchMarketRate();
    }
  }, [admin, navigate]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketRate = async () => {
    try {
      const res = await api.get('/admin/market-rate');
      if (res.success && res.data) {
        setMarketRateData(res.data);
        setNewRate(res.data.today?.rate?.toFixed(2) || '0.78');
      }
    } catch (err) {
      console.error('Error fetching market rate:', err);
    }
  };

  const handleSetRate = async () => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate < 0.50 || rate > 1.00) {
      alert('Rate must be between 0.50 and 1.00');
      return;
    }
    setSettingRate(true);
    try {
      await api.post('/admin/market-rate', { rate: rate });
      await fetchMarketRate();
    } catch (err) {
      console.error('Error setting market rate:', err);
    } finally {
      setSettingRate(false);
    }
  };

  if (loading) return <Loader label="Loading admin metrics console..." />;

  const data = stats || {
    total_users: 6,
    active_investments_count: 6,
    total_platform_portfolio: 965930,
    total_invested_capital: 850000
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Super Admin Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">Real-time overview of platform activity & investor metrics</p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold">
          <ShieldCheck className="w-4 h-4" /> System Healthy
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={data.total_users}
          subtitle="Registered Investor Accounts"
          icon={Users}
          trend="+100% Growth"
        />

        <StatCard
          title="Active Investments"
          value={data.active_investments_count}
          subtitle="Running Growth Cycles"
          icon={TrendingUp}
          trend="Active"
        />

        <StatCard
          title="Platform Portfolio"
          value={formatCurrency(data.total_platform_portfolio)}
          subtitle="Total Client Assets"
          icon={DollarSign}
        />

        <StatCard
          title="Invested Capital"
          value={formatCurrency(data.total_invested_capital)}
          subtitle="Active Locked Value"
          icon={Activity}
        />
      </div>

      {/* Market Rate Control Panel */}
      <div className="bg-slate-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Market Rate Control
          </h3>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${marketRateData?.today?.source === 'ADMIN' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
            {marketRateData?.today?.source === 'ADMIN' ? '🔧 Admin Set' : '📈 Auto-Generated'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide block font-medium">Today's Rate</span>
            <span className="text-3xl font-black text-emerald-400">{marketRateData?.today?.rate?.toFixed(2) || '0.78'}%</span>
            <span className="text-[10px] text-gray-500 block mt-1">{marketRateData?.today?.date || 'Loading...'}</span>
          </div>
          
          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50 space-y-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide block font-medium">Set Custom Rate</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.50"
                max="1.00"
                step="0.01"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="w-20 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm font-bold text-center focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-gray-400 font-medium">%</span>
            </div>
            <button
              onClick={handleSetRate}
              disabled={settingRate}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
            >
              {settingRate ? 'Setting...' : 'Apply Rate'}
            </button>
          </div>
        </div>
        
        {/* Rate History */}
        {marketRateData?.history && marketRateData.history.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
              <BarChart3 className="w-4 h-4" />
              <span>7-Day Rate History</span>
            </div>
            <div className="flex items-end gap-1.5 h-16">
              {marketRateData.history.slice(0, 7).reverse().map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className={`w-full rounded-t-sm transition-all ${
                      day.is_weekend ? 'bg-gray-700' : day.source === 'ADMIN' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                    style={{ height: `${day.is_weekend ? 4 : Math.max(8, (day.rate / 1.0) * 48)}px` }}
                    title={`${day.date}: ${day.rate}% (${day.source})`}
                  />
                  <span className="text-[8px] text-gray-500 font-medium">{day.day_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-[10px] text-gray-500">
          Market rates range from 0.50% to 1.00% daily. Rates are auto-generated based on market conditions unless manually overridden.
        </p>
      </div>

      {/* Quick Admin Note Banner */}
      <div className="bg-slate-900 border border-gray-800 rounded-2xl p-6 text-sm text-gray-300 space-y-2">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          ⚡ Demo Platform Controls
        </h3>
        <p className="text-xs text-gray-400">
          This super admin console aggregates user portfolio values and investment cycles directly from the database store (<code className="text-credora-gold">users</code>, <code className="text-credora-gold">investments</code>, <code className="text-credora-gold">portfolio</code>). Sub-admins have strict role-based access to their assigned workspace.
        </p>
      </div>
    </div>
  );
}
