import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, CheckCircle2, Sprout, Flame, Sparkles, ShieldCheck, Sun, Globe, TreeDeciduous } from 'lucide-react';
import api from '../services/api';
import { SkeletonList } from '../components/Skeleton';
import { formatCurrency } from '../utils/formatters';

const InvestmentPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulatedDay, setSimulatedDay] = useState(14); // Default to active cycle day 14
  const [portfolioData, setPortfolioData] = useState(null);
  const navigate = useNavigate();

  const demoPlansFallback = [
    {
      id: 1,
      name: '22 Day Growth Plan',
      return_percentage: 1.0,
      duration_days: 22,
      min_amount: 5000,
      description: 'Earn 1% daily returns every working day (Mon-Fri) for 22 working days.'
    },
    {
      id: 2,
      name: '45 Day Accelerator Plan',
      return_percentage: 1.2,
      duration_days: 45,
      min_amount: 10000,
      description: 'Accelerated 1.2% daily growth cycle with compounding potential.'
    },
    {
      id: 3,
      name: '90 Day Wealth Empire',
      return_percentage: 1.5,
      duration_days: 90,
      min_amount: 25000,
      description: 'Maximum 1.5% daily return strategy for long-term investors.'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansRes, dashboardRes] = await Promise.allSettled([
          api.get('/plans'),
          api.get('/dashboard')
        ]);

        if (plansRes.status === 'fulfilled' && plansRes.value.data?.plans) {
          setPlans(plansRes.value.data.plans);
        } else {
          setPlans(demoPlansFallback);
        }

        if (dashboardRes.status === 'fulfilled' && dashboardRes.value.data) {
          const dash = dashboardRes.value.data;
          setPortfolioData(dash);
          if (dash.active_cycle?.current_day) {
            setSimulatedDay(dash.active_cycle.current_day);
          }
        }
      } catch (error) {
        console.error('Error fetching growth data:', error);
        setPlans(demoPlansFallback);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Growth Stage Definitions based on Day
  const getGrowthStage = (day) => {
    if (day <= 3) {
      return {
        stage: 1,
        title: 'Stage 1: Seedling in Rich Soil 🫘',
        badge: 'Seed Sprout',
        icon: '🌱',
        bgGradient: 'from-amber-950 via-[#1A120B] to-[#0D1B12]',
        textColor: 'text-amber-300',
        borderColor: 'border-amber-700/50',
        accentGlow: 'shadow-amber-900/30',
        desc: 'Your capital seed is planted into rich daily growth soil. Micro-nutrients start forming initial roots.',
        treesPlanted: 1,
        biomass: 'Seedling Sprout (0.5 kg CO₂ absorbed)'
      };
    } else if (day <= 7) {
      return {
        stage: 2,
        title: 'Stage 2: First Leaves Unfurling 🌿',
        badge: 'Young Stem',
        icon: '🌿',
        bgGradient: 'from-emerald-950 via-[#0B2E1E] to-[#041D12]',
        textColor: 'text-emerald-300',
        borderColor: 'border-emerald-700/50',
        accentGlow: 'shadow-emerald-900/30',
        desc: 'Daily 1% returns nourish your shoot with fresh green leaves. Sunlight beams power rapid cell growth.',
        treesPlanted: 3,
        biomass: 'Young Plant (2.5 kg CO₂ absorbed)'
      };
    } else if (day <= 12) {
      return {
        stage: 3,
        title: 'Stage 3: Flourishing Money Plant 🪴',
        badge: 'Golden Buds',
        icon: '🪴',
        bgGradient: 'from-[#0B3B2F] via-[#062E23] to-[#031D16]',
        textColor: 'text-yellow-300',
        borderColor: 'border-emerald-600/50',
        accentGlow: 'shadow-emerald-600/40',
        desc: 'Your capital is maturing! Golden return blossoms begin appearing on healthy green branches.',
        treesPlanted: 8,
        biomass: 'Flourishing Shrub (12 kg CO₂ absorbed)'
      };
    } else if (day <= 17) {
      return {
        stage: 4,
        title: 'Stage 4: Golden Money Tree 🌳',
        badge: 'Golden Yield',
        icon: '🌳',
        bgGradient: 'from-[#062E23] via-[#0B3B2F] to-[#05241B]',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-400/50',
        accentGlow: 'shadow-amber-500/30',
        desc: 'A tall, thriving tree producing steady golden fruit yields every single working day.',
        treesPlanted: 15,
        biomass: 'Full Canopy Tree (45 kg CO₂ absorbed)'
      };
    } else if (day <= 21) {
      return {
        stage: 5,
        title: 'Stage 5: Lush Evergreen Forest 🌲',
        badge: 'Forest Ecosystem',
        icon: '🌲',
        bgGradient: 'from-[#042017] via-[#083827] to-[#01140E]',
        textColor: 'text-emerald-200',
        borderColor: 'border-emerald-400/60',
        accentGlow: 'shadow-emerald-400/30',
        desc: 'Compounding returns expand your single tree into a self-sustaining green forest ecosystem!',
        treesPlanted: 22,
        biomass: 'Evergreen Forest (120 kg CO₂ absorbed)'
      };
    } else {
      return {
        stage: 6,
        title: 'Stage 6: World Covered With Trees 🌍✨',
        badge: 'Global Planet Covered',
        icon: '🌍',
        bgGradient: 'from-[#031D16] via-[#063B2B] to-[#0B4A37]',
        textColor: 'text-yellow-300',
        borderColor: 'border-yellow-400/80',
        accentGlow: 'shadow-yellow-400/50',
        desc: 'Growth Empire Reached! Your investment has terraformed the whole world into a golden forest planet.',
        treesPlanted: 50,
        biomass: 'Global Planet Ecosystem (500+ kg CO₂ absorbed)'
      };
    }
  };

  const currentStage = getGrowthStage(simulatedDay);

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-28 text-gray-900">
      
      {/* --- Top Sticky Header --- */}
      <div className="bg-white px-5 pt-12 pb-3.5 sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-gray-100 text-[#101828]">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[#062E23] tracking-tight">Growth & Investment</h1>
        </div>

        <span className="text-xs font-extrabold text-[#00A859] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <Sprout size={14} />
          <span>1% Daily Yield</span>
        </span>
      </div>

      <div className="px-5 pt-5 space-y-5">
        
        {/* --- DYNAMIC PLANT & FOREST EVOLUTION HERO CARD --- */}
        <div className={`bg-gradient-to-br ${currentStage.bgGradient} rounded-3xl p-6 text-white shadow-2xl ${currentStage.accentGlow} border-2 ${currentStage.borderColor} relative overflow-hidden transition-all duration-500`}>
          
          {/* Animated Background Atmosphere */}
          <div className="absolute top-2 right-3 text-3xl opacity-20 animate-pulse">✨</div>
          <div className="absolute bottom-4 right-10 text-4xl opacity-15 animate-bounce">🍃</div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Stage Badge Header */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[11px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-emerald-200 border border-white/15 flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400" />
              <span>{currentStage.badge}</span>
            </span>

            <span className="text-xs font-bold text-emerald-300">
              Day {simulatedDay} of 22
            </span>
          </div>

          {/* Center 3D Plant / Forest Stage Visual Display */}
          <div className="my-6 flex flex-col items-center justify-center relative z-10">
            <div className="relative group">
              {/* Pulsing Aura Circle */}
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500/20 to-amber-400/20 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-sm relative">
                
                {/* 3D Emoji Icon Stage */}
                <div className="text-6xl transform transition-transform duration-500 hover:scale-125 animate-bounce">
                  {currentStage.icon}
                </div>

                {/* Orbiting Particles for Stage 6 (World Covered) */}
                {simulatedDay >= 22 && (
                  <>
                    <div className="absolute -top-2 -right-2 text-xl animate-spin">🌟</div>
                    <div className="absolute -bottom-2 -left-2 text-xl animate-bounce">🌳</div>
                    <div className="absolute top-1/2 -right-4 text-sm animate-pulse">🪙</div>
                  </>
                )}
              </div>
            </div>

            {/* Stage Title */}
            <h2 className={`text-xl font-black mt-4 text-center ${currentStage.textColor} tracking-tight`}>
              {currentStage.title}
            </h2>

            {/* Stage Description */}
            <p className="text-xs text-gray-300 text-center max-w-xs mt-2 font-medium leading-relaxed">
              {currentStage.desc}
            </p>
          </div>

          {/* Stats Bar (Trees Planted & Biomass Impact) */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 grid grid-cols-2 gap-3 text-xs relative z-10 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                <TreeDeciduous size={18} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">Ecosystem Impact</span>
                <span className="font-extrabold text-white">{currentStage.treesPlanted} Trees Planted</span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                <Globe size={18} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">Daily Return Stage</span>
                <span className="font-extrabold text-amber-300">+1.00% Active</span>
              </div>
            </div>
          </div>

          {/* --- INTERACTIVE DAY SIMULATOR SCRUBBER --- */}
          <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-300 mb-2">
              <span>🌱 Seed (Day 1)</span>
              <span>🌿 Shoot (Day 7)</span>
              <span>🌳 Tree (Day 15)</span>
              <span className="text-yellow-300">🌍 World Planet (Day 22)</span>
            </div>

            {/* Range Scrubber Input */}
            <input
              type="range"
              min="1"
              max="22"
              value={simulatedDay}
              onChange={(e) => setSimulatedDay(parseInt(e.target.value))}
              className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00A859] focus:outline-none"
            />
            
            <div className="text-center text-[10px] text-emerald-300 font-semibold mt-1.5">
              ‹ Drag scrubber to watch your investment grow into a world covered with trees ›
            </div>
          </div>

        </div>

        {/* --- AVAILABLE INVESTMENT PLANS LIST --- */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#062E23]">Select Growth Strategy</h2>
            <span className="text-xs text-gray-400 font-medium">3 Plans Available</span>
          </div>

          {loading ? (
            <SkeletonList />
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => navigate(`/plans/${plan.id}`)}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:border-[#00A859] transition-all cursor-pointer card-press relative overflow-hidden group"
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
                  <span className="text-gray-500 font-medium">Tenure: <strong className="text-gray-900 font-bold">{plan.duration_days} Days</strong></span>
                  <span className="text-gray-500 font-medium">Min: <strong className="text-gray-900 font-bold">{formatCurrency(plan.min_amount)}</strong></span>
                  
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
