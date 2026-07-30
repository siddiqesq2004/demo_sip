import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Users, ShieldCheck, CreditCard, Eye, X, CheckCircle, ArrowUpRight, MessageSquare, Clock, Flame } from 'lucide-react';

export default function AdminUsersPage() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader label="Loading users database..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Investor Profiles & Accounts</span>
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
              {users.length} Registered
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">View investor profile details, uploaded photos, and portfolio allocations</p>
        </div>
      </div>

      {/* Users Table */}
      {users.length > 0 ? (
        <div className="bg-slate-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-4">Investor Profile</th>
                  <th className="p-4">Total Portfolio</th>
                  <th className="p-4">Invested Capital</th>
                  <th className="p-4">Available Cash</th>
                  <th className="p-4">Total Returns</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Inspect Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => setSelectedUser(u)}>
                    <td className="p-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/50 shadow-md flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div>
                          <div className="text-white font-bold text-sm flex items-center gap-1.5">
                            <span>{u.name}</span>
                            <ShieldCheck size={14} className="text-emerald-400" />
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono block">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-extrabold text-white text-sm">
                      {formatCurrency(u.total_value)}
                    </td>

                    <td className="p-4 text-gray-300 font-semibold">
                      {formatCurrency(u.invested_amount)}
                    </td>

                    <td className="p-4 text-emerald-300 font-bold">
                      {formatCurrency(u.available_cash || 2420)}
                    </td>

                    <td className="p-4 font-bold text-emerald-400">
                      +{formatCurrency(u.total_returns)}
                    </td>

                    <td className="p-4 text-gray-400">
                      {formatDate(u.created_at)}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(u);
                        }}
                        className="bg-emerald-950 hover:bg-[#00A859] text-emerald-300 hover:text-white border border-emerald-800 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all shadow-sm flex items-center gap-1.5 ml-auto"
                      >
                        <Eye size={14} />
                        <span>View Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No Users Registered" description="No users found in database." icon={Users} />
      )}

      {/* --- User Profile Inspection Modal --- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-white animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 border-b border-gray-800 pb-5 mb-5">
              {selectedUser.avatar_url ? (
                <img
                  src={selectedUser.avatar_url}
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-lg flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-300 border-2 border-amber-400/40 flex items-center justify-center font-black text-2xl flex-shrink-0">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-white">{selectedUser.name}</h2>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle size={10} /> Verified Investor
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedUser.email}</p>
                <p className="text-[11px] text-gray-500 mt-1">Joined: {formatDate(selectedUser.created_at)}</p>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Portfolio Financial Breakdown</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Portfolio Value</span>
                  <span className="text-base font-black text-white mt-1 block">{formatCurrency(selectedUser.total_value)}</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Available Cash</span>
                  <span className="text-base font-black text-emerald-400 mt-1 block">{formatCurrency(selectedUser.available_cash || 2420)}</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Currently Invested</span>
                  <span className="text-sm font-extrabold text-gray-200 mt-1 block">{formatCurrency(selectedUser.invested_amount)}</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Returns</span>
                  <span className="text-sm font-extrabold text-emerald-400 mt-1 block">+{formatCurrency(selectedUser.total_returns)}</span>
                </div>
              </div>

              {/* Linked Banks */}
              <div className="pt-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Linked Payout Accounts</h3>
                <div className="space-y-2">
                  {(selectedUser.bank_accounts || []).map((b, i) => (
                    <div key={i} className="bg-slate-950 p-3 rounded-2xl border border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center">
                          <CreditCard size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{b.name || 'HDFC Bank Ltd'}</div>
                          <span className="text-[10px] text-gray-400 font-mono">{b.acc_no || b.accNo || '•••• •••• 4921'} ({b.ifsc || 'HDFC0001234'})</span>
                        </div>
                      </div>
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-end gap-3">
              <button
                onClick={() => navigate('/admin/withdrawals')}
                className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowUpRight size={14} />
                <span>Withdrawal Queue</span>
              </button>

              <button
                onClick={() => navigate('/admin/support')}
                className="bg-[#00A859] hover:bg-[#008f4c] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
              >
                <MessageSquare size={14} />
                <span>Support Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
