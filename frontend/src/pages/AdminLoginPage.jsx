import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Shield, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const [email, setEmail] = useState('admin@credora.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginAdmin(email, password);
    setLoading(false);

    if (res.success && res.admin) {
      const isSuper = res.admin.is_super_admin === true || res.admin.role === 'SUPER_ADMIN';
      if (isSuper || res.admin.role === 'FULL_SUBADMIN') {
        navigate('/admin');
      } else if (res.admin.role === 'SUPPORT_AGENT' || res.admin.permissions === 'SUPPORT_CHAT_ONLY') {
        navigate('/admin/support');
      } else if (res.admin.role === 'WITHDRAWAL_APPROVER' || res.admin.permissions === 'WITHDRAWALS_ONLY') {
        navigate('/admin/withdrawals');
      } else {
        navigate('/admin');
      }
    } else {
      setError(res.message || 'Admin authentication failed.');
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen p-6 flex flex-col justify-between text-white">
      {/* Brand Header */}
      <div className="pt-10 text-center">
        <div className="w-16 h-16 rounded-2xl gold-gradient p-0.5 mx-auto mb-4 shadow-xl">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Shield className="w-8 h-8 text-credora-gold" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold tracking-wider text-white">CREDORA ADMIN PORTAL</h2>
        <p className="text-xs text-gray-400 mt-1">Super Admin & Sub-Admin Control Suite</p>
      </div>

      {/* Demo Credentials Alert Box */}
      <div className="max-w-md mx-auto w-full my-auto py-4">
        <div className="bg-slate-900 border border-amber-400/40 rounded-2xl p-4 mb-5 text-xs text-emerald-100 space-y-2.5">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Demo Login Credentials:
            </span>
            <span className="text-[10px] text-gray-400">Click to auto-fill</span>
          </div>

          {/* Super Admin Pill */}
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-gray-800">
            <div>
              <p className="font-bold text-white text-xs">🔑 Super Admin Account</p>
              <p className="text-[11px] font-mono text-gray-400">admin@credora.com / admin123</p>
            </div>
            <button
              onClick={() => { setEmail('admin@credora.com'); setPassword('admin123'); }}
              type="button"
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold gold-gradient text-credora-dark shadow hover:brightness-105"
            >
              Fill Super Admin
            </button>
          </div>

          {/* Sub-Admin Support Pill: Neha Gupta */}
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-gray-800">
            <div>
              <p className="font-bold text-blue-400 text-xs">🛡️ Sub-Admin Neha (Support Desk)</p>
              <p className="text-[11px] font-mono text-gray-400">neha.subadmin@credora.com / subadmin123</p>
            </div>
            <button
              onClick={() => { setEmail('neha.subadmin@credora.com'); setPassword('subadmin123'); }}
              type="button"
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-900 text-blue-200 shadow hover:brightness-105"
            >
              Fill Support Desk
            </button>
          </div>

          {/* Sub-Admin Support Pill: Vijay */}
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-gray-800">
            <div>
              <p className="font-bold text-blue-400 text-xs">🛡️ Sub-Admin Vijay (Support Desk)</p>
              <p className="text-[11px] font-mono text-gray-400">mdabsdq2004@gmail.com / subadmin123</p>
            </div>
            <button
              onClick={() => { setEmail('mdabsdq2004@gmail.com'); setPassword('subadmin123'); }}
              type="button"
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-900/80 text-blue-300 border border-blue-800/60 shadow hover:brightness-105"
            >
              Fill Support Desk
            </button>
          </div>

          {/* Sub-Admin Payouts Pill: Karan Singh */}
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-gray-800">
            <div>
              <p className="font-bold text-emerald-400 text-xs">🛡️ Sub-Admin Karan (Payout Approvals)</p>
              <p className="text-[11px] font-mono text-gray-400">karan.subadmin@credora.com / subadmin123</p>
            </div>
            <button
              onClick={() => { setEmail('karan.subadmin@credora.com'); setPassword('subadmin123'); }}
              type="button"
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-900 text-emerald-200 shadow hover:brightness-105"
            >
              Fill Payout Admin
            </button>
          </div>

          {/* Sub-Admin Payouts Pill: Siddiqe */}
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-gray-800">
            <div>
              <p className="font-bold text-emerald-400 text-xs">🛡️ Sub-Admin Siddiqe (Payout Approvals)</p>
              <p className="text-[11px] font-mono text-gray-400">siddiqesq2004@gmail.com / subadmin123</p>
            </div>
            <button
              onClick={() => { setEmail('siddiqesq2004@gmail.com'); setPassword('subadmin123'); }}
              type="button"
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 shadow hover:brightness-105"
            >
              Fill Payout Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs p-3.5 rounded-xl mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Admin / Sub-Admin Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@credora.com"
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            icon={Lock}
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            className="py-3.5 text-base font-bold shadow-lg"
          >
            Access Admin Console <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </div>

      {/* Switch to User App */}
      <div className="text-center pb-4">
        <button
          onClick={() => navigate('/login')}
          className="text-xs text-gray-500 hover:text-credora-gold underline font-medium"
        >
          ← Return to User App Login
        </button>
      </div>
    </div>
  );
}
