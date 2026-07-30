import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { formatCurrency } from '../utils/formatters';
import { ArrowUpRight, CheckCircle2, XCircle, Clock, ShieldCheck, CreditCard, Filter } from 'lucide-react';

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

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchWithdrawals();
    const timer = setInterval(fetchWithdrawals, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get('/admin/withdrawals');
      if (res.data && res.data.withdrawals) {
        setWithdrawals(res.data.withdrawals);
      }
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId, userName, amount) => {
    try {
      const res = await api.post('/admin/withdrawals/approve', { withdrawal_id: withdrawalId });
      if (res.success || res.data) {
        showToast(`✅ Withdrawal of ${formatCurrency(amount)} approved for ${userName}! User notified.`);
        fetchWithdrawals();
      }
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || 'Failed to approve withdrawal'}`);
    }
  };

  const handleReject = async (withdrawalId, userName) => {
    try {
      const res = await api.post('/admin/withdrawals/reject', { withdrawal_id: withdrawalId, reason: 'Verification failed' });
      if (res.success || res.data) {
        showToast(`⚠️ Withdrawal request for ${userName} rejected.`);
        fetchWithdrawals();
      }
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || 'Failed to reject withdrawal'}`);
    }
  };

  if (loading) return <Loader label="Loading withdrawal approval queue..." />;

  const filtered = filterStatus === 'ALL'
    ? withdrawals
    : withdrawals.filter(w => w.status === filterStatus);

  const pendingCount = withdrawals.filter(w => w.status === 'PENDING_APPROVAL').length;
  const approvedCount = withdrawals.filter(w => w.status === 'APPROVED' || w.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 relative">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-2xl z-50 animate-bounce border border-emerald-500/30">
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ArrowUpRight className="text-credora-gold w-6 h-6" />
            Withdrawal Approval Queue & Workflow
          </h1>
          <p className="text-xs text-gray-400 mt-1">Review pending user payout requests and assign Sub-Admin approval audit trail</p>
        </div>

        {pendingCount > 0 && (
          <div className="bg-amber-950/80 border border-amber-800/40 text-amber-400 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse">
            <Clock size={16} />
            <span>{pendingCount} Pending Approvals Needed</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-900 border border-gray-800 p-1 rounded-xl space-x-1 text-xs">
          {[
            { id: 'ALL', label: `All Requests (${withdrawals.length})` },
            { id: 'PENDING_APPROVAL', label: `Pending Approval (${pendingCount})` },
            { id: 'APPROVED', label: `Approved (${approvedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                filterStatus === tab.id
                  ? 'gold-gradient text-slate-950 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawals Queue Table */}
      <div className="bg-slate-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
              <tr>
                <th className="p-4">Investor Name</th>
                <th className="p-4">Requested Amount</th>
                <th className="p-4">Destination Bank</th>
                <th className="p-4">Status</th>
                <th className="p-4">Approved By Sub-Admin</th>
                <th className="p-4">Request Date</th>
                <th className="p-4 text-right">Approval Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No withdrawal requests found for this filter.</td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-white">
                      <div className="flex items-center gap-2.5">
                        {w.user_avatar ? (
                          <img src={w.user_avatar} alt={w.user_name} className="w-9 h-9 rounded-full object-cover border border-amber-400/40 shadow-sm flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-amber-400/20 text-amber-300 font-extrabold flex items-center justify-center text-xs border border-amber-400/30 flex-shrink-0">
                            {w.user_name ? w.user_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div>
                          <div className="text-white font-bold">{w.user_name}</div>
                          <span className="text-[10px] text-gray-500 font-mono block">{w.user_email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-extrabold text-white text-sm">
                      {formatCurrency(w.amount)}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-emerald-400" />
                        <div>
                          <p className="font-bold text-white text-xs">{w.bank_name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{w.account_no} (IFSC: {w.ifsc})</p>
                          {w.remarks && (
                            <p className="text-[10px] text-amber-300 font-medium mt-0.5 italic">💬 Remarks: "{w.remarks}"</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                        w.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/50 animate-pulse'
                          : w.status === 'APPROVED' || w.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-red-950 text-red-400 border border-red-800/50'
                      }`}>
                        {w.status === 'PENDING_APPROVAL' ? (
                          <> <Clock size={12} /> Awaiting Sub-Admin Approval </>
                        ) : w.status === 'APPROVED' || w.status === 'COMPLETED' ? (
                          <> <CheckCircle2 size={12} /> Approved & Credited </>
                        ) : (
                          <> <XCircle size={12} /> Rejected </>
                        )}
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-gray-300">
                      {w.processed_by_name ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <ShieldCheck size={14} /> {w.processed_by_name}
                        </span>
                      ) : (
                        <span className="text-amber-300 text-[11px] font-semibold flex items-center gap-1">
                          <Clock size={12} /> Auto-Assigned to Free Sub-Admin
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-gray-400 font-semibold text-xs">
                      {formatDateTime(w.created_at)}
                    </td>

                    <td className="p-4 text-right">
                      {w.status === 'PENDING_APPROVAL' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReject(w.id, w.user_name)}
                            className="bg-red-950/60 hover:bg-red-900 text-red-300 px-3 py-1.5 rounded-lg font-bold text-[11px] border border-red-800/50 transition-all"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(w.id, w.user_name, w.amount)}
                            className="bg-[#00A859] hover:bg-[#00904d] text-white px-3.5 py-1.5 rounded-lg font-bold text-[11px] shadow-md transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Approve & Credit
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 font-medium">No actions needed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
