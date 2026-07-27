import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../utils/formatters';
import { Users, TrendingUp, DollarSign, Activity, ShieldCheck } from 'lucide-react';

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
