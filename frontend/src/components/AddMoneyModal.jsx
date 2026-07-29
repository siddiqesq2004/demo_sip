import React, { useState, useEffect } from 'react';
import { X, Plus, Smartphone, Building2, ShieldCheck, CheckCircle2, Wallet, Landmark } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function AddMoneyModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('5000');
  const [target, setTarget] = useState('available_cash'); // 'available_cash' | 'total_value'
  const [method, setMethod] = useState('HDFC Bank Ltd (•••• 4921)');
  const [userBanks, setUserBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setLoading(false);
      setAmount('5000');
      fetchBankAccounts();
    }
  }, [isOpen]);

  const fetchBankAccounts = async () => {
    try {
      const res = await api.get('/bank-accounts');
      if (res.data && res.data.bank_accounts) {
        setUserBanks(res.data.bank_accounts);
        const primary = res.data.bank_accounts.find(b => b.isPrimary);
        if (primary) {
          setMethod(`${primary.name} (${primary.accNo})`);
        }
      }
    } catch (err) {
      console.error('Failed to fetch bank accounts:', err);
      setUserBanks([
        { id: 1, name: 'HDFC Bank Ltd', accNo: '•••• •••• 4921', isPrimary: true },
        { id: 2, name: 'ICICI Bank Ltd', accNo: '•••• •••• 8820', isPrimary: false }
      ]);
    }
  };

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

    try {
      setLoading(true);
      const res = await api.post('/wallet/deposit', {
        amount: num,
        target: target,
        payment_method: method
      });

      if (onSuccess) onSuccess(num, target, method);
      handleResetAndClose();
    } catch (err) {
      console.error('Deposit error:', err);
      if (onSuccess) onSuccess(num, target, method);
      handleResetAndClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-[#062E23] to-[#0B3B2F] text-white p-5 relative flex-shrink-0">
          <button
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-emerald-800/50 text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Plus className="w-4 h-4 text-[#00A859]" />
            <span>Deposit Money</span>
          </div>
          
          <h3 className="text-xl font-extrabold text-white">Add Funds</h3>
          <p className="text-xs text-emerald-200/80">Choose target balance & linked bank account</p>
        </div>

        {success ? (
          /* SUCCESS VIEW */
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-emerald-100 text-[#00A859] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h4 className="text-lg font-black text-[#062E23]">Money Added Successfully!</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                <strong className="text-[#00A859] font-extrabold">{formatCurrency(parseFloat(amount))}</strong> has been credited to your{' '}
                <strong className="text-gray-900 font-bold">{target === 'available_cash' ? 'Available Cash' : 'Total Wallet Balance'}</strong> via{' '}
                <strong className="text-gray-900 font-bold">{method}</strong>.
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
          <form onSubmit={handleAddFunds} className="p-5 space-y-4 overflow-y-auto flex-1">
            
            {/* Target Balance Selection */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[#062E23] uppercase tracking-wider block">1. Add Money To:</label>
              
              <div className="grid grid-cols-2 gap-2">
                <label className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  target === 'available_cash'
                    ? 'border-[#00A859] bg-emerald-50/70 ring-1 ring-[#00A859]'
                    : 'border-gray-200 bg-gray-50/70 hover:bg-gray-100/50'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <Wallet size={16} className={target === 'available_cash' ? 'text-[#00A859]' : 'text-gray-400'} />
                    <input
                      type="radio"
                      name="depositTarget"
                      checked={target === 'available_cash'}
                      onChange={() => setTarget('available_cash')}
                      className="accent-[#00A859]"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-black text-gray-900 block">Available Cash</span>
                    <span className="text-[10px] text-gray-500 font-medium leading-tight block">Liquid cash ready to withdraw</span>
                  </div>
                </label>

                <label className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  target === 'total_value'
                    ? 'border-[#00A859] bg-emerald-50/70 ring-1 ring-[#00A859]'
                    : 'border-gray-200 bg-gray-50/70 hover:bg-gray-100/50'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <ShieldCheck size={16} className={target === 'total_value' ? 'text-[#00A859]' : 'text-gray-400'} />
                    <input
                      type="radio"
                      name="depositTarget"
                      checked={target === 'total_value'}
                      onChange={() => setTarget('total_value')}
                      className="accent-[#00A859]"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-black text-gray-900 block">Total Wallet</span>
                    <span className="text-[10px] text-gray-500 font-medium leading-tight block">Main portfolio balance</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[#062E23] uppercase tracking-wider block">2. Deposit Amount (₹)</label>
              
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

            {/* Payment Source / Linked Bank Selection */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[#062E23] uppercase tracking-wider block">3. Payment Source</label>
              
              <div className="space-y-2">
                {/* UPI Option */}
                <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  method.includes('UPI') ? 'border-[#00A859] bg-emerald-50/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Smartphone size={18} className="text-[#00A859]" />
                    <div>
                      <span className="text-xs font-bold text-gray-800 block">UPI (GPay / PhonePe / Paytm)</span>
                      <span className="text-[10px] text-gray-400 font-medium">Instant transfer via any UPI app</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={method.includes('UPI')}
                    onChange={() => setMethod('UPI (GPay / PhonePe / Paytm)')}
                    className="accent-[#00A859]"
                  />
                </label>

                {/* Linked Bank Accounts */}
                {userBanks.map((bank) => {
                  const bankLabel = `${bank.name} (${bank.accNo})`;
                  const isSelected = method === bankLabel;
                  return (
                    <label key={bank.id || bank.name} className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected ? 'border-[#00A859] bg-emerald-50/50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <Landmark size={18} className="text-[#062E23]" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-gray-900">{bank.name}</span>
                            {bank.isPrimary && (
                              <span className="bg-emerald-100 text-[#062E23] text-[9px] font-black px-1.5 py-0.2 rounded-md">Primary</span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium">{bank.accNo}</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymethod"
                        checked={isSelected}
                        onChange={() => setMethod(bankLabel)}
                        className="accent-[#00A859]"
                      />
                    </label>
                  );
                })}

                {/* Net Banking */}
                <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  method.includes('Net Banking') ? 'border-[#00A859] bg-emerald-50/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Building2 size={18} className="text-gray-600" />
                    <span className="text-xs font-bold text-gray-800">Net Banking / NEFT / IMPS</span>
                  </div>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={method.includes('Net Banking')}
                    onChange={() => setMethod('Net Banking / NEFT')}
                    className="accent-[#00A859]"
                  />
                </label>

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00A859] hover:bg-[#008f4c] text-white font-extrabold py-3.5 rounded-2xl text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing Deposit...' : `Deposit ${formatCurrency(parseFloat(amount) || 0)}`}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
