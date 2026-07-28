import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { SkeletonList } from '../components/Skeleton';
import { formatCurrency } from '../utils/formatters';

const InvestmentPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
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
      name: '90 Day Wealth Builder',
      return_percentage: 1.5,
      duration_days: 90,
      min_amount: 25000,
      description: 'Maximum 1.5% daily return strategy for long-term investors.'
    }
  ];

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/plans');
        setPlans((response.data && response.data.plans && response.data.plans.length > 0) ? response.data.plans : demoPlansFallback);
      } catch (error) {
        console.error('Error fetching plans, using demo fallback:', error);
        setPlans(demoPlansFallback);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white px-4 pt-12 pb-3.5 sticky top-0 z-10 flex items-center border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-gray-100 text-[#101828]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-[#101828]">Investment Plans</h1>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <SkeletonList />
        ) : plans.length === 0 ? (
          <div className="text-center text-[#667085] py-10">No investment plans available.</div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => navigate(`/plans/${plan.id}`)}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-[#00A859] transition-all cursor-pointer card-press"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-[#101828] mb-1">{plan.name}</h3>
                  <p className="text-xs text-[#667085] line-clamp-2">{plan.description}</p>
                </div>
                <span className="bg-[#00A859]/10 text-[#00A859] px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                  {plan.return_percentage}% Daily
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                <span className="text-[#667085]">Tenure: <strong className="text-[#101828]">{plan.duration_days} Days</strong></span>
                <span className="text-[#667085]">Min: <strong className="text-[#101828]">{formatCurrency(plan.min_amount)}</strong></span>
                <div className="flex items-center text-[#062E23] font-bold">
                  <span>View Plan</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InvestmentPlansPage;
