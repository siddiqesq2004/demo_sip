import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Users } from 'lucide-react';

export default function AdminUsersPage() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
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
      fetchUsers();
    }
  }, [admin, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.success && res.data?.users) {
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
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Super Admin - User Management</h1>
          <p className="text-xs text-gray-400 mt-1">View registered investors and portfolio allocations</p>
        </div>
      </div>

      {users.length > 0 ? (
        <div className="bg-slate-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Total Portfolio</th>
                  <th className="p-4">Invested</th>
                  <th className="p-4">Total Returns</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-credora-deep text-credora-gold flex items-center justify-center font-black">
                        {u.name.charAt(0)}
                      </div>
                      {u.name}
                    </td>
                    <td className="p-4 text-gray-400">{u.email}</td>
                    <td className="p-4 font-bold text-white">{formatCurrency(u.total_value)}</td>
                    <td className="p-4 text-gray-300">{formatCurrency(u.invested_amount)}</td>
                    <td className="p-4 font-bold text-emerald-400">+{formatCurrency(u.total_returns)}</td>
                    <td className="p-4 text-gray-400">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No Users Registered" description="No users found in database." icon={Users} />
      )}
    </div>
  );
}
