import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';
import Button from './Button';
import { formatCurrency } from '../utils/formatters';

export default function SuccessModal({ isOpen, onClose, investmentData }) {
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      if (mainEl) {
        mainEl.style.overflow = 'hidden';
        mainEl.style.touchAction = 'none';
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      if (mainEl) {
        mainEl.style.overflow = '';
        mainEl.style.touchAction = '';
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      if (mainEl) {
        mainEl.style.overflow = '';
        mainEl.style.touchAction = '';
      }
    };
  }, [isOpen]);

  if (!isOpen || !investmentData) return null;

  const modalTarget = document.getElementById('phone-root') || document.body;

  return createPortal(
    <div 
      className="absolute inset-0 z-[100] flex items-center justify-center p-4 pt-12 pb-6 bg-black/70 backdrop-blur-sm animate-fade-in"
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-100 text-center p-6 space-y-4 max-h-full flex flex-col overflow-y-auto scrollbar-hide">
        {/* Animated Check Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-credora-green flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-gray-900">Investment Activated!</h3>
          <p className="text-xs text-gray-500 mt-1">
            Your investment cycle in <span className="font-bold text-gray-800">{investmentData.plan_name}</span> has started successfully.
          </p>
        </div>

        {/* Investment Details Box */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Capital Invested:</span>
            <span className="font-bold text-gray-900">{formatCurrency(investmentData.amount)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Expected Total Payout:</span>
            <span className="font-bold text-credora-green">{formatCurrency(investmentData.total_expected)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Status:</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
              <TrendingUp className="w-3 h-3" /> ACTIVE
            </span>
          </div>
        </div>

        <Button variant="emerald" onClick={onClose} fullWidth className="gap-2">
          View in Portfolio <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>,
    modalTarget
  );
}
