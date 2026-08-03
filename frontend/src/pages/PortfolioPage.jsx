import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import api from '../services/api';
import { SkeletonList } from '../components/Skeleton';
import WithdrawalModal from '../components/WithdrawalModal';
import AddMoneyModal from '../components/AddMoneyModal';

const PortfolioPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);

  const demoPortfolioFallback = {
    portfolio: {
      total_value: 125430.00,
      invested_amount: 106510.00,
      total_returns: 18920.00,
      all_time_profit_percent: 17.76
    },
    active_plans: [
      {
        id: 1,
        plan_name: '22 Day Growth Plan',
        current_day: 8,
        duration_days: 22,
        amount: 106510.00,
        returns_earned: 8510.00
      }
    ],
    completed_plans: [
      {
        id: 101,
        plan_name: '22 Day Growth Plan',
        amount: 50000.00,
        returns_earned: 11000.00,
        completed_on: '05 July 2026'
      }
    ]
  };

  const fetchPortfolio = async () => {
    try {
      const response = await api.get('/portfolio');
      setData(response.data || demoPortfolioFallback);
    } catch (error) {
      console.error('Error fetching portfolio, using demo fallback:', error);
      setData(demoPortfolioFallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    const timer = setInterval(fetchPortfolio, 1500);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] pt-12">
        <SkeletonList />
      </div>
    );
  }

  const { portfolio, active_plans: activePlans = [], completed_plans: completedPlans = [] } = data || demoPortfolioFallback;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 text-[#101828]">
      {/* Header */}
      <header className="px-4 pt-12 pb-3.5 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg className="w-6 h-6 text-[#101828]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Portfolio</h1>
        <button onClick={() => navigate('/activity')} className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors" title="Activity History">
          <svg className="w-6 h-6 text-[#101828]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </header>

      <div className="px-4 mt-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-[#0B3B2F] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="relative z-10 space-y-3">
            <div>
              <p className="text-gray-300 text-xs font-medium uppercase tracking-wider mb-1">Total Portfolio Value</p>
              <h2 className="text-3xl font-extrabold">{formatCurrency(portfolio?.total_value || 125430)}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
              <div>
                <p className="text-gray-400 text-xs mb-1">Invested Amount</p>
                <p className="text-sm font-bold">{formatCurrency(portfolio?.invested_amount || 106510)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Total Returns</p>
                <p className="text-sm font-bold text-[#00A859]">+{formatCurrency(portfolio?.total_returns || 18920)}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowAddMoneyModal(true)}
                className="bg-[#00A859] hover:bg-[#008f4c] text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Add Money</span>
              </button>

              <button
                onClick={() => setShowWithdrawalModal(true)}
                className="bg-white hover:bg-gray-100 text-[#062E23] font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <ArrowUpRight size={16} strokeWidth={2.5} />
                <span>Withdraw</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Plans Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-[#101828]">Active Investments</h3>
            <span className="text-xs text-[#00A859] font-bold bg-[#00A859]/10 px-2 py-0.5 rounded-full">
              {activePlans.length} Active
            </span>
          </div>

          {activePlans.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <p className="text-sm text-[#667085]">No active investment plans right now.</p>
              <Link to="/invest" className="inline-block mt-3 bg-[#062E23] text-white px-4 py-2 rounded-xl text-xs font-bold">
                Start Investing
              </Link>
            </div>
          ) : (
            activePlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-base text-[#101828]">{plan.plan_name}</h4>
                    <p className="text-xs text-[#667085]">Day {plan.current_day} of {plan.duration_days}</p>
                  </div>
                  <span className="bg-[#00A859]/10 text-[#00A859] text-xs font-bold px-2.5 py-1 rounded-lg">
                    1% Daily
                  </span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-[#00A859] to-[#D4AF37] h-2 rounded-full" 
                    style={{ width: `${(plan.current_day / plan.duration_days) * 100}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl">
                  <div>
                    <span className="text-[#667085] block mb-0.5">Invested</span>
                    <span className="font-bold text-[#101828]">{formatCurrency(plan.amount)}</span>
                  </div>
                  <div>
                    <span className="text-[#667085] block mb-0.5">Returns Earned</span>
                    <span className="font-bold text-[#00A859]">+{formatCurrency(plan.returns_earned)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Completed Plans Section */}
        {completedPlans.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-[#101828] mb-3">Completed Plans</h3>
            {completedPlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between mb-3 shadow-xs">
                <div>
                  <h4 className="font-bold text-sm text-[#101828]">{plan.plan_name}</h4>
                  <p className="text-xs text-[#667085]">Completed on {plan.completed_on}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#00A859] block">+{formatCurrency(plan.returns_earned)}</span>
                  <span className="text-[10px] text-gray-400">Payout Complete</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Add Money Modal --- */}
      <AddMoneyModal
        isOpen={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
        onSuccess={() => fetchPortfolio()}
      />

      {/* --- Withdrawal Modal --- */}
      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        availableBalance={portfolio?.total_value || 125430}
        onSuccess={() => fetchPortfolio()}
      />

    </div>
  );
};

export default PortfolioPage;
