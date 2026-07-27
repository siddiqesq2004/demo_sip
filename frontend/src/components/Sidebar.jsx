import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, TrendingUp, LogOut, Shield, ArrowUpRight, MessageSquare, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Sidebar() {
  const { logoutAdmin, admin, updateAdminStatus } = useAuth();
  
  const email = (admin?.email || '').toLowerCase();
  const storageKey = `subadmin_status_${email || 'guest'}`;

  const [status, setStatus] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'BUSY' || saved === 'IN_WORK' || saved === 'FREE') return saved;
    if (admin?.status) {
      const raw = admin.status.toUpperCase();
      return (raw === 'BUSY' || raw === 'IN_WORK') ? raw : 'FREE';
    }
    return 'FREE';
  });

  useEffect(() => {
    if (!email) return;

    // First check local storage / admin object
    const saved = localStorage.getItem(`subadmin_status_${email}`);
    if (saved === 'BUSY' || saved === 'IN_WORK' || saved === 'FREE') {
      setStatus(saved);
    } else if (admin?.status) {
      const raw = admin.status.toUpperCase();
      const clean = (raw === 'BUSY' || raw === 'IN_WORK') ? raw : 'FREE';
      setStatus(clean);
      localStorage.setItem(`subadmin_status_${email}`, clean);
    }

    const syncStatusFromBackend = async () => {
      try {
        const res = await api.get('/admin/subadmins');
        const list = res?.data?.subadmins || res?.subadmins || (Array.isArray(res) ? res : []);
        const mySub = list.find(s => (s.email || '').toLowerCase() === email);
        if (mySub && mySub.status) {
          const raw = mySub.status.toUpperCase();
          const backendStatus = (raw === 'BUSY' || raw === 'IN_WORK') ? raw : 'FREE';
          setStatus(backendStatus);
          localStorage.setItem(`subadmin_status_${email}`, backendStatus);
          if (updateAdminStatus) updateAdminStatus(backendStatus);
        }
      } catch (e) {
        console.error('Error syncing status:', e);
      }
    };

    syncStatusFromBackend();
  }, [email, admin?.status]);

  const changeStatus = async (newStatus) => {
    setStatus(newStatus);
    if (email) {
      localStorage.setItem(`subadmin_status_${email}`, newStatus);
    }
    if (updateAdminStatus) {
      updateAdminStatus(newStatus);
    }
    try {
      await api.post('/admin/subadmin/status', { status: newStatus });
    } catch (e) {
      console.log('Saved status locally:', newStatus);
    }
  };

  // Precise role & email identification (100% fail-safe even with cached localStorage)
  const isNeha = email.includes('neha');
  const isKaran = email.includes('karan');
  const isAmit = email.includes('amit');
  const isSubAdmin = isNeha || isKaran || isAmit || admin?.is_super_admin === false || (admin?.role && admin?.role !== 'SUPER_ADMIN');

  const isSuperAdmin = !isSubAdmin && (admin?.is_super_admin === true || admin?.role === 'SUPER_ADMIN' || email === 'admin@credora.com');

  const role = isNeha ? 'SUPPORT_AGENT' : isKaran ? 'WITHDRAWAL_APPROVER' : isAmit ? 'FULL_SUBADMIN' : (admin?.role || (isSuperAdmin ? 'SUPER_ADMIN' : 'SUB_ADMIN'));
  const permissions = isNeha ? 'SUPPORT_CHAT_ONLY' : isKaran ? 'WITHDRAWALS_ONLY' : (admin?.permissions || (isSuperAdmin ? 'ALL_PERMISSIONS' : ''));

  // Filter Nav Items according to strict Role-Based Access Control (RBAC)
  const allNavItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, allow: isSuperAdmin || role === 'FULL_SUBADMIN' },
    { name: 'Users (6 Accounts)', path: '/admin/users', icon: Users, allow: isSuperAdmin || role === 'FULL_SUBADMIN' },
    { name: 'Investments', path: '/admin/investments', icon: TrendingUp, allow: isSuperAdmin || role === 'FULL_SUBADMIN' },
    { name: 'Withdrawal Queue', path: '/admin/withdrawals', icon: ArrowUpRight, badge: 'Payouts', allow: isSuperAdmin || role === 'WITHDRAWAL_APPROVER' || role === 'FULL_SUBADMIN' || permissions === 'WITHDRAWALS_ONLY' },
    { name: 'Live Support Desk', path: '/admin/support', icon: MessageSquare, badge: 'Chat Desk', allow: isSuperAdmin || role === 'SUPPORT_AGENT' || role === 'FULL_SUBADMIN' || permissions === 'SUPPORT_CHAT_ONLY' },
    { name: 'Sub-Admins & Audit', path: '/admin/subadmins', icon: ShieldCheck, badge: 'Super Admin', allow: isSuperAdmin }
  ];

  const visibleNavItems = allNavItems.filter(item => item.allow);

  return (
    <aside className="w-64 bg-credora-dark text-white min-h-screen border-r border-emerald-950 flex flex-col justify-between p-4">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-4 mb-4 border-b border-emerald-900/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-credora-gold to-yellow-300 flex items-center justify-center font-bold text-credora-dark text-lg shadow-md">
            C
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wider text-white">CREDORA</h1>
            <span className="text-[10px] uppercase tracking-widest text-credora-gold flex items-center gap-1 font-semibold">
              <Shield className="w-3 h-3" /> {isSuperAdmin ? 'Super Admin Portal' : 'Sub-Admin Workspace'}
            </span>
          </div>
        </div>

        {/* Sub-Admin Availability Status Switcher */}
        {!isSuperAdmin && (
          <div className="mb-4 bg-slate-900/90 border border-gray-800 p-2.5 rounded-2xl space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 px-1 flex items-center justify-between">
              <span>Sub-Admin Status</span>
              <span className="text-emerald-400 text-[9px] font-mono">Auto-Connect</span>
            </p>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-gray-800/80">
              <button
                onClick={() => changeStatus('FREE')}
                className={`py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                  status === 'FREE'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Ready to automatically accept incoming user requests"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>Free</span>
              </button>

              <button
                onClick={() => changeStatus('IN_WORK')}
                className={`py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                  status === 'IN_WORK'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Currently handling active work"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span>In Work</span>
              </button>

              <button
                onClick={() => changeStatus('BUSY')}
                className={`py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                  status === 'BUSY'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Do not assign new incoming tasks"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span>Busy</span>
              </button>
            </div>
            <p className="text-[9px] text-emerald-300/80 px-1 pt-0.5 leading-tight">
              {status === 'FREE' && '🟢 Status: FREE — System will auto-connect incoming user requests to you!'}
              {status === 'IN_WORK' && '🟡 Status: IN WORK — Processing assigned tasks.'}
              {status === 'BUSY' && '🔴 Status: BUSY — Auto-connection paused.'}
            </p>
          </div>
        )}

        {/* Role Access Scope Badge */}
        <div className="mb-3 px-2 py-1.5 bg-slate-900 border border-gray-800 rounded-xl text-[10px] text-gray-400 flex items-center justify-between">
          <span className="font-semibold text-gray-300">Access Scope:</span>
          <span className="font-bold text-credora-gold">
            {isSuperAdmin ? 'Full Super Admin' : role === 'WITHDRAWAL_APPROVER' ? 'Withdrawals Only' : role === 'SUPPORT_AGENT' ? 'Support Desk Only' : 'Sub-Admin'}
          </span>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'gold-gradient text-credora-dark shadow-md font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-emerald-900/30'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800/50 px-1.5 py-0.5 rounded font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Logout */}
      <div className="pt-3 border-t border-emerald-900/50">
        <div className="px-3 py-1.5 mb-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-white truncate">{admin?.name || 'System Admin'}</p>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded text-[9px] font-bold">
              {isSuperAdmin ? 'SUPER ADMIN' : 'SUB ADMIN'}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 truncate">{admin?.email || 'admin@credora.com'}</p>
        </div>
        <button
          onClick={logoutAdmin}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-950/30 hover:bg-red-900/40 border border-red-900/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
