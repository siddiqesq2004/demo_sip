import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Sprout, Sparkles, Globe, TreeDeciduous } from 'lucide-react';
import api from '../services/api';
import { SkeletonList } from '../components/Skeleton';
import { formatCurrency } from '../utils/formatters';
import PlantGrowthAnimation from '../components/PlantGrowthAnimation';

const InvestmentPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(14);
  const navigate = useNavigate();

  const demoPlansFallback = [
    { id: 1, name: '22 Day Growth Plan', return_percentage: 1.0, duration_days: 22, min_amount: 5000, description: 'Earn market-linked daily returns every working day (Mon-Fri) for 22 working days.' },
    { id: 2, name: '45 Day Accelerator Plan', return_percentage: 1.2, duration_days: 45, min_amount: 10000, description: 'Accelerated market-linked daily growth plan with enhanced return potential.' },
    { id: 3, name: '90 Day Wealth Empire', return_percentage: 1.5, duration_days: 90, min_amount: 25000, description: 'Premium market-linked returns for long-term investors. Higher potential daily yields.' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansRes, dashRes] = await Promise.allSettled([
          api.get('/plans'),
          api.get('/dashboard')
        ]);
        if (plansRes.status === 'fulfilled' && plansRes.value.data?.plans?.length) {
          setPlans(plansRes.value.data.plans);
        } else {
          setPlans(demoPlansFallback);
        }
        if (dashRes.status === 'fulfilled' && dashRes.value.data?.active_cycle?.current_day) {
          setCurrentDay(dashRes.value.data.active_cycle.current_day);
        }
      } catch (e) {
        setPlans(demoPlansFallback);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stage label lookup
  const getStageLabel = (day) => {
    if (day <= 3) return { label: 'Seed Sprout 🌱', color: 'text-amber-300' };
    if (day <= 7) return { label: 'Young Shoot 🌿', color: 'text-emerald-300' };
    if (day <= 12) return { label: 'Flowering Plant 🪴', color: 'text-yellow-300' };
    if (day <= 17) return { label: 'Golden Money Tree 🌳', color: 'text-amber-400' };
    if (day <= 21) return { label: 'Evergreen Forest 🌲', color: 'text-emerald-200' };
    return { label: 'World of Trees 🌍✨', color: 'text-yellow-300' };
  };

  const stage = getStageLabel(currentDay);
  const progress = Math.min(currentDay / 22, 1);
  const returnsEarned = (progress * 22 * 1).toFixed(1); // 1% per day

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-28 text-gray-900">
      
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-3.5 sticky top-0 z-30 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-gray-100 text-[#101828]">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[#062E23] tracking-tight">Growth & Investment</h1>
        </div>
        <span className="text-xs font-extrabold text-[#00A859] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <Sprout size={14} />
          <span>Market Linked</span>
        </span>
      </div>

      <div className="px-5 pt-5 space-y-5">
        
        {/* ========== LIVE PLANT GROWTH HERO CARD ========== */}
        <div className="bg-gradient-to-b from-[#0B3B2F] via-[#062E23] to-[#021A12] rounded-3xl overflow-hidden shadow-2xl border border-emerald-800/40 relative">
          
          {/* Top info bar */}
          <div className="px-5 pt-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80">Your Investment Garden</span>
              <h2 className={`text-lg font-black ${stage.color}`}>{stage.label}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-medium block">Plan Day</span>
              <span className="text-xl font-black text-white">{currentDay}<span className="text-xs font-bold text-emerald-400"> / 22</span></span>
            </div>
          </div>

          {/* ===== THE ANIMATED SVG PLANT ===== */}
          <div className="px-4">
            <PlantGrowthAnimation day={currentDay} totalDays={22} />
          </div>

          {/* Stats row */}
          <div className="mx-5 mb-4 bg-black/30 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10 grid grid-cols-2 gap-2 text-xs text-center">
            <div>
              <span className="text-gray-400 block text-[10px] font-medium">Returns Earned</span>
              <span className="text-emerald-300 font-black text-sm">+{returnsEarned}%</span>
            </div>
            <div className="border-l border-white/10">
              <span className="text-gray-400 block text-[10px] font-medium">Growth Stage</span>
              <span className="text-amber-300 font-extrabold text-sm">{Math.ceil(progress * 6)} / 6</span>
            </div>
          </div>

          {/* Day scrubber */}
          <div className="px-5 pb-5">
            <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 mb-1.5">
              <span>🌱 Seed</span>
              <span>🌿 Shoot</span>
              <span>🪴 Plant</span>
              <span>🌳 Tree</span>
              <span>🌲 Forest</span>
              <span className="text-yellow-400">🌍 World</span>
            </div>
            <input
              type="range"
              min="1" max="22"
              value={currentDay}
              onChange={(e) => setCurrentDay(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #00A859 ${progress * 100}%, rgba(255,255,255,0.15) ${progress * 100}%)`
              }}
            />
            <p className="text-center text-[10px] text-emerald-400/70 font-medium mt-1.5">
              ‹ Drag to watch your investment grow from seed to world of trees ›
            </p>
          </div>
        </div>

        {/* ========== PLANS LIST ========== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#062E23]">Select Growth Strategy</h2>
            <span className="text-xs text-gray-400 font-medium">{plans.length} Plans</span>
          </div>

          {loading ? (
            <SkeletonList />
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => navigate(`/plans/${plan.id}`)}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:border-[#00A859] transition-all cursor-pointer card-press group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-[#101828] mb-1 flex items-center gap-1.5">
                      <span>{plan.name}</span>
                      {plan.id === 1 && <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Popular</span>}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 font-medium">{plan.description}</p>
                  </div>
                  <span className="bg-[#00A859]/10 text-[#00A859] border border-[#00A859]/20 px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap">
                    {plan.return_percentage}% Daily
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <span className="text-gray-500 font-medium">Tenure: <strong className="text-gray-900">{plan.duration_days} Days</strong></span>
                  <span className="text-gray-500 font-medium">Min: <strong className="text-gray-900">{formatCurrency(plan.min_amount)}</strong></span>
                  <div className="flex items-center text-[#00A859] font-black group-hover:translate-x-1 transition-transform">
                    <span>Start Journey</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentPlansPage;
