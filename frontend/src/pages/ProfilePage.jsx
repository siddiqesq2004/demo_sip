import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/formatters';
import api from '../services/api';
import { X, CheckCircle, Copy, CreditCard, ShieldCheck, Share2, HelpCircle, Settings, Bell, Lock, Send, Plus, User as UserIcon, Camera, Upload, Image as ImageIcon, Sprout, Clock } from 'lucide-react';

const presetAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
];

const ProfilePage = () => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states: null | 'profile' | 'bank' | 'kyc' | 'refer' | 'support' | 'settings' | 'chat'
  const [activeModal, setActiveModal] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const isModalOpen = !!activeModal || showAvatarModal;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.style.overflow = 'hidden';
        mainEl.style.touchAction = 'none';
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.style.overflow = 'auto';
        mainEl.style.touchAction = 'auto';
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.style.overflow = 'auto';
        mainEl.style.touchAction = 'auto';
      }
    }
  }, [activeModal, showAvatarModal]);


  // 1. Dynamic User Name & Photo State
  const [userName, setUserName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem('credora_user_avatar') || null);
  const [userPhone, setUserPhone] = useState('+91 98765 43210');

  // 2. Dynamic Bank Accounts State with Primary Toggle Capability
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, name: 'HDFC Bank Ltd', accNo: '•••• •••• 4921', holder: 'Investor', ifsc: 'HDFC0001234', isPrimary: true }
  ]);

  const [showAddBankForm, setShowAddBankForm] = useState(false);
  const [newBankName, setNewBankName] = useState('Axis Bank Ltd');
  const [newAccNo, setNewAccNo] = useState('9912 4410 8821');
  const [newIfsc, setNewIfsc] = useState('UTIB0001001');

  // 3. Settings State
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(true);

  // 4. Dynamic Live Support Chat State (Auto-connected to Free Sub-Admin)
  const [assignedSubadminName, setAssignedSubadminName] = useState('Free Official');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: '🟢 Connected to Free Sub-Admin Specialist. How can I assist you with your investment growth plan or payouts today?', time: 'Just now' }
  ]);
  const [inputChatMsg, setInputChatMsg] = useState('');

  const demoProfileFallback = {
    user: {
      id: 1,
      name: localStorage.getItem('credora_user') ? JSON.parse(localStorage.getItem('credora_user')).name : 'Anish P',
      email: 'anishp@email.com',
      is_verified: true,
      member_since: '2026'
    },
    account_summary: {
      total_invested: 106510.00,
      total_returns: 18920.00,
      account_balance: 0.00
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [resProfile, resBanks] = await Promise.all([
          api.get('/profile'),
          api.get('/bank-accounts')
        ]);
        const profileData = resProfile.data || demoProfileFallback;
        setData(profileData);
        if (profileData.user?.name) {
          setUserName(profileData.user.name);
        }
        if (profileData.user?.avatar_url) {
          setProfilePhoto(profileData.user.avatar_url);
          localStorage.setItem('credora_user_avatar', profileData.user.avatar_url);
        }
        if (resBanks.data && resBanks.data.bank_accounts) {
          setBankAccounts(resBanks.data.bank_accounts);
        }
      } catch (error) {
        console.error('Error fetching profile data, using demo fallback:', error);
        setData(demoProfileFallback);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('⚠️ Image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        saveAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAvatar = async (url) => {
    setProfilePhoto(url);
    if (url) {
      localStorage.setItem('credora_user_avatar', url);
    } else {
      localStorage.removeItem('credora_user_avatar');
    }
    setShowAvatarModal(false);
    showToast(url ? '📸 Profile photo updated successfully!' : '🗑️ Profile photo removed.');

    try {
      await api.post('/profile/avatar', { avatar_url: url });
    } catch (err) {
      console.error('Failed to sync avatar to backend:', err);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Dynamic Profile Save
  const handleSaveProfile = () => {
    if (data) {
      const updatedUser = { ...data.user, name: userName };
      setData({ ...data, user: updatedUser });
      
      const stored = localStorage.getItem('credora_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.name = userName;
          localStorage.setItem('credora_user', JSON.stringify(parsed));
        } catch (e) {}
      }
    }
    setActiveModal(null);
    showToast('✅ Profile name updated successfully!');
  };

  // Dynamic Add Bank Account to Backend DB
  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/bank-accounts', {
        name: newBankName || 'Axis Bank Ltd',
        accNo: `•••• •••• ${newAccNo.slice(-4) || '9912'}`,
        ifsc: newIfsc || 'UTIB0001001'
      });
      if (res.data && res.data.bank_accounts) {
        setBankAccounts(res.data.bank_accounts);
      }
      setShowAddBankForm(false);
      showToast('🎉 New bank account added to backend DB!');
    } catch (err) {
      showToast('❌ Failed to save bank account to server.');
    }
  };

  // Switch Primary Bank Account Handler in Backend DB
  const handleSetPrimaryBank = async (accId) => {
    try {
      const res = await api.put('/bank-accounts/primary', { id: accId });
      if (res.data && res.data.bank_accounts) {
        setBankAccounts(res.data.bank_accounts);
      }
      const primaryName = bankAccounts.find(a => a.id === accId)?.name || 'Bank Account';
      showToast(`✅ ${primaryName} set as primary payout account!`);
    } catch (err) {
      showToast('❌ Failed to set primary bank account on server.');
    }
  };

  // Dynamic Copy Code & Share
  const copyReferralCode = () => {
    navigator.clipboard?.writeText('CREDORA-ANISH77');
    setCopied(true);
    showToast('📋 Referral code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'CREDORA FinTech',
        text: 'Join CREDORA and earn 1% daily returns! Use my code CREDORA-ANISH77',
        url: 'https://credora.app/invite/ANISH77'
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText('https://credora.app/invite/ANISH77');
      showToast('🔗 Referral invite link copied to clipboard!');
    }
  };

  // Fetch real-time support messages from server whenever chat modal is open (1-second fast poll)
  useEffect(() => {
    if (activeModal === 'chat') {
      fetchLiveSupportMessages();
      const timer = setInterval(fetchLiveSupportMessages, 1000);
      return () => clearInterval(timer);
    }
  }, [activeModal]);

  const fetchLiveSupportMessages = async () => {
    try {
      const res = await api.get('/support/messages');
      if (res.data) {
        if (res.data.assigned_subadmin) {
          setAssignedSubadminName(res.data.assigned_subadmin);
        }
        if (res.data.messages && res.data.messages.length > 0) {
          setChatMessages(res.data.messages.map(m => ({
            id: m.id,
            sender: m.sender_type === 'user' ? 'user' : 'bot',
            text: m.text,
            time: m.created_at || 'Just now'
          })));
        }
      }
    } catch (e) {
      console.error('fetchLiveSupportMessages error:', e);
    }
  };

  // Dynamic Support Chat Send (Auto-Connected to Free Sub-Admin Neha Gupta)
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!inputChatMsg.trim()) return;

    const currentQuery = inputChatMsg;
    setInputChatMsg('');

    const userMsg = { id: Date.now(), sender: 'user', text: currentQuery, time: 'Just now' };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const res = await api.post('/support/message', { text: currentQuery });
      if (res.data && res.data.messages && res.data.messages.length > 0) {
        setChatMessages(res.data.messages.map(m => ({
          id: m.id,
          sender: m.sender_type === 'user' ? 'user' : 'bot',
          text: m.text,
          time: m.created_at || 'Just now'
        })));
      }
    } catch (err) {
      console.error('handleSendChat error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 text-[#101828]">
      {/* Header */}
      <div className="bg-[#062E23] pt-12 pb-8 px-4 rounded-b-3xl text-white relative">
        <div className="flex items-center space-x-3.5 mb-4">
          <div className="relative group cursor-pointer flex-shrink-0" onClick={() => setShowAvatarModal(true)}>
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-yellow-600 rounded-full flex items-center justify-center text-white font-extrabold text-2xl shadow-lg border-2 border-white/20">
                {userName ? userName.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-[#00A859] text-white p-1.5 rounded-full shadow-md border border-white hover:scale-110 transition-transform">
              <Camera size={12} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-1.5">
              <span>{userName}</span>
              <ShieldCheck size={18} className="text-[#00A859]" />
            </h2>
            <p className="text-emerald-200 text-xs">{data?.user?.email || 'anishp@email.com'}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 flex justify-between items-center text-xs">
          <div>
            <span className="text-gray-300 block text-[10px]">VERIFICATION STATUS</span>
            <span className="font-bold text-[#00A859] flex items-center space-x-1">
              <CheckCircle size={12} className="mr-1" /> Verified Investor
            </span>
          </div>
          
        </div>
      </div>

      {/* Account Summary Cards */}
      <div className="px-4 -mt-3 relative z-10">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-[#667085] uppercase font-semibold">Total Invested</p>
            <p className="text-xs font-extrabold text-[#101828] mt-0.5">{formatCurrency(data?.account_summary?.total_invested || 106510)}</p>
          </div>
          <div className="border-x border-gray-100 px-1">
            <p className="text-[10px] text-[#667085] uppercase font-semibold">Total Returns</p>
            <p className="text-xs font-extrabold text-[#00A859] mt-0.5">+{formatCurrency(data?.account_summary?.total_returns || 18920)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#667085] uppercase font-semibold">Account Bal</p>
            <p className="text-xs font-extrabold text-[#101828] mt-0.5">{formatCurrency(data?.account_summary?.account_balance || 0)}</p>
          </div>
        </div>
      </div>

      {/* Profile Menu Actions */}
      <div className="px-4 mt-6 space-y-3">
        {[
          { id: 'profile', icon: UserIcon, title: 'User Profile Details', subtitle: userName || 'Anish P' },
          { id: 'plans', icon: Sprout, title: 'Growth Plans', subtitle: 'Explore investment plans', route: '/plans' },
          { id: 'activity', icon: Clock, title: 'Activity History', subtitle: 'View all your transactions', route: '/activity' },
          { id: 'bank', icon: CreditCard, title: 'Bank Details', subtitle: `Manage linked bank accounts (${bankAccounts.length})` },
          { id: 'kyc', icon: ShieldCheck, title: 'KYC Verification', subtitle: 'Your identity is verified' },
          { id: 'refer', icon: Share2, title: 'Refer & Earn', subtitle: 'Invite friends and earn rewards' },
          { id: 'support', icon: HelpCircle, title: 'Help & Support', subtitle: 'Live Chat & Helpline' },
          { id: 'settings', icon: Settings, title: 'Settings', subtitle: 'Manage security & preferences' },
        ].map((menu) => {
          const MenuIcon = menu.icon;
          return (
            <div
              key={menu.id}
              onClick={() => menu.route ? navigate(menu.route) : setActiveModal(menu.id)}
              className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between shadow-xs hover:border-emerald-200 transition-colors cursor-pointer card-press"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#062E23] flex items-center justify-center">
                  <MenuIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101828]">{menu.title}</h3>
                  <p className="text-xs text-[#667085]">{menu.subtitle}</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          );
        })}

        {/* Logout Button */}
        <div className="pt-4 pb-6 text-center">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-2xl text-xs border border-red-100 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* --- MODALS --- */}
      {document.getElementById('phone-root') && createPortal(
        <>
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-2xl z-50 animate-bounce flex items-center space-x-1.5 border border-white/20">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Profile Details Modal */}
      {activeModal === 'profile' && (
        <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/60 z-[100] flex items-end justify-center pt-12 pb-6 px-3 animate-fade-in overflow-hidden">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-h-[75vh] overflow-y-auto scrollbar-hide rounded-3xl p-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#101828]">Edit Investor Profile</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-[#667085] font-medium block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 focus:border-[#00A859] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#101828] outline-none" 
                />
              </div>

              <div>
                <label className="text-xs text-[#667085] font-medium block mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={data?.user?.email || 'anishp@email.com'} 
                  disabled 
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-500 cursor-not-allowed" 
                />
              </div>

              <div>
                <label className="text-xs text-[#667085] font-medium block mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={userPhone} 
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 focus:border-[#00A859] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#101828] outline-none" 
                />
              </div>
            </div>

            <button onClick={handleSaveProfile} className="w-full bg-[#062E23] hover:bg-[#042018] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-colors">
              Save Profile Changes
            </button>
          </div>
        </div>
      )}

      {/* 2. Dynamic Bank Details Modal */}
      {activeModal === 'bank' && (
        <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/60 z-[100] flex items-end justify-center pt-12 pb-6 px-3 animate-fade-in overflow-hidden">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-h-[75vh] overflow-y-auto scrollbar-hide rounded-3xl p-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#101828]">Linked Bank Accounts</h3>
              <button onClick={() => { setActiveModal(null); setShowAddBankForm(false); }} className="p-1 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            {/* List of Bank Accounts */}
            <div className="space-y-3 mb-5">
              {bankAccounts.map((acc) => (
                <div key={acc.id} className="bg-gradient-to-r from-[#062E23] to-[#0B3B2F] rounded-2xl p-4 text-white shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] text-emerald-200 font-medium">Bank Account</p>
                      <h4 className="text-base font-bold">{acc.name}</h4>
                    </div>
                    {acc.isPrimary ? (
                      <span className="bg-[#00A859] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        Primary Account
                      </span>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => handleSetPrimaryBank(acc.id)}
                        className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors border border-white/30 shadow-xs cursor-pointer"
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>
                  <p className="text-base font-mono tracking-wider mb-2">{acc.accNo}</p>
                  <div className="flex justify-between text-[11px] text-emerald-100 border-t border-white/10 pt-2">
                    <span>Holder: {acc.holder}</span>
                    <span>IFSC: {acc.ifsc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Bank Form Drawer */}
            {showAddBankForm ? (
              <form onSubmit={handleAddBank} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 mb-4">
                <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider">Add Bank Details</h4>
                <div>
                  <label className="text-[11px] text-[#667085] block mb-1">Bank Name</label>
                  <input type="text" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-[#101828]" required />
                </div>
                <div>
                  <label className="text-[11px] text-[#667085] block mb-1">Account Number</label>
                  <input type="text" value={newAccNo} onChange={(e) => setNewAccNo(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-[#101828]" required />
                </div>
                <div>
                  <label className="text-[11px] text-[#667085] block mb-1">IFSC Code</label>
                  <input type="text" value={newIfsc} onChange={(e) => setNewIfsc(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-[#101828]" required />
                </div>
                <div className="flex space-x-2 pt-1">
                  <button type="button" onClick={() => setShowAddBankForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold">Cancel</button>
                  <button type="submit" className="flex-1 bg-[#00A859] text-white py-2 rounded-lg text-xs font-bold">Save Bank Account</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowAddBankForm(true)} className="w-full border border-[#062E23] text-[#062E23] py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 shadow-xs flex items-center justify-center space-x-1">
                <Plus size={16} />
                <span>Add New Bank Account</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. KYC Verification Modal */}
      {activeModal === 'kyc' && (
        <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/60 z-[100] flex items-end justify-center pt-12 pb-6 px-3 animate-fade-in overflow-hidden">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-h-[75vh] overflow-y-auto scrollbar-hide rounded-3xl p-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-[#101828]">KYC Compliance Status</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="text-center py-2 mb-3">
              <div className="w-12 h-12 bg-[#00A859]/10 rounded-full flex items-center justify-center mx-auto mb-2 text-[#00A859]">
                <CheckCircle size={26} />
              </div>
              <h4 className="text-base font-bold text-[#101828]">Identity Fully Verified</h4>
              <p className="text-xs text-[#667085]">Compliant with SEBI / RBI FinTech regulations</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 border border-gray-100 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-[#667085]">PAN Card:</span>
                <span className="font-bold text-[#101828]">ABCPA****K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Aadhaar Verified:</span>
                <span className="font-bold text-[#00A859]">•••• •••• 8812 ✅</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Risk Level:</span>
                <span className="font-bold text-[#101828]">Low Risk (Compliant)</span>
              </div>
            </div>

            <button onClick={() => setActiveModal(null)} className="w-full bg-[#062E23] text-white py-3 rounded-xl font-bold text-sm">
              Done
            </button>
          </div>
        </div>
      )}

      {/* 4. Refer & Earn Modal */}
      {activeModal === 'refer' && (
        <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/60 z-[100] flex items-end justify-center pt-12 pb-6 px-3 animate-fade-in overflow-hidden">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-h-[75vh] overflow-y-auto scrollbar-hide rounded-3xl p-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-[#101828]">Refer & Earn Rewards</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#062E23] to-[#0B3B2F] rounded-2xl p-5 text-white mb-4 text-center">
              <p className="text-xs text-emerald-200 uppercase font-semibold mb-1">Invite Friends</p>
              <h4 className="text-xl font-bold mb-2">Earn ₹500 Per Referral</h4>
              <p className="text-xs text-gray-200">When your friend starts their first 22-day investment growth plan.</p>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] text-[#667085] uppercase font-semibold">Your Code</p>
                <p className="text-sm font-extrabold text-[#101828] font-mono">CREDORA-ANISH77</p>
              </div>
              <button onClick={copyReferralCode} className="bg-[#062E23] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1">
                <Copy size={14} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <button onClick={handleShareLink} className="w-full bg-[#00A859] hover:bg-[#00904d] text-white py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center space-x-2">
              <Share2 size={16} />
              <span>Share Invite Link</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Help & Support Modal */}
      {activeModal === 'support' && (
        <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/60 z-[100] flex items-end justify-center pt-12 pb-6 px-3 animate-fade-in overflow-hidden">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-h-[75vh] overflow-y-auto scrollbar-hide rounded-3xl p-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#101828]">Help & Support Center</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <button onClick={() => setActiveModal('chat')} className="w-full bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-left hover:bg-emerald-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#00A859] text-white rounded-full flex items-center justify-center font-bold">💬</div>
                  <div>
                    <h4 className="font-bold text-sm text-[#101828]">24/7 Live Support Chat</h4>
                    <p className="text-xs text-[#667085]">Instant AI & Specialist responses</p>
                  </div>
                </div>
                <span className="bg-[#00A859] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Online</span>
              </button>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#667085]">Email Support:</span>
                  <span className="font-bold text-[#101828]">support@credora.app</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Toll-Free Helpline:</span>
                  <span className="font-bold text-[#101828]">1800-200-CREDORA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Operating Hours:</span>
                  <span className="font-bold text-[#00A859]">Mon - Fri, 9 AM - 7 PM</span>
                </div>
              </div>
            </div>

            <button onClick={() => setActiveModal(null)} className="w-full bg-[#062E23] text-white py-3.5 rounded-xl font-bold text-sm">
              Close
            </button>
          </div>
        </div>
      )}

      {/* 5b. Interactive Live Support Chat Sheet */}
      {activeModal === 'chat' && (
        <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/60 z-[100] flex items-end justify-center pt-12 pb-6 px-3 animate-fade-in overflow-hidden">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full h-[70vh] flex flex-col rounded-3xl p-4 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-[#00A859] rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-bold text-xs text-[#101828]">CREDORA Support Desk</h3>
                  <span className="text-[10px] text-[#00A859] font-bold block">
                    {assignedSubadminName.includes('Awaiting') ? '⏳ All Specialists Busy - Awaiting Free Official' : `🟢 Connected to Free Sub-Admin: ${assignedSubadminName}`}
                  </span>
                </div>
              </div>
              <button onClick={() => setActiveModal('support')} className="text-xs text-gray-500 font-semibold hover:underline">
                Back
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-hide">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm font-semibold leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-[#062E23] text-white rounded-br-none shadow-md' 
                      : 'bg-emerald-50 text-slate-900 border border-emerald-300 rounded-bl-none shadow-sm font-bold'
                  }`}>
                    <p>{msg.text || msg.message || '(No message content)'}</p>
                    <span className="text-[10px] opacity-75 block text-right mt-1 font-mono">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="pt-2 border-t border-gray-100 flex items-center space-x-2">
              <input 
                type="text" 
                value={inputChatMsg} 
                onChange={(e) => setInputChatMsg(e.target.value)} 
                placeholder="Type your support query..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#00A859]"
              />
              <button type="submit" className="bg-[#00A859] text-white p-2 rounded-xl">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Settings Modal */}
      {activeModal === 'settings' && (
        <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/60 z-[100] flex items-end justify-center pt-12 pb-6 px-3 animate-fade-in overflow-hidden">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-h-[75vh] overflow-y-auto scrollbar-hide rounded-3xl p-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#101828]">App Settings</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Bell size={18} className="text-[#062E23]" />
                  <div>
                    <h4 className="font-semibold text-[#101828] text-sm">Push Notifications</h4>
                    <p className="text-[11px] text-[#667085]">Daily returns & payout alerts</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications} 
                  onChange={() => setNotifications(!notifications)}
                  className="w-5 h-5 accent-[#00A859] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Lock size={18} className="text-[#062E23]" />
                  <div>
                    <h4 className="font-semibold text-[#101828] text-sm">Biometric Lock (Face ID)</h4>
                    <p className="text-[11px] text-[#667085]">Require fingerprint/face ID</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={biometrics} 
                  onChange={() => setBiometrics(!biometrics)}
                  className="w-5 h-5 accent-[#00A859] cursor-pointer"
                />
              </div>
            </div>

            <button 
              onClick={() => {
                localStorage.setItem('credora_biometrics', biometrics ? 'true' : 'false');
                setActiveModal(null);
                showToast(biometrics ? '⚙️ Biometric Face ID Lock enabled for login!' : '⚙️ App preferences saved!');
              }} 
              className="w-full bg-[#062E23] text-white py-3 rounded-xl font-bold text-sm shadow-md"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* 8. Profile Photo Upload & Preset Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[100] flex items-center justify-center pt-12 pb-6 px-4 overflow-hidden">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200 text-gray-900">
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-[#00A859] shadow-inner">
                <Camera size={24} />
              </div>
              <h3 className="text-lg font-black text-gray-900">Update Profile Photo</h3>
              <p className="text-xs text-gray-500 mt-0.5">Visible to Admin & Sub-Admins for approvals and live chat</p>
            </div>

            {/* Current Preview */}
            <div className="flex justify-center mb-5">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Current Preview" className="w-20 h-20 rounded-full object-cover border-4 border-[#00A859] shadow-lg" />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-yellow-600 rounded-full flex items-center justify-center text-white font-extrabold text-3xl shadow-lg">
                  {userName ? userName.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
            </div>

            {/* Upload File Input */}
            <label className="w-full bg-[#062E23] hover:bg-[#084232] text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all mb-4 active:scale-95">
              <Upload size={16} />
              <span>Upload Photo from Device</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* Presets Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Or Choose Avatar</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Preset Grid */}
            <div className="grid grid-cols-4 gap-3 my-3">
              {presetAvatars.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => saveAvatar(url)}
                  className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent hover:border-[#00A859] hover:scale-105 transition-all shadow-sm focus:outline-none"
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {profilePhoto && (
              <button
                onClick={() => saveAvatar(null)}
                className="w-full text-red-500 font-extrabold text-xs py-2 hover:bg-red-50 rounded-xl transition-colors mt-2"
              >
                Remove Custom Photo
              </button>
            )}
          </div>
        </div>
      )}
        </>,
        document.getElementById('phone-root')
      )}
    </div>
  );
};

export default ProfilePage;
