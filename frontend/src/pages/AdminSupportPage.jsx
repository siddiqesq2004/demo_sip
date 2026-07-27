import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { MessageSquare, Send, ShieldCheck, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminSupportPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const selectedChatIdRef = useRef(selectedChatId);
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  // Auto-poll support chats list every 1 second for live real-time connectivity
  useEffect(() => {
    fetchChats();
    const chatTimer = setInterval(() => {
      fetchChats();
    }, 1000);
    return () => clearInterval(chatTimer);
  }, []);

  // Auto-poll messages for selected chat every 1 second
  useEffect(() => {
    if (!selectedChatId) return;
    fetchMessagesForChat(selectedChatId);
    const msgTimer = setInterval(() => {
      fetchMessagesForChat(selectedChatId);
    }, 1000);
    return () => clearInterval(msgTimer);
  }, [selectedChatId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchChats = async () => {
    try {
      const res = await api.get('/admin/support/chats');
      if (res.data && res.data.chats) {
        setChats(res.data.chats);
        if (res.data.chats.length > 0) {
          const currentId = selectedChatIdRef.current;
          const chatExists = res.data.chats.some(c => Number(c.id) === Number(currentId));
          if (!currentId || !chatExists) {
            const firstId = res.data.chats[0].id;
            setSelectedChatId(firstId);
            selectedChatIdRef.current = firstId;
            fetchMessagesForChat(firstId);
          } else if (currentId) {
            fetchMessagesForChat(currentId);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching support chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesForChat = async (chatId) => {
    try {
      const res = await api.get(`/admin/support/messages/${chatId}`);
      if (res.data && res.data.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    selectedChatIdRef.current = chatId;
    fetchMessagesForChat(chatId);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedChatId || !replyText.trim()) return;

    const currentText = replyText;
    setReplyText('');

    const selectedChat = chats.find(c => Number(c.id) === Number(selectedChatId));
    const targetUserName = selectedChat?.user_name || 'Investor';

    // Optimistically append to chat UI right away
    const newMsg = {
      id: Date.now(),
      sender_type: 'subadmin',
      sender_name: 'Neha Gupta (Sub-Admin)',
      text: currentText,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);

    try {
      await api.post('/admin/support/reply', {
        chat_id: selectedChatId,
        text: currentText
      });
      showToast(`✅ Reply delivered to ${targetUserName}!`);
      fetchMessagesForChat(selectedChatId);
    } catch (err) {
      console.log('Reply fallback applied');
    }
  };

  const handleResolveChat = async () => {
    if (!selectedChatId) return;
    try {
      await api.post('/admin/support/resolve', {
        chat_id: selectedChatId
      });
      showToast('✅ Support Ticket marked as RESOLVED!');
      fetchChats();
      fetchMessagesForChat(selectedChatId);
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  if (loading) return <Loader label="Loading Live Support Desk..." />;

  const activeChat = chats.find(c => Number(c.id) === Number(selectedChatId)) || chats[0];

  return (
    <div className="space-y-6 relative">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-2xl z-50 animate-bounce border border-emerald-500/30">
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="text-credora-gold w-6 h-6" />
            Live Support Desk & Sub-Admin Chat Console
          </h1>
          <p className="text-xs text-gray-400 mt-1">Connect free Sub-Admins with user help queries and audit live conversation logs</p>
        </div>

        <div className="bg-blue-950/80 border border-blue-800/40 text-blue-400 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
          <Clock size={16} />
          <span>{chats.length} Assigned Support Tickets</span>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[520px]">
        {/* Left Side: Ticket Threads List */}
        <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">User Help Requests</h3>
          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {chats.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">No support tickets assigned to you.</p>
            ) : (
              chats.map((chat) => {
                const isSelected = Number(selectedChatId) === Number(chat.id);
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/80 border-2 border-[#00A859] shadow-lg ring-2 ring-emerald-500/20'
                        : 'bg-slate-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                        <User size={14} className={isSelected ? 'text-emerald-400' : 'text-credora-gold'} />
                        <span className={isSelected ? 'text-emerald-300 font-extrabold' : ''}>{chat.user_name}</span>
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        chat.status === 'IN_CONVERSATION'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {chat.status === 'IN_CONVERSATION' ? 'In Conversation' : 'Open'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-1 mb-2 font-medium">{chat.initial_query || chat.last_message}</p>

                    <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-800/80 pt-2">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <ShieldCheck size={12} />
                        Assigned: {chat.subadmin_name || 'Neha Gupta'}
                      </span>
                      <span className="font-mono">{chat.created_at || 'Just now'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversation Chat Workspace */}
        <div className="lg:col-span-2 bg-slate-900 border border-gray-800 rounded-2xl flex flex-col overflow-hidden">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="bg-slate-950 p-4 border-b border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <User size={16} className="text-emerald-400" />
                    <span>Chatting with {activeChat.user_name}</span>
                    <span className="text-xs text-gray-400 font-mono">({activeChat.user_email})</span>
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    Handling Sub-Admin: {activeChat.subadmin_name || 'Vijay'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {activeChat.status === 'RESOLVED' ? (
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Resolved
                    </span>
                  ) : (
                    <button
                      onClick={handleResolveChat}
                      className="bg-[#00A859] hover:bg-[#00904d] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark as Resolved</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[340px] max-h-[380px] bg-slate-950/60">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12 text-sm font-semibold">No messages in this chat thread yet. Type below to start conversation.</div>
                ) : (
                  messages.map((m) => {
                    const isUser = m.sender_type === 'user';
                    const msgContent = m.text || m.message || m.initial_query || '(No message content)';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} mb-2`}
                      >
                        <span className="text-xs font-bold text-gray-300 mb-1 px-1 flex items-center gap-1">
                          {isUser ? (
                            <span className="text-blue-400 font-bold">👤 {m.sender_name || activeChat?.user_name}</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">🛡️ {m.sender_name || 'Neha Gupta (Sub-Admin)'}</span>
                          )}
                        </span>

                        <div
                          className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-xl border ${
                            isUser
                              ? 'bg-slate-800 text-white rounded-tl-none border-blue-500/30'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-tr-none border-emerald-400/40'
                          }`}
                        >
                          <p className="text-sm md:text-base font-semibold leading-relaxed tracking-wide text-white">
                            {msgContent}
                          </p>
                          <div className="flex justify-end items-center gap-1.5 mt-1.5 pt-1 border-t border-white/20">
                            <span className="text-[11px] font-mono opacity-90 text-gray-200">{m.created_at || 'Just now'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send Reply Input */}
              <form onSubmit={handleSendReply} className="p-3 bg-slate-950 border-t border-gray-800 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Type Sub-Admin reply to ${activeChat.user_name}...`}
                  className="flex-1 bg-slate-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  className="gold-gradient text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all"
                >
                  <Send size={14} />
                  <span>Send Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
              <MessageSquare size={36} className="mb-2 opacity-50" />
              <p className="text-xs">Select a user help request from the left list to view and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
