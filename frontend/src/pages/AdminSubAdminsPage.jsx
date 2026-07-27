import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { Shield, Plus, X, UserCheck, Activity, Key, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function AdminSubAdminsPage() {
  const [subadmins, setSubadmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('subadmins'); // 'subadmins' | 'logs'
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('WITHDRAWAL_APPROVER');

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteSubAdmin = async (subId, subName, subEmail) => {
    if (!window.confirm(`Are you sure you want to delete Sub-Admin "${subName}" (${subEmail})?`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/subadmins/${subId}`);
      if (res.success || res.data) {
        showToast(`🗑️ Sub-Admin "${subName}" deleted successfully.`);
        fetchData();
      }
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || 'Failed to delete sub-admin'}`);
    }
  };

  const fetchData = async () => {
    try {
      const [resSub, resLogs] = await Promise.all([
        api.get('/admin/subadmins'),
        api.get('/admin/subadmin-logs')
      ]);

      if (resSub.data && resSub.data.subadmins) {
        setSubadmins(resSub.data.subadmins);
      }
      if (resLogs.data && resLogs.data.logs) {
        setLogs(resLogs.data.logs);
      }
    } catch (err) {
      console.error('Error fetching sub-admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubAdmin = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    try {
      const res = await api.post('/admin/subadmins', {
        name,
        email,
        password,
        role,
        permissions: role === 'WITHDRAWAL_APPROVER' ? 'WITHDRAWALS_ONLY' : role === 'SUPPORT_AGENT' ? 'SUPPORT_CHAT_ONLY' : 'ALL_PERMISSIONS'
      });

      if (res.success || res.data) {
        showToast(`✅ Sub-Admin ${name} created successfully!`);
        setShowAddModal(false);
        setName('');
        setEmail('');
        setPassword('');
        fetchData();
      }
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || 'Failed to create sub-admin'}`);
    }
  };

  if (loading) return <Loader label="Loading sub-admins & activity logs..." />;

  return (
    <div className="space-y-6 relative">
      {/* Toast alert banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-2xl z-50 animate-bounce border border-emerald-500/30">
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Shield className="text-credora-gold w-6 h-6" />
            Sub-Admin Management & Activity Logs
          </h1>
          <p className="text-xs text-gray-400 mt-1">Create sub-admins with dedicated permissions and audit real-time activities</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="gold-gradient text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all"
        >
          <Plus size={16} />
          <span>Add New Sub-Admin</span>
        </button>
      </div>

      {/* Tab Controls */}
      <div className="flex border-b border-gray-800 space-x-4">
        <button
          onClick={() => setActiveTab('subadmins')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'subadmins' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <UserCheck size={16} />
          <span>Active Sub-Admins ({subadmins.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'logs' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Activity size={16} />
          <span>Sub-Admin Activity Audit Logs ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: SUB-ADMINS LIST */}
      {activeTab === 'subadmins' && (
        <div className="bg-slate-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-4">Sub-Admin Name</th>
                  <th className="p-4">Login Email</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Permissions Scope</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {subadmins.map((sa) => (
                  <tr key={sa.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-extrabold text-xs border border-emerald-800">
                        {sa.name.charAt(0)}
                      </div>
                      <span>{sa.name}</span>
                    </td>
                    <td className="p-4 font-mono text-gray-300">{sa.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        sa.role === 'WITHDRAWAL_APPROVER'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                          : sa.role === 'SUPPORT_AGENT'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800/40'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      }`}>
                        {sa.role === 'WITHDRAWAL_APPROVER' ? 'Withdrawal Approver' : sa.role === 'SUPPORT_AGENT' ? 'Support Chat Agent' : 'Full Sub-Admin'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-gray-400">
                      {sa.permissions === 'WITHDRAWALS_ONLY' ? 'Withdrawal Approvals' : sa.permissions === 'SUPPORT_CHAT_ONLY' ? 'Live Support Chat' : 'Full Access'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                        sa.status === 'BUSY'
                          ? 'bg-red-950 text-red-400 border border-red-800/50'
                          : sa.status === 'IN_WORK'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800/50'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                      }`}>
                        {sa.status === 'BUSY' ? (
                          <> <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Busy </>
                        ) : sa.status === 'IN_WORK' ? (
                          <> <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> In Work </>
                        ) : (
                          <> <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Free (Ready) </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 font-mono text-[11px]">{sa.created_at || 'Recently'}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteSubAdmin(sa.id, sa.name, sa.email)}
                        className="p-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400 hover:bg-red-900/80 transition-all inline-flex items-center gap-1 text-[11px] font-bold"
                        title="Delete Sub-Admin"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS TABLE */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sub-Admin Activity Audit Trail</h3>
            <span className="text-xs text-gray-400">Tracks all withdrawal approvals & support interactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-4">Sub-Admin</th>
                  <th className="p-4">Action Type</th>
                  <th className="p-4">Activity Description</th>
                  <th className="p-4">Target User</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No sub-admin activity logs recorded yet.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-credora-gold" />
                        <span>{log.subadmin_name}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action_type === 'WITHDRAWAL_APPROVAL'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : log.action_type === 'SUPPORT_CHAT_REPLY'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-gray-800 text-gray-300'
                        }`}>
                          {log.action_type}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-white">{log.description}</td>
                      <td className="p-4 text-emerald-400 font-semibold">{log.target_user_name || 'System'}</td>
                      <td className="p-4 text-gray-400 font-mono text-[11px]">{log.created_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD SUB-ADMIN MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key size={18} className="text-credora-gold" /> Add New Sub-Admin
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubAdmin} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">Sub-Admin Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Karan Singh"
                  required
                  className="w-full bg-slate-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">Login Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. karan.subadmin@credora.com"
                  required
                  className="w-full bg-slate-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">Login Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full bg-slate-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">Assigned Sub-Admin Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
                >
                  <option value="WITHDRAWAL_APPROVER">Withdrawal Approver (Pill: Approve payouts & debit bank)</option>
                  <option value="SUPPORT_AGENT">Live Support Agent (Pill: Chat with users & answer queries)</option>
                  <option value="FULL_SUBADMIN">Full Sub-Admin (Pill: Withdrawals + Support + User View)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-gradient text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md"
                >
                  Create Sub-Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
