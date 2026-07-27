import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TrendingUp, CheckCircle } from 'lucide-react';

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const res = await api.get('/admin/investments');
      if (res.success && res.data?.investments) {
        setInvestments(res.data.investments);
      }
    } catch (err) {
      console.error('Error fetching admin investments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader label="Loading investments database..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Investments Management</h1>
          <p className="text-xs text-gray-400 mt-1">Track active and completed user growth cycles</p>
        </div>
      </div>

      {investments.length > 0 ? (
        <div className="bg-slate-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Invested Amount</th>
                  <th className="p-4">Expected Profit</th>
                  <th className="p-4">Current Day</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-200">
                {investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-gray-400">#{inv.id}</td>
                    <td className="p-4 font-bold text-white">
                      {inv.user_name}
                      <span className="text-[10px] font-normal text-gray-400 block">{inv.user_email}</span>
                    </td>
                    <td className="p-4 font-bold text-gray-300">{inv.plan_name}</td>
                    <td className="p-4 font-bold text-white">{formatCurrency(inv.amount)}</td>
                    <td className="p-4 font-bold text-emerald-400">+{formatCurrency(inv.expected_returns)}</td>
                    <td className="p-4 text-gray-300 font-semibold">Day {inv.current_day}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" /> {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{formatDate(inv.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No Investments Found" description="No user investment cycles recorded yet." icon={TrendingUp} />
      )}
    </div>
  );
}
