import React, { useState } from 'react';
import { X, Plus, Smartphone, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function AddMoneyModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('5000');
  const [method, setMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const presetAmounts = ['1000', '2500', '5000', '10000', '25000'];

  const handleResetAndClose = () => {
    setSuccess(false);
    setAmount('5000');
    onClose();
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    setLoading(true);
    // Simulate deposit processing delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      if (onSuccess) onSuccess(num);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-[#062E23] to-[#0B3B2F] text-white p-5 relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-emerald-800/50 text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Plus className="w-4 h-4 text-[#00A859]" />
            <span>Wallet Deposit</span>
          </div>
          
          <h3 className="text-xl font-extrabold text-white">Add Money</h3>
          <p className="text-xs text-emerald-200/80">Add funds to your Credora wallet balance</p>
        </div>

        {success ? (
          /* SUCCESS VIEW */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-[#00A859] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h4 className="text-lg font-black text-[#062E23]">Money Added Successfully!</h4>
              <p className="text-xs text-gray-500 mt-1">
                <strong className="text-emerald-700">{formatCurrency(parseFloat(amount))}</strong> has been credited to your Credora wallet balance.
              </p>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full bg-[#062E23] hover:bg-[#042018] text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md active:scale-95"
            >
              Done
            </button>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleAddFunds} className="p-5 space-y-4">
            
            {/* Amount Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">Select Deposit Amount (₹)</label>
              
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all border ${
                      amount === amt
                        ? 'bg-[#062E23] text-white border-[#062E23] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ₹{parseInt(amt).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="relative mt-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold text-sm">₹</span>
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00A859] focus:bg-white focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">Payment Method</label>
              <div className="space-y-2">
                
                <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  method === 'UPI' ? 'border-[#00A859] bg-emerald-50/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Smartphone size={18} className="text-[#00A859]" />
                    <span className="text-xs font-bold text-gray-800">UPI (GPay / PhonePe / Paytm)</span>
                  </div>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={method === 'UPI'}
                    onChange={() => setMethod('UPI')}
                    className="accent-[#00A859]"
                  />
                </label>

                <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  method === 'BANK' ? 'border-[#00A859] bg-emerald-50/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Building size={18} className="text-[#00A859]" />
                    <span className="text-xs font-bold text-gray-800">Net Banking / NEFT</span>
                  </div>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={method === 'BANK'}
                    onChange={() => setMethod('BANK')}
                    className="accent-[#00A859]"
                  />
                </label>

              </div>
            </div>

            <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-[#00A859]" />
              <span>Instant Wallet Credit • 256-bit Encrypted</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-1/3 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3.5 bg-[#00A859] hover:bg-[#008f4c] text-white font-extrabold rounded-2xl text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? 'Processing...' : `Deposit ${formatCurrency(parseFloat(amount) || 0)}`}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
