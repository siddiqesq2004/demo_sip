import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, CheckCircle, TrendingUp, Calendar, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/Loader';

const InvestmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const response = await api.get('/plans');
        const foundPlan = response.data.plans?.find(p => p.id === parseInt(id) || p.id === id);
        setPlan(foundPlan);
      } catch (error) {
        console.error('Error fetching plan details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanDetails();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><Loader /></div>;
  if (!plan) return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">Plan not found</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Dark Emerald Header */}
      <div className="bg-[#062E23] px-4 pt-12 pb-8 text-white">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full bg-white/10 hover:bg-white/20 transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold flex-1 flex items-center">
            {plan.name} <Info size={16} className="ml-2 text-white/60" />
          </h1>
        </div>
        
        <p className="text-lg text-white/90 font-medium mb-2">Est. 0.5-1% Daily Returns For {plan.duration_days} Working Days</p>
        <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-xs text-white/80 border border-white/20">
          Sat & Sun Holiday
        </span>
      </div>

      {/* White Content Section */}
      <div className="flex-1 px-4 py-6 -mt-4 rounded-t-2xl bg-[#F9FAFB]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-center">
          <p className="text-[#667085] text-sm mb-1 font-medium">Expected Returns</p>
          <h2 className="text-4xl font-bold text-[#00A859]">{plan.return_percentage}%</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <Calendar size={24} className="text-[#00A859] mb-2" />
            <p className="text-xs text-[#667085] mb-1">Investment Tenure</p>
            <p className="font-semibold text-[#101828]">{plan.duration_days} Days</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <ShieldCheck size={24} className="text-[#00A859] mb-2" />
            <p className="text-xs text-[#667085] mb-1">Working Days</p>
            <p className="font-semibold text-[#101828]">Mon - Fri</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-24">
          <h3 className="font-bold text-[#101828] mb-4 text-lg">How it works</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mt-0.5 bg-[#00A859]/10 p-2 rounded-full mr-3 text-[#00A859]">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="font-semibold text-[#101828] text-sm">Invest any amount</p>
                <p className="text-xs text-[#667085] mt-0.5">Start your growth plan</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mt-0.5 bg-[#00A859]/10 p-2 rounded-full mr-3 text-[#00A859]">
                <Calendar size={16} />
              </div>
              <div>
                <p className="font-semibold text-[#101828] text-sm">Earn {plan.return_percentage / plan.duration_days}% every working day</p>
                <p className="text-xs text-[#667085] mt-0.5">Returns credited daily</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mt-0.5 bg-[#00A859]/10 p-2 rounded-full mr-3 text-[#00A859]">
                <CheckCircle size={16} />
              </div>
              <div>
                <p className="font-semibold text-[#101828] text-sm">Get up to {plan.return_percentage}% returns</p>
                <p className="text-xs text-[#667085] mt-0.5">On completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-[60px] p-4 bg-white border-t border-gray-100 z-30">
        <button 
          onClick={() => navigate(`/invest?plan_id=${plan.id}`)}
          className="w-full bg-[#00A859] hover:bg-[#00904d] text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg"
        >
          Start Investing
        </button>
      </div>
    </div>
  );
};

export default InvestmentDetailsPage;
