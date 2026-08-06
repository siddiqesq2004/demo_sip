import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Users, Award, Star, ChevronRight, Crown } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/Loader';

const LeaderboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('streaks'); // 'streaks' | 'referrals'
  const [leaderboardData, setLeaderboardData] = useState({ by_streaks: [], by_referrals: [] });

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaderboard');
      if (res.data) {
        setLeaderboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      // Fallback data
      const mockStreaks = [
        { rank: 1, name: 'Anish P', streak_count: 18, referral_count: 12, total_returns: 18920, avatar: 'A' },
        { rank: 2, name: 'Rahul Verma', streak_count: 15, referral_count: 8, total_returns: 35000, avatar: 'R' },
        { rank: 3, name: 'Priya Sharma', streak_count: 12, referral_count: 6, total_returns: 15000, avatar: 'P' },
        { rank: 4, name: 'Vikram Malhotra', streak_count: 10, referral_count: 5, total_returns: 60000, avatar: 'V' },
        { rank: 5, name: 'Sneha Patel', streak_count: 8, referral_count: 4, total_returns: 7500, avatar: 'S' },
        { rank: 6, name: 'Ananya Rao', streak_count: 6, referral_count: 3, total_returns: 25000, avatar: 'A' }
      ];
      setLeaderboardData({ by_streaks: mockStreaks, by_referrals: mockStreaks });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading Leaderboard Rankings..." />;

  const currentList = activeTab === 'streaks' ? (leaderboardData?.by_streaks || []) : (leaderboardData?.by_referrals || []);
  const topThree = currentList.slice(0, 3);
  const restList = currentList.slice(3);

  // User's own rank (Anish P)
  const userRank = currentList.find(u => u.name.toLowerCase().includes('anish')) || currentList[0];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-28 text-gray-900">
      
      {/* --- Top Emerald Hero Header --- */}
      <div className="bg-gradient-to-br from-[#0B3B2F] via-[#062E23] to-[#031D16] text-white pt-12 pb-12 px-5 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Community Insights</span>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Investor Champions</span>
              <Trophy className="text-amber-400 fill-amber-400 w-6 h-6 animate-bounce" />
            </h1>
          </div>
        </div>

        {/* --- Filter Toggle Tabs --- */}
        <div className="bg-white/10 backdrop-blur-md p-1 rounded-2xl flex items-center justify-between border border-white/10 mt-4">
          <button
            onClick={() => setActiveTab('streaks')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'streaks'
                ? 'bg-amber-400 text-[#062E23] shadow-md font-extrabold scale-[1.02]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Flame size={16} className={activeTab === 'streaks' ? 'text-[#062E23] fill-[#062E23]' : ''} />
            <span>Wealth Streaks 🔥</span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'referrals'
                ? 'bg-amber-400 text-[#062E23] shadow-md font-extrabold scale-[1.02]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Users size={16} className={activeTab === 'referrals' ? 'text-[#062E23]' : ''} />
            <span>Top Referrals 👥</span>
          </button>
        </div>
      </div>

      <div className="px-5 -mt-6">
        
        {/* --- Top 3 Winners Podium --- */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-amber-100 mb-5 relative">
          <div className="text-center mb-4">
            <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
              {activeTab === 'streaks' ? '🔥 Top Wealth Streaks' : '👥 Top Growth Ambassadors'}
            </span>
          </div>

          <div className="flex items-end justify-center gap-3 pt-2">
            
            {/* 2nd Place (Silver) */}
            {topThree[1] && (
              <div className="flex-1 flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 border-2 border-slate-300 flex items-center justify-center font-black text-slate-800 text-lg shadow-md">
                    {topThree[1].avatar}
                  </div>
                  <div className="absolute -bottom-2 -right-1 bg-slate-300 text-slate-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                    2
                  </div>
                </div>
                <div className="text-xs font-extrabold text-gray-800 text-center truncate max-w-[80px]">{topThree[1].name}</div>
                <div className="text-[11px] font-bold text-amber-600">
                  {activeTab === 'streaks' ? `🔥 ${topThree[1].streak_count}d` : `👥 ${topThree[1].referral_count}`}
                </div>
                <div className="w-full bg-slate-100 h-16 rounded-t-2xl mt-2 flex items-end justify-center pb-2 text-xs font-black text-slate-500">
                  2nd
                </div>
              </div>
            )}

            {/* 1st Place (Gold Winner) */}
            {topThree[0] && (
              <div className="flex-1 flex flex-col items-center -mt-4">
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-100 border-2 border-amber-400 flex items-center justify-center font-black text-[#062E23] text-xl shadow-lg ring-4 ring-amber-400/20">
                    {topThree[0].avatar}
                  </div>
                  <div className="absolute -bottom-2 -right-1 bg-amber-400 text-[#062E23] text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border border-white">
                    1
                  </div>
                </div>
                <div className="text-xs font-black text-gray-900 text-center truncate max-w-[90px]">{topThree[0].name}</div>
                <div className="text-xs font-extrabold text-emerald-600">
                  {activeTab === 'streaks' ? `🔥 ${topThree[0].streak_count} Days` : `👥 ${topThree[0].referral_count} Ref`}
                </div>
                <div className="w-full bg-gradient-to-t from-amber-100 to-amber-200 h-24 rounded-t-2xl mt-2 flex items-end justify-center pb-2 text-sm font-black text-amber-900 shadow-inner">
                  1st 🏆
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {topThree[2] && (
              <div className="flex-1 flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-700 to-orange-200 border-2 border-amber-600 flex items-center justify-center font-black text-amber-950 text-lg shadow-md">
                    {topThree[2].avatar}
                  </div>
                  <div className="absolute -bottom-2 -right-1 bg-amber-700 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                    3
                  </div>
                </div>
                <div className="text-xs font-extrabold text-gray-800 text-center truncate max-w-[80px]">{topThree[2].name}</div>
                <div className="text-[11px] font-bold text-amber-700">
                  {activeTab === 'streaks' ? `🔥 ${topThree[2].streak_count}d` : `👥 ${topThree[2].referral_count}`}
                </div>
                <div className="w-full bg-amber-50 h-12 rounded-t-2xl mt-2 flex items-end justify-center pb-2 text-xs font-black text-amber-800">
                  3rd
                </div>
              </div>
            )}

          </div>
        </div>

        {/* --- Full Rankings Table --- */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">All Investor Rankings</h3>

          <div className="space-y-2">
            {restList.map((usr, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/70 hover:bg-gray-100/80 transition-colors gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-extrabold text-gray-400 text-xs w-5 text-center flex-shrink-0">#{usr.rank}</span>
                  <div className="w-10 h-10 rounded-full bg-[#062E23] text-amber-300 font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                    {usr.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold text-gray-900 truncate">{usr.name}</div>
                    <div className="text-[11px] font-medium text-gray-400 truncate">Total Returns: ₹{usr.total_returns.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm flex-shrink-0 whitespace-nowrap">
                  {activeTab === 'streaks' ? (
                    <>
                      <Flame size={14} className="text-orange-500 fill-orange-500 flex-shrink-0" />
                      <span className="text-xs font-black text-gray-900">{usr.streak_count} Days</span>
                    </>
                  ) : (
                    <>
                      <Users size={14} className="text-[#00A859] flex-shrink-0" />
                      <span className="text-xs font-black text-gray-900">{usr.referral_count} Ref</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- Logged-In User Fixed Rank Bar --- */}
      {userRank && (
        <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-5 z-40">
          <div className="bg-gradient-to-r from-[#0B3B2F] to-[#062E23] text-white p-3.5 rounded-2xl shadow-xl border border-amber-400/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#062E23] font-black flex items-center justify-center text-sm shadow-md">
                #{userRank.rank}
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300">Your Current Ranking</div>
                <div className="text-sm font-extrabold text-white">{userRank.name} (You)</div>
              </div>
            </div>

            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
              <Flame size={16} className="text-orange-400 fill-orange-400" />
              <span className="text-xs font-black text-amber-300">{userRank.streak_count} Day Streak</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LeaderboardPage;
