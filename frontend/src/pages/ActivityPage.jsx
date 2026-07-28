import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/formatters';
import api from '../services/api';
import { ArrowUpRight, ArrowDownLeft, Calendar, FolderOpen } from 'lucide-react';

const ActivityPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Investments', 'Returns', 'Withdrawals'];

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await api.get('/activity');
        setTransactions(response.data.transactions || []);
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  // Preset demo activities matching exact mobile UI design
  const defaultActivities = [
    {
      id: 'act-w1',
      category: 'Today',
      title: 'Withdrawal to HDFC Bank',
      date: 'Today, 10:15 AM',
      amount: 18920.00,
      detail: 'HDFC Bank **** 4921 (IMPS)',
      type: 'Withdrawals',
      isPositive: false
    },
    {
      id: 'act-1',
      category: 'Today',
      title: 'Daily Return Received',
      date: '21 July 2026, 09:30 AM',
      amount: 1065.10,
      detail: '1% of ₹1,06,510',
      type: 'Returns',
      isPositive: true
    },
    {
      id: 'act-2',
      category: 'Yesterday',
      title: 'Daily Return Received',
      date: '20 July 2026, 09:30 AM',
      amount: 1065.10,
      detail: '1% of ₹1,06,510',
      type: 'Returns',
      isPositive: true
    },
    {
      id: 'act-3',
      category: '19 July 2026 (Sunday)',
      isHoliday: true,
      title: 'Weekend Holiday',
      detail: 'No returns on weekends',
      type: 'Returns'
    },
    {
      id: 'act-4',
      category: '18 July 2026 (Saturday)',
      isHoliday: true,
      title: 'Weekend Holiday',
      detail: 'No returns on weekends',
      type: 'Returns'
    },
    {
      id: 'act-w2',
      category: '12 July 2026',
      title: 'Instant Bank Withdrawal',
      date: '12 July 2026, 02:30 PM',
      amount: 5000.00,
      detail: 'HDFC Bank **** 4921 (IMPS)',
      type: 'Withdrawals',
      isPositive: false
    },
    {
      id: 'act-5',
      category: '17 July 2026',
      title: 'Daily Return Received',
      date: '17 July 2026, 09:30 AM',
      amount: 1065.10,
      detail: '1% of ₹1,06,510',
      type: 'Returns',
      isPositive: true
    },
    {
      id: 'act-6',
      category: '09 July 2026',
      title: 'Invested in Plan',
      date: '09 July 2026, 11:15 AM',
      amount: 106510.00,
      detail: '22 Day Growth Plan',
      type: 'Investments',
      isPositive: false
    },
    {
      id: 'act-7',
      category: '05 July 2026',
      title: 'Plan Completed Payout',
      date: '05 July 2026, 04:00 PM',
      amount: 61000.00,
      detail: 'Principal + ₹11,000 Returns',
      type: 'Returns',
      isPositive: true
    }
  ];

  // Map API transactions if available, otherwise use demo feed
  const displayFeed = transactions.length > 0
    ? transactions.map(t => {
        let categoryType = 'Returns';
        if (t.type === 'INVESTMENT') categoryType = 'Investments';
        if (t.type === 'WITHDRAWAL') categoryType = 'Withdrawals';

        return {
          id: t.id,
          category: new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          title: t.description.split(' - ')[0] || t.type,
          date: new Date(t.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          amount: parseFloat(t.amount),
          detail: t.description,
          type: categoryType,
          isPositive: t.type !== 'INVESTMENT' && t.type !== 'WITHDRAWAL'
        };
      })
    : defaultActivities;

  // Filter based on currently active filter pill
  const filteredFeed = activeFilter === 'All'
    ? displayFeed
    : displayFeed.filter(item => item.type === activeFilter);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center pb-20 text-[#667085] text-sm">Loading activities...</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 sticky top-0 bg-white z-10 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-[#101828]">Activity</h1>
      </header>

      {/* Filter Pills */}
      <div className="px-4 py-3 flex overflow-x-auto space-x-2 scrollbar-hide border-b border-gray-100 bg-white sticky top-[68px] z-10">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
              activeFilter === filter
                ? 'bg-[#062E23] text-white border border-[#062E23] shadow-sm'
                : 'bg-white text-[#667085] border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="px-4 py-3">
        {filteredFeed.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <FolderOpen size={24} />
            </div>
            <h3 className="font-semibold text-[#101828] text-sm mb-1">No {activeFilter} Activity</h3>
            <p className="text-xs text-[#667085]">There are no recorded transactions in this category yet.</p>
          </div>
        ) : (
          filteredFeed.map((item) => (
            <div key={item.id} className="mb-5">
              <h3 className="text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2.5">
                {item.category}
              </h3>

              {item.isHoliday ? (
                <div className="bg-gray-50 rounded-xl p-3.5 flex items-center justify-center border border-gray-100 border-dashed">
                  <div className="text-center">
                    <Calendar size={18} className="text-gray-400 mx-auto mb-1" />
                    <h4 className="font-semibold text-[#101828] text-xs">{item.title}</h4>
                    <p className="text-[11px] text-[#667085]">{item.detail}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between shadow-xs">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.type === 'Investments'
                        ? 'bg-blue-50 text-blue-600'
                        : item.type === 'Withdrawals'
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-[#00A859]/10 text-[#00A859]'
                    }`}>
                      {item.type === 'Investments' ? (
                        <ArrowUpRight size={18} />
                      ) : item.type === 'Withdrawals' ? (
                        <ArrowDownLeft size={18} />
                      ) : (
                        <ArrowUpRight size={18} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#101828] text-sm">{item.title}</h4>
                      <p className="text-xs text-[#667085]">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      item.type === 'Investments' || item.type === 'Withdrawals' ? 'text-[#101828]' : 'text-[#00A859]'
                    }`}>
                      {item.isPositive ? '+' : '-'}{formatCurrency(item.amount)}
                    </p>
                    <p className="text-[10px] text-[#667085]">{item.detail}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
