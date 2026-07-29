import React from 'react';
import { X, Bell, Clock, CheckCircle2, XCircle, Sparkles, Shield, Gift, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function NotificationsModal({ isOpen, onClose, notifications = [], onClearUnread }) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-[#062E23] to-[#0B3B2F] text-white p-5 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-emerald-800/50 text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4 text-[#00A859]" />
            <span>Activity & Alerts</span>
          </div>
          
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-[#00A859] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                {unreadCount} New
              </span>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
                <Bell size={24} />
              </div>
              <p className="text-xs text-gray-500 font-medium">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isPending = n.type === 'withdrawal_pending';
              const isApproved = n.type === 'withdrawal_approved';
              const isRejected = n.type === 'withdrawal_rejected';
              const isPayout = n.type === 'payout';

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-1 relative ${
                    n.unread
                      ? 'bg-amber-50/60 border-amber-200/80 shadow-xs'
                      : 'bg-gray-50/70 border-gray-100'
                  }`}
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        isPending ? 'bg-amber-100 text-amber-700' :
                        isApproved ? 'bg-emerald-100 text-[#00A859]' :
                        isRejected ? 'bg-red-100 text-red-600' :
                        isPayout ? 'bg-emerald-100 text-[#00A859]' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {isPending ? <Clock size={14} /> :
                         isApproved ? <CheckCircle2 size={14} /> :
                         isRejected ? <XCircle size={14} /> :
                         isPayout ? <Sparkles size={14} /> :
                         <Shield size={14} />}
                      </div>

                      <span className={`text-xs font-black ${
                        isPending ? 'text-amber-800' :
                        isApproved ? 'text-[#062E23]' :
                        isRejected ? 'text-red-700' :
                        'text-gray-900'
                      }`}>
                        {n.title}
                      </span>
                    </div>

                    <span className="text-[10px] text-gray-400 font-medium">{n.time}</span>
                  </div>

                  {/* Notification Body */}
                  <p className="text-xs text-gray-600 leading-relaxed pl-9 font-medium">
                    {n.desc}
                  </p>

                  {/* Status Badge */}
                  {isPending && (
                    <div className="ml-9 mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                      <Clock size={11} /> Awaiting Sub-Admin Approval
                    </div>
                  )}

                  {isApproved && (
                    <div className="ml-9 mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#062E23] text-[10px] font-extrabold border border-emerald-200">
                      <CheckCircle2 size={11} className="text-[#00A859]" /> Approved & Debited from Wallet
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex-shrink-0 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              if (onClearUnread) onClearUnread();
            }}
            className="text-gray-500 hover:text-[#00A859] font-bold text-[11px]"
          >
            Mark all as read
          </button>
          
          <button
            onClick={onClose}
            className="bg-[#062E23] hover:bg-[#042018] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
