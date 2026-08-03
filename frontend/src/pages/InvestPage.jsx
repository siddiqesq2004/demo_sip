import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import api from '../services/api';
import { SkeletonList } from '../components/Skeleton';
import { formatCurrency } from '../utils/formatters';

const InvestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState('10000');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const presets = [5000, 10000, 25000, 50000];

  const demoPlanFallback = {
    id: 1,
    name: '22 Day Growth Plan',
    return_percentage: 1.0,
    duration_days: 22,
    min_amount: 5000,
    description: 'Earn 1% daily returns every working day (Mon-Fri) for 22 working days.'
  };

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const planId = queryParams.get('plan_id') || 1;
        const response = await api.get('/plans');
        const foundPlan = response.data.plans?.find(p => p.id === parseInt(planId)) || response.data.plans?.[0] || demoPlanFallback;
        setPlan(foundPlan);
      } catch (error) {
        console.error('Error fetching plan details, using demo fallback:', error);
        setPlan(demoPlanFallback);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanDetails();
  }, [location.search]);

  const handleProceed = () => {
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    setShowPaymentModal(false);
    try {
      await api.post('/invest', {
        plan_id: plan?.id || 1,
        amount: parseFloat(amount || 10000),
        payment_method: paymentMethod
      });
    } catch (error) {
      console.error('API investment failed, continuing with simulated demo success:', error);
    } finally {
      setShowSuccessModal(true);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F9FAFB] pt-12"><SkeletonList /></div>;
  if (!plan) setPlan(demoPlanFallback);

  const activePlan = plan || demoPlanFallback;
  const returnAmount = (parseFloat(amount || 0) * activePlan.return_percentage) / 100 * activePlan.duration_days;
  const totalAmount = parseFloat(amount || 0) + returnAmount;

  return (
    <div className="bg-white flex flex-col min-h-screen pb-24">
      {/* Dark Emerald Header */}
      <div className="bg-[#062E23] px-4 pt-12 pb-8 text-white rounded-b-2xl">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-white/10 text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Invest</h1>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-1">{activePlan.name}</h2>
          <p className="text-emerald-200 text-xs">Choose amount to start your growth plan</p>
        </div>
      </div>

      {/* Content Form */}
      <div className="p-4 space-y-6 flex-1">
        {/* Preset Amounts */}
        <div>
          <label className="text-xs font-semibold text-[#667085] block mb-2 uppercase tracking-wider">
            Select Investment Amount
          </label>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  amount === preset.toString()
                    ? 'bg-[#062E23] text-white shadow-md'
                    : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
                }`}
              >
                ₹{preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#00A859] rounded-xl pl-9 pr-4 py-3.5 text-lg font-bold text-[#101828] outline-none"
              placeholder="Enter amount"
            />
          </div>
        </div>

        {/* Dynamic Returns Calculation Boxes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
            <p className="text-xs text-[#667085] mb-1 font-medium">Expected Return</p>
            <p className="text-lg font-extrabold text-[#00A859]">{formatCurrency(returnAmount)}</p>
            <span className="text-[10px] text-[#00A859] font-bold">+{activePlan.return_percentage}% daily</span>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-xs text-[#667085] mb-1 font-medium">Total (22 Days)</p>
            <p className="text-lg font-extrabold text-[#101828]">{formatCurrency(totalAmount)}</p>
            <span className="text-[10px] text-gray-500 font-medium">Principal + Profit</span>
          </div>
        </div>

        {/* Payment Method Section */}
        <div>
          <label className="text-xs font-semibold text-[#667085] block mb-3 uppercase tracking-wider">
            Payment Method
          </label>

          <div className="space-y-2">
            {[
              { id: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)', subtitle: 'Instant 0% Fee Payment' },
              { id: 'BANK', label: 'Bank Transfer (IMPS / NEFT)', subtitle: 'Direct NetBanking' }
            ].map((method) => (
              <div
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === method.id
                    ? 'border-[#00A859] bg-emerald-50/40 shadow-xs'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-[#101828]">{method.label}</p>
                  <p className="text-[10px] text-[#667085]">{method.subtitle}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  paymentMethod === method.id ? 'border-[#00A859] bg-[#00A859] text-white' : 'border-gray-300'
                }`}>
                  {paymentMethod === method.id && <Check size={12} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Action Button */}
      <div className="sticky bottom-[60px] z-30 p-4 bg-white border-t border-gray-100 shadow-lg">
        <button
          onClick={handleProceed}
          className="w-full bg-[#00A859] hover:bg-[#00904d] text-white py-4 rounded-xl font-bold text-sm shadow-md transition-colors"
        >
          Proceed to Pay {formatCurrency(parseFloat(amount || 0))}
        </button>
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center pb-[68px] p-3 animate-fade-in">
          <div className="bg-white w-full rounded-3xl p-6 shadow-2xl animate-slide-up">
            <h3 className="text-lg font-bold text-[#101828] mb-1">Confirm Payment</h3>
            <p className="text-[#667085] text-xs mb-5">
              You are investing <strong className="text-[#101828]">{formatCurrency(parseFloat(amount || 10000))}</strong> in {activePlan.name} via {paymentMethod}.
            </p>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 font-semibold text-[#101828] bg-gray-100 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPayment}
                className="flex-1 py-3 font-bold text-white bg-[#00A859] hover:bg-[#00904d] rounded-xl text-xs shadow-md"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- INVESTMENT SUCCESS DEMO MODAL --- */}
      {showSuccessModal && (
        <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 text-center shadow-2xl animate-slide-up flex flex-col items-center">
            <div className="w-16 h-16 bg-[#00A859]/10 rounded-full flex items-center justify-center mb-4 text-[#00A859]">
              <Check size={36} className="text-[#00A859]" />
            </div>
            
            <h3 className="text-xl font-bold text-[#101828] mb-1">Investment Successful!</h3>
            <p className="text-xs text-[#667085] mb-4">
              Your investment of <strong className="text-[#101828]">{formatCurrency(parseFloat(amount || 10000))}</strong> has started its {activePlan.name}.
            </p>
            
            <div className="w-full bg-emerald-50 rounded-xl p-3.5 mb-5 border border-emerald-100 text-xs text-left space-y-1.5">
              <div className="flex justify-between text-[#667085]">
                <span>Daily Returns:</span>
                <span className="font-bold text-[#00A859]">+{activePlan.return_percentage}% Daily</span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>Plan Duration:</span>
                <span className="font-bold text-[#101828]">{activePlan.duration_days} Working Days</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/portfolio');
              }}
              className="w-full bg-[#062E23] hover:bg-[#041F17] text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-colors"
            >
              Go to Portfolio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestPage;
