import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const SplashPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#062E23] to-[#031D16] flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-[#00A859]/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full">
        <div className="relative p-1 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#FCE38A] mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
          <div className="bg-[#062E23] rounded-xl w-24 h-24 flex items-center justify-center">
             <span className="text-5xl font-serif text-[#D4AF37] font-bold">C</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-[0.2em] text-white mb-2 font-sans">
          CREDORA
        </h1>
        <p className="text-[#D4AF37] text-sm tracking-wide">
          Grow every working day.
        </p>
      </div>

      <div className="w-full z-10 flex flex-col gap-4">
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-[#00A859] hover:bg-[#00904a] text-white font-semibold py-4 rounded-xl text-lg transition-colors shadow-lg"
        >
          Get Started
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-transparent border-2 border-white/20 hover:bg-white/10 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
        >
          Log In
        </button>
        
        <div className="flex items-center justify-center gap-2 mt-4 opacity-70">
          <Lock size={14} className="text-white" />
          <p className="text-white text-xs">Secured. Transparent. Reliable.</p>
        </div>
        
        <button 
          onClick={() => navigate('/admin')}
          className="mt-6 text-white/30 text-xs hover:text-white/60 transition-colors"
        >
          Admin Portal
        </button>
      </div>
    </div>
  );
};

export default SplashPage;
