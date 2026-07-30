const userService = require('../services/userService');
const models = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHandler');

async function getDashboard(req, res) {
  try {
    const data = await userService.getDashboardData(req.user.id);
    return sendSuccess(res, 'Dashboard data retrieved successfully', data);
  } catch (err) {
    return sendError(res, 'Failed to fetch dashboard data', err.message, 500);
  }
}

async function getPortfolio(req, res) {
  try {
    const data = await userService.getUserPortfolio(req.user.id);
    return sendSuccess(res, 'Portfolio data retrieved successfully', data);
  } catch (err) {
    return sendError(res, 'Failed to fetch portfolio data', err.message, 500);
  }
}

async function getActivity(req, res) {
  try {
    const data = await userService.getUserActivity(req.user.id);
    return sendSuccess(res, 'Activity history retrieved successfully', data);
  } catch (err) {
    return sendError(res, 'Failed to fetch activity history', err.message, 500);
  }
}

async function getProfile(req, res) {
  try {
    const data = await userService.getUserProfile(req.user.id);
    return sendSuccess(res, 'User profile retrieved successfully', data);
  } catch (err) {
    return sendError(res, 'Failed to fetch profile details', err.message, 500);
  }
}

async function updateAvatar(req, res) {
  try {
    const userId = req.user.id;
    const { avatar_url } = req.body;
    if (!avatar_url) {
      return sendError(res, 'Avatar image URL or data is required');
    }
    await models.updateUserAvatar(userId, avatar_url);
    return sendSuccess(res, 'Profile photo updated successfully', { avatar_url });
  } catch (err) {
    return sendError(res, 'Failed to update profile photo', err.message, 500);
  }
}

async function requestWithdrawal(req, res) {
  try {
    const { amount, bank_name, account_no, ifsc, remarks } = req.body;
    if (!amount || !bank_name || !account_no) {
      return sendError(res, 'Amount, bank_name, and account_no are required.');
    }
    const withdrawalId = await models.createWithdrawalRequest(
      req.user.id,
      parseFloat(amount),
      bank_name,
      account_no,
      ifsc || 'HDFC0001234',
      remarks || 'Personal Savings'
    );
    return sendSuccess(res, 'Withdrawal request submitted successfully.', {
      withdrawal_id: withdrawalId,
      amount: parseFloat(amount),
      status: 'PENDING_APPROVAL'
    });
  } catch (err) {
    return sendError(res, 'Failed to submit withdrawal request', err.message, 500);
  }
}

async function findFreeSupportSubAdmin() {
  const allSubadmins = await models.getAllSubAdmins();
  const freeAgents = allSubadmins.filter(s => {
    const role = (s.role || '').toUpperCase();
    const perm = (s.permissions || '').toUpperCase();
    const status = (s.status || '').toUpperCase();
    const isSupportQualified = (
      role === 'SUPPORT_AGENT' || 
      perm === 'SUPPORT_CHAT_ONLY' || 
      (s.name || '').toLowerCase().includes('vijay') ||
      (s.name || '').toLowerCase().includes('neha')
    );
    const isFree = status === 'FREE';
    return isSupportQualified && isFree;
  });

  if (freeAgents.length === 0) return null;

  // Smart load balancing: pick free agent with fewest assigned active chats
  const allChats = await models.getAllSupportChats();
  let bestAgent = freeAgents[0];
  let minChats = Infinity;

  for (const agent of freeAgents) {
    const chatCount = allChats.filter(c => Number(c.subadmin_id) === Number(agent.id) && c.status !== 'RESOLVED').length;
    if (chatCount < minChats) {
      minChats = chatCount;
      bestAgent = agent;
    }
  }

  return bestAgent;
}

async function verifyOrReassignChat(chat) {
  if (!chat) return null;

  const allSubadmins = await models.getAllSubAdmins();
  
  let currentAssignedAgent = null;
  const isAwaiting = !chat.subadmin_name || (chat.subadmin_name || '').toLowerCase().includes('awaiting');
  if (chat.subadmin_id || !isAwaiting) {
    currentAssignedAgent = allSubadmins.find(s => 
      (s.id && Number(s.id) === Number(chat.subadmin_id)) || 
      (s.name && s.name.toLowerCase() === (chat.subadmin_name || '').toLowerCase())
    );
  }

  const isCurrentAgentFree = currentAssignedAgent && (currentAssignedAgent.status || '').toUpperCase() === 'FREE';
  const isResolved = (chat.status || '').toUpperCase() === 'RESOLVED';
  const isWrongAgent = currentAssignedAgent && !(['vijay', 'neha'].some(n => currentAssignedAgent.name.toLowerCase().includes(n)));

  if (!isCurrentAgentFree || isAwaiting || isResolved || isWrongAgent) {
    const freeAgent = await findFreeSupportSubAdmin();
    if (freeAgent) {
      await models.assignSubAdminToSupportChat(chat.id, freeAgent.id, freeAgent.name);
      chat.subadmin_id = freeAgent.id;
      chat.subadmin_name = freeAgent.name;
      chat.status = 'IN_CONVERSATION';
    } else if (!currentAssignedAgent || isWrongAgent) {
      await models.assignSubAdminToSupportChat(chat.id, null, 'Awaiting Free Official');
      chat.subadmin_id = null;
      chat.subadmin_name = 'Awaiting Free Official';
    }
  }

  return chat;
}

async function getSupportMessages(req, res) {
  try {
    const userId = req.user.id;
    let chats = await models.getUserSupportChat(userId);
    let chat = chats[0];

    if (!chat) {
      const freeAgent = await findFreeSupportSubAdmin();
      const assignedName = freeAgent ? freeAgent.name : 'Awaiting Free Official';
      const assignedId = freeAgent ? freeAgent.id : null;
      const chatId = await models.createSupportChat(userId, 'Needing help with growth cycle & payouts', assignedId, assignedName);
      
      if (freeAgent) {
        await models.createSupportMessage(chatId, 'subadmin', `${assignedName} (Official)`, `Hi! I am ${assignedName}. I am available and reviewing your query right now.`);
      } else {
        await models.createSupportMessage(chatId, 'subadmin', 'Credora Support System', 'All support specialists are currently busy or in work. Please wait, an official will connect with you as soon as they set their status to Free.');
      }
      chat = { id: chatId, subadmin_id: assignedId, subadmin_name: assignedName };
    } else {
      chat = await verifyOrReassignChat(chat);
    }

    const messages = await models.getSupportMessages(chat.id);
    return sendSuccess(res, 'Support messages fetched successfully', {
      chat_id: chat.id,
      assigned_subadmin: chat.subadmin_name || 'Awaiting Free Official',
      messages
    });
  } catch (err) {
    return sendError(res, 'Failed to fetch support messages', err.message, 500);
  }
}

async function sendSupportMessage(req, res) {
  try {
    const userId = req.user.id;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return sendError(res, 'Message text is required');
    }

    let chats = await models.getUserSupportChat(userId);
    let chat = chats[0];

    if (!chat) {
      const freeAgent = await findFreeSupportSubAdmin();
      const assignedName = freeAgent ? freeAgent.name : 'Awaiting Free Official';
      const assignedId = freeAgent ? freeAgent.id : null;
      const chatId = await models.createSupportChat(userId, text, assignedId, assignedName);
      
      if (freeAgent) {
        await models.createSupportMessage(chatId, 'subadmin', `${assignedName} (Official)`, `Hi! I am ${assignedName}. I am available and reviewing your query right now.`);
      } else {
        await models.createSupportMessage(chatId, 'subadmin', 'Credora Support System', 'All support specialists are currently busy or in work. Please wait, an official will connect with you as soon as they set their status to Free.');
      }
      chat = { id: chatId, subadmin_id: assignedId, subadmin_name: assignedName };
    } else {
      // Always verify or reassign to currently FREE support sub-admin (Vijay or Neha)
      chat = await verifyOrReassignChat(chat);
    }

    // Insert user message into database
    await models.createSupportMessage(chat.id, 'user', req.user.name || 'Investor', text);

    const updatedMessages = await models.getSupportMessages(chat.id);

    return sendSuccess(res, 'Support message sent successfully', {
      chat_id: chat.id,
      assigned_subadmin: chat.subadmin_name || 'Awaiting Free Official',
      messages: updatedMessages
    });
  } catch (err) {
    return sendError(res, 'Failed to send support message', err.message, 500);
  }
}

async function getBankAccounts(req, res) {
  try {
    const userId = req.user.id;
    let bankAccounts = await models.getUserBankAccounts(userId);
    if (bankAccounts.length === 0) {
      await models.createUserBankAccount(userId, 'HDFC Bank Ltd', '•••• •••• 4921', 'HDFC0001234', 1);
      bankAccounts = await models.getUserBankAccounts(userId);
    }
    const formatted = bankAccounts.map(b => ({
      id: b.id,
      name: b.name,
      accNo: b.acc_no,
      ifsc: b.ifsc,
      isPrimary: b.is_primary === 1
    }));
    return sendSuccess(res, 'Bank accounts retrieved successfully', { bank_accounts: formatted });
  } catch (err) {
    return sendError(res, 'Failed to fetch bank accounts', err.message, 500);
  }
}

async function addBankAccount(req, res) {
  try {
    const userId = req.user.id;
    const { name, accNo, ifsc } = req.body;
    if (!name || !accNo) {
      return sendError(res, 'Bank name and account number are required.');
    }
    const existing = await models.getUserBankAccounts(userId);
    const isPrimary = existing.length === 0 ? 1 : 0;
    await models.createUserBankAccount(userId, name, accNo, ifsc || 'HDFC0001234', isPrimary);
    
    const updated = await models.getUserBankAccounts(userId);
    const formatted = updated.map(b => ({
      id: b.id,
      name: b.name,
      accNo: b.acc_no,
      ifsc: b.ifsc,
      isPrimary: b.is_primary === 1
    }));
    return sendSuccess(res, 'Bank account added successfully to database', { bank_accounts: formatted });
  } catch (err) {
    return sendError(res, 'Failed to add bank account', err.message, 500);
  }
}

async function setPrimaryBankAccount(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.body;
    if (!id) {
      return sendError(res, 'Bank account ID is required');
    }
    await models.setUserPrimaryBankAccount(userId, id);
    const updated = await models.getUserBankAccounts(userId);
    const formatted = updated.map(b => ({
      id: b.id,
      name: b.name,
      accNo: b.acc_no,
      ifsc: b.ifsc,
      isPrimary: b.is_primary === 1
    }));
    return sendSuccess(res, 'Primary bank account updated successfully', { bank_accounts: formatted });
  } catch (err) {
    return sendError(res, 'Failed to set primary bank account', err.message, 500);
  }
}

async function claimGrowth(req, res) {
  try {
    const userId = req.user.id;
    const result = await models.claimUserGrowth(userId);
    if (!result.claimed) {
      return sendError(res, result.message || 'Failed to claim growth');
    }
    return sendSuccess(res, `🎉 Growth reward (+₹${result.claimed_amount.toFixed(0)}) claimed & unlocked successfully!`, result);
  } catch (err) {
    return sendError(res, 'Failed to claim growth reward', err.message, 500);
  }
}

async function getWallet(req, res) {
  try {
    const userId = req.user.id;
    const portfolio = await models.getPortfolioByUserId(userId);
    const activeInvestment = await models.getActiveInvestmentByUserId(userId);
    const transactions = await models.getTransactionsByUserId(userId);

    const availableCash = portfolio ? parseFloat(portfolio.available_cash !== undefined ? portfolio.available_cash : 2420.00) : 2420.00;
    const investedAmount = portfolio ? parseFloat(portfolio.invested_amount !== undefined ? portfolio.invested_amount : 116510.00) : 116510.00;
    const walletBalance = availableCash + investedAmount;

    return sendSuccess(res, 'Wallet data retrieved successfully', {
      wallet_balance: walletBalance,
      available_cash: availableCash,
      currently_invested: investedAmount,
      cycle_day: activeInvestment ? activeInvestment.current_day : 14,
      total_cycle_days: activeInvestment ? activeInvestment.duration_days : 22,
      auto_reinvest: portfolio ? portfolio.auto_reinvest === 1 : true,
      unclaimed_amount: portfolio ? parseFloat(portfolio.unclaimed_amount || 42.00) : 42.00,
      unclaimed_count: portfolio ? parseInt(portfolio.unclaimed_count || 1) : 1,
      unclaimed_days: portfolio ? portfolio.unclaimed_days : [{ day: 'Monday', amount: 42.00, date: '2026-07-27' }],
      recent_activity: transactions.slice(0, 10)
    });
  } catch (err) {
    return sendError(res, 'Failed to fetch wallet data', err.message, 500);
  }
}

async function handleToggleAutoReinvest(req, res) {
  try {
    const userId = req.user.id;
    const { status } = req.body;
    await models.toggleAutoReinvest(userId, status);
    return sendSuccess(res, `Auto-reinvest turned ${status ? 'ON' : 'OFF'}`, { auto_reinvest: status });
  } catch (err) {
    return sendError(res, 'Failed to toggle auto-reinvest', err.message, 500);
  }
}

async function getLeaderboard(req, res) {
  try {
    const data = await models.getLeaderboardData();
    return sendSuccess(res, 'Leaderboard rankings retrieved successfully', data);
  } catch (err) {
    return sendError(res, 'Failed to fetch leaderboard rankings', err.message, 500);
  }
}

async function depositWallet(req, res) {
  try {
    const userId = req.user.id;
    const { amount, payment_method } = req.body;
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      return sendError(res, 'Valid deposit amount is required.');
    }
    const result = await models.depositUserWallet(userId, num, payment_method || 'UPI');
    return sendSuccess(res, `🎉 Successfully deposited ${num} into your wallet!`, result);
  } catch (err) {
    return sendError(res, 'Failed to deposit money into wallet', err.message, 500);
  }
}

module.exports = {
  getDashboard,
  getPortfolio,
  getActivity,
  getProfile,
  updateAvatar,
  requestWithdrawal,
  getSupportMessages,
  sendSupportMessage,
  getBankAccounts,
  addBankAccount,
  setPrimaryBankAccount,
  claimGrowth,
  getWallet,
  depositWallet,
  handleToggleAutoReinvest,
  getLeaderboard
};
