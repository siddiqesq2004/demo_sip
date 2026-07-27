import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Scan, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Biometric Face ID Demo Modal State
  const [showFaceIdModal, setShowFaceIdModal] = useState(false);
  const [faceIdStatus, setFaceIdStatus] = useState('scanning'); // 'scanning' | 'success'

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // If Biometrics is enabled or user uses Face ID demo
    const isBiometricEnabled = localStorage.getItem('credora_biometrics') !== 'false';
    if (isBiometricEnabled) {
      triggerFaceIdAuth();
      return;
    }

    try {
      const res = await loginUser(email || 'anishp@email.com', password || 'password123');
      if (res && res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
      setIsLoading(false);
    }
  };

  const triggerFaceIdAuth = () => {
    setShowFaceIdModal(true);
    setFaceIdStatus('scanning');

    // Simulate real iOS Face ID scan sequence
    setTimeout(() => {
      setFaceIdStatus('success');
      setTimeout(async () => {
        try {
          const res = await loginUser('anishp@email.com', 'password123');
          if (res && res.success) {
            navigate('/');
          }
        } catch (err) {
          setError('Biometric authentication failed');
        } finally {
          setShowFaceIdModal(false);
          setIsLoading(false);
        }
      }, 900);
    }, 1200);
  };

  const fillDemoCredentials = () => {
    setEmail('anishp@email.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#062E23] flex flex-col justify-center px-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#0B3B2F] rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl opacity-10"></div>
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 rotate-3">
            <span className="text-white text-3xl font-extrabold">C</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Welcome Back</h1>
          <p className="text-emerald-200 text-center text-sm">Sign in to continue your wealth journey</p>
        </div>

        {/* Demo Credentials Banner */}
        <div className="bg-[#0B3B2F] border border-[#D4AF37] border-opacity-30 rounded-xl p-3.5 mb-6 flex justify-between items-center shadow-lg">
          <div>
            <p className="text-[#D4AF37] text-[10px] font-bold mb-0.5 uppercase tracking-wider">Demo Credentials</p>
            <p className="text-white text-xs font-semibold">anishp@email.com / password123</p>
          </div>
          <button 
            type="button" 
            onClick={fillDemoCredentials}
            className="bg-[#D4AF37] bg-opacity-20 text-[#D4AF37] hover:bg-opacity-30 px-3 py-1 rounded-lg text-xs font-bold transition-colors border border-[#D4AF37] border-opacity-50"
          >
            Auto Fill
          </button>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-50 text-red-100 p-3 rounded-lg mb-4 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-emerald-800 rounded-xl text-white placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all shadow-inner text-sm"
                placeholder="Email address"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-emerald-800 rounded-xl text-white placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all shadow-inner text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <a href="#" className="text-xs font-medium text-emerald-400 hover:text-[#D4AF37] transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-yellow-600 text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none text-base mt-2"
          >
            {isLoading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>

        {/* Biometric Face ID Quick Login Button */}
        <div className="mt-4">
          <button 
            type="button" 
            onClick={triggerFaceIdAuth}
            className="w-full py-3 border border-[#D4AF37] border-opacity-40 text-[#D4AF37] hover:bg-[#D4AF37]/10 font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-xs"
          >
            <Scan size={18} />
            <span>Sign in with Face ID / Biometrics</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link to="/admin/login" className="text-xs text-emerald-400 hover:text-white transition-colors flex items-center justify-center">
            Are you a platform admin? Sign in here
            <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
        </div>
      </div>

      {/* --- REALISTIC iOS FACE ID SCANNING DEMO MODAL --- */}
      {showFaceIdModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-[#0B3B2F] border border-[#D4AF37]/40 rounded-3xl p-8 w-full max-w-xs text-center shadow-2xl flex flex-col items-center">
            {faceIdStatus === 'scanning' ? (
              <>
                <div className="relative w-20 h-20 flex items-center justify-center mb-5">
                  <Scan size={64} className="text-[#D4AF37] animate-pulse" />
                  <div className="absolute inset-0 border-2 border-[#00A859] rounded-2xl animate-ping opacity-30"></div>
                </div>
                <h3 className="text-white text-lg font-bold mb-1">Face ID for CREDORA</h3>
                <p className="text-emerald-200 text-xs font-medium">Verifying biometric credentials...</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-[#00A859]/20 rounded-full flex items-center justify-center mb-5 animate-bounce">
                  <CheckCircle2 size={56} className="text-[#00A859]" />
                </div>
                <h3 className="text-white text-lg font-bold mb-1">Face ID Verified</h3>
                <p className="text-[#00A859] text-xs font-bold">Welcome back, Anish P</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
