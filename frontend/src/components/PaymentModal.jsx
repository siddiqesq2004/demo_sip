import React, { useState } from 'react';
import { X, CheckCircle, Smartphone, Building, ShieldCheck } from 'lucide-react';
import Button from './Button';
import { formatCurrency } from '../utils/formatters';

export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  amount,
  paymentMethod,
  onConfirm
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !plan) return null;

  const returnPercent = parseFloat(plan.return_percentage);
  const expectedProfit = amount * (returnPercent / 100);
  const totalReturn = amount + expectedProfit;

  const handlePay = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="bg-credora-deep text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-emerald-800/40 text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-credora-gold text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Demo Checkout Gateway
          </div>
          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
          <p className="text-xs text-emerald-200/70">Simulated Payment Confirmation</p>
        </div>

        {/* Breakdown */}
        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Investment Amount</span>
              <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Expected Growth ({returnPercent}%)</span>
              <span className="font-semibold text-emerald-600">+{formatCurrency(expectedProfit)}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold">
              <span className="text-gray-900">Total Returns</span>
              <span className="text-credora-deep">{formatCurrency(totalReturn)}</span>
            </div>
          </div>

          {/* Payment Method Selected */}
          <div className="flex items-center gap-3 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
            {paymentMethod === 'UPI' && <Smartphone className="w-5 h-5 text-emerald-700" />}
            {paymentMethod === 'BANK_TRANSFER' && <Building className="w-5 h-5 text-emerald-700" />}
            {paymentMethod === 'SIMULATED' && <CheckCircle className="w-5 h-5 text-emerald-700" />}
            <div>
              <span className="text-xs text-gray-500 block leading-tight">Selected Method</span>
              <span className="text-sm font-bold text-emerald-900">
                {paymentMethod === 'UPI' ? 'UPI Instant Payment' : (paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Simulated Sandbox Payment')}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 text-center">
            🔒 Safe & Secure Demo Gateway. No real funds will be charged.
          </div>

          {/* CTAs */}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button variant="emerald" onClick={handlePay} loading={loading} fullWidth>
              Simulate Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
