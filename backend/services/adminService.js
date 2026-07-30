const bcrypt = require('bcryptjs');
const models = require('../models');

async function getAdminDashboardStats() {
  const users = await models.getAllUsersWithPortfolio();
  const investments = await models.getAllInvestmentsAdmin();
  const subadmins = await models.getAllSubAdmins();
  const withdrawals = await models.getAllWithdrawals();
  const supportChats = await models.getAllSupportChats();
  const logs = await models.getAllSubAdminLogs();

  let totalPlatformPortfolio = 0;
  let totalInvested = 0;

  users.forEach(u => {
    totalPlatformPortfolio += parseFloat(u.total_value || 0);
    totalInvested += parseFloat(u.invested_amount || 0);
  });

  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'PENDING_APPROVAL').length;
  const openSupportChatsCount = supportChats.filter(c => c.status === 'OPEN' || c.status === 'IN_CONVERSATION').length;

  return {
    total_users: users.length,
    active_investments_count: investments.filter(i => i.status === 'ACTIVE').length,
    total_platform_portfolio: totalPlatformPortfolio,
    total_invested_capital: totalInvested,
    subadmins_count: subadmins.length,
    pending_withdrawals_count: pendingWithdrawalsCount,
    open_support_chats_count: openSupportChatsCount,
    total_logs_count: logs.length,
    system_status: 'HEALTHY'
  };
}

async function getAdminUsersList() {
  const users = await models.getAllUsersWithPortfolio();
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    created_at: u.created_at,
    total_value: parseFloat(u.total_value || 0),
    invested_amount: parseFloat(u.invested_amount || 0),
    total_returns: parseFloat(u.total_returns || 0)
  }));
}

async function getAdminInvestmentsList() {
  const investments = await models.getAllInvestmentsAdmin();
  return investments.map(i => ({
    id: i.id,
    user_name: i.user_name,
    user_email: i.user_email,
    plan_name: i.plan_name,
    amount: parseFloat(i.amount),
    expected_returns: parseFloat(i.expected_returns),
    current_day: i.current_day,
    status: i.status,
    created_at: i.created_at
  }));
}

// --- Sub-Admin Service Methods ---
async function getAdminSubAdminsList() {
  const subadmins = await models.getAllSubAdmins();
  return subadmins.map(sa => {
    const raw = (sa.status || '').toUpperCase();
    const cleanStatus = (raw === 'BUSY' || raw === 'IN_WORK') ? raw : 'FREE';
    return {
      id: sa.id,
      name: sa.name,
      email: sa.email,
      role: sa.role || 'SUB_ADMIN',
      permissions: sa.permissions || 'ALL',
      status: cleanStatus,
      created_at: sa.created_at
    };
  });
}

async function createNewSubAdmin(name, email, password, role = 'SUB_ADMIN', permissions = 'ALL', creatorAdmin = 'Super Admin') {
  const existingUser = await models.findUserByEmail(email);
  const existingAdmin = await models.findAdminByEmail(email);
  if (existingUser || existingAdmin) {
    throw new Error('An account with this email address already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const subadminId = await models.createSubAdmin(name, email, hashedPassword, role, permissions);

  await models.createSubAdminLog(
    subadminId,
    name,
    'SUBADMIN_CREATED',
    `New Sub-Admin account created by ${creatorAdmin} with role [${role}]`
  );

  return { id: subadminId, name, email, role, permissions };
}

async function deleteSubAdminService(subadminId, creatorAdmin = 'Super Admin') {
  const subadmins = await models.getAllSubAdmins();
  const target = subadmins.find(s => Number(s.id) === Number(subadminId));
  if (!target) {
    throw new Error('Sub-Admin account not found.');
  }

  await models.deleteSubAdmin(subadminId);

  await models.createSubAdminLog(
    1,
    creatorAdmin,
    'SUBADMIN_DELETED',
    `Sub-Admin account "${target.name}" (${target.email}) was deleted by ${creatorAdmin}`
  );

  return { success: true, message: `Sub-Admin ${target.name} deleted successfully.` };
}

async function updateSubAdminStatusService(subadminId, status, adminEmail) {
  await models.updateSubAdminStatus(subadminId, status);

  // If sub-admin status becomes FREE, auto-assign waiting support chats to them ONLY IF they have support permissions!
  if (status === 'FREE') {
    const allSubadmins = await models.getAllSubAdmins();
    const currentSub = allSubadmins.find(s => (s.email || '').toLowerCase() === (adminEmail || '').toLowerCase() || Number(s.id) === Number(subadminId));
    
    if (currentSub) {
      const role = (currentSub.role || '').toUpperCase();
      const perm = (currentSub.permissions || '').toUpperCase();
      const isSupportQualified = (
        role === 'SUPPORT_AGENT' || 
        role === 'FULL_SUBADMIN' || 
        perm === 'SUPPORT_CHAT_ONLY' || 
        perm === 'ALL_PERMISSIONS' || 
        perm === 'ALL'
      );

      if (isSupportQualified) {
        const subName = currentSub.name;
        const chats = await models.getAllSupportChats();
        const allSubadmins = await models.getAllSubAdmins();

        for (const c of chats) {
          const isAwaiting = !c.subadmin_name || c.subadmin_name.toLowerCase().includes('awaiting');
          const isResolved = (c.status || '').toUpperCase() === 'RESOLVED';
          let assignedAgentFree = false;
          if (c.subadmin_id) {
            const currentAgent = allSubadmins.find(s => Number(s.id) === Number(c.subadmin_id));
            assignedAgentFree = currentAgent && (currentAgent.status || '').toUpperCase() === 'FREE';
          }

          if (isAwaiting || isResolved || !assignedAgentFree) {
            await models.assignSubAdminToSupportChat(c.id, currentSub.id, subName);
          }
        }
      }
    }
  }

  return { success: true, status };
}

async function getSubAdminActivityLogs() {
  const logs = await models.getAllSubAdminLogs();
  return logs.map(l => ({
    id: l.id,
    subadmin_id: l.subadmin_id,
    subadmin_name: l.subadmin_name,
    action_type: l.action_type,
    description: l.description,
    target_user_id: l.target_user_id,
    target_user_name: l.target_user_name,
    created_at: l.created_at
  }));
}

// --- Withdrawal Approval Workflow Service ---
async function getAdminWithdrawalsList(adminOrSubAdmin) {
  let withdrawals = await models.getAllWithdrawals();
  const isSuper = adminOrSubAdmin?.is_super_admin === true || adminOrSubAdmin?.role === 'SUPER_ADMIN' || adminOrSubAdmin?.admin_role === 'SUPER_ADMIN';

  if (!isSuper && adminOrSubAdmin) {
    const allSubadmins = await models.getAllSubAdmins();
    const currentSub = allSubadmins.find(s => (s.email || '').toLowerCase() === (adminOrSubAdmin.email || '').toLowerCase());
    const currentStatus = (currentSub?.status || 'FREE').toUpperCase();
    const subName = (adminOrSubAdmin?.name || currentSub?.name || '').toLowerCase();
    const subId = currentSub ? currentSub.id : adminOrSubAdmin?.id;

    // Rule: If BUSY or IN_WORK, sub-admin sees ONLY their previous/processed approvals
    // Hide new pending approval requests (new approvals will not come to them)
    if (currentStatus === 'BUSY' || currentStatus === 'IN_WORK') {
      withdrawals = withdrawals.filter(w => 
        (subId && Number(w.processed_by_subadmin_id) === Number(subId)) ||
        (w.processed_by_name && subName && w.processed_by_name.toLowerCase().includes(subName))
      );
    }
  }

  const allUsers = await models.getAllUsersWithPortfolio();
  return withdrawals.map(w => {
    const userObj = allUsers.find(u => Number(u.id) === Number(w.user_id));
    return {
      id: w.id,
      user_id: w.user_id,
      user_name: w.user_name || userObj?.name || 'Investor',
      user_email: w.user_email || userObj?.email || '',
      user_avatar: userObj?.avatar_url || null,
      amount: parseFloat(w.amount),
      bank_name: w.bank_name,
      account_no: w.account_no,
      ifsc: w.ifsc,
      remarks: w.remarks || 'Personal Savings',
      status: w.status,
      processed_by_name: w.processed_by_name || null,
      created_at: w.created_at,
      processed_at: w.processed_at || null
    };
  });
}

async function approveWithdrawalRequest(withdrawalId, adminOrSubAdmin) {
  const withdrawal = await models.getWithdrawalById(withdrawalId);
  if (!withdrawal) {
    throw new Error('Withdrawal request not found.');
  }
  if (withdrawal.status === 'APPROVED' || withdrawal.status === 'COMPLETED') {
    throw new Error('Withdrawal request has already been approved.');
  }

  const approverName = adminOrSubAdmin.name || 'Admin';
  const approverId = adminOrSubAdmin.id || 1;

  // Update Withdrawal Status
  await models.updateWithdrawalStatus(withdrawalId, 'APPROVED', approverId, approverName);

  // Debit Portfolio Returns
  const portfolio = await models.getPortfolioByUserId(withdrawal.user_id);
  if (portfolio) {
    const currentVal = parseFloat(portfolio.total_value || 0);
    const currentReturns = parseFloat(portfolio.total_returns || 0);
    const wAmount = parseFloat(withdrawal.amount);

    const newVal = Math.max(0, currentVal - wAmount);
    const newReturns = Math.max(0, currentReturns - wAmount);

    await models.updatePortfolio(withdrawal.user_id, newVal, portfolio.invested_amount, newReturns);
  }

  // Create Transaction Entry for User
  await models.createTransaction(
    withdrawal.user_id,
    'WITHDRAWAL',
    withdrawal.amount,
    `Withdrawal to ${withdrawal.bank_name} (${withdrawal.account_no}) - Approved by ${approverName}`
  );

  // Log Sub-Admin / Admin Activity
  await models.createSubAdminLog(
    approverId,
    approverName,
    'WITHDRAWAL_APPROVAL',
    `Approved payout of ₹${parseFloat(withdrawal.amount).toLocaleString()} to ${withdrawal.bank_name} for ${withdrawal.user_name || 'User'}`,
    withdrawal.user_id,
    withdrawal.user_name
  );

  return { success: true, message: `Withdrawal of ₹${withdrawal.amount} approved by ${approverName}` };
}

async function rejectWithdrawalRequest(withdrawalId, adminOrSubAdmin, reason = 'Verification requirements not met') {
  const withdrawal = await models.getWithdrawalById(withdrawalId);
  if (!withdrawal) {
    throw new Error('Withdrawal request not found.');
  }

  const approverName = adminOrSubAdmin.name || 'Admin';
  const approverId = adminOrSubAdmin.id || 1;

  await models.updateWithdrawalStatus(withdrawalId, 'REJECTED', approverId, approverName);

  await models.createSubAdminLog(
    approverId,
    approverName,
    'WITHDRAWAL_REJECTED',
    `Rejected withdrawal of ₹${parseFloat(withdrawal.amount).toLocaleString()} for ${withdrawal.user_name || 'User'}. Reason: ${reason}`,
    withdrawal.user_id,
    withdrawal.user_name
  );

  return { success: true, message: `Withdrawal request rejected by ${approverName}` };
}

// --- Live Support Desk Service ---
async function getAdminSupportChatsList(adminOrSubAdmin) {
  let chats = await models.getAllSupportChats();
  const allSubadmins = await models.getAllSubAdmins();
  const isSuper = adminOrSubAdmin?.is_super_admin === true || adminOrSubAdmin?.role === 'SUPER_ADMIN' || adminOrSubAdmin?.admin_role === 'SUPER_ADMIN';

  // Find free support agents
  const freeAgents = allSubadmins.filter(s => {
    const role = (s.role || '').toUpperCase();
    const perm = (s.permissions || '').toUpperCase();
    const status = (s.status || '').toUpperCase();
    const isSupportQualified = (
      role === 'SUPPORT_AGENT' || 
      role === 'FULL_SUBADMIN' || 
      perm === 'SUPPORT_CHAT_ONLY' || 
      perm === 'ALL_PERMISSIONS' || 
      perm === 'ALL'
    );
    return isSupportQualified && status === 'FREE';
  });

  // Auto-scan & assign unassigned / waiting chats to free support sub-admins
  for (let c of chats) {
    const isUnassigned = !c.subadmin_id || (c.subadmin_name || '').toLowerCase().includes('awaiting');
    if (isUnassigned && freeAgents.length > 0) {
      // Pick free agent with fewest chats
      let bestAgent = freeAgents[0];
      let minChats = Infinity;
      for (const agent of freeAgents) {
        const count = chats.filter(ch => Number(ch.subadmin_id) === Number(agent.id)).length;
        if (count < minChats) {
          minChats = count;
          bestAgent = agent;
        }
      }
      if (bestAgent) {
        await models.assignSubAdminToSupportChat(c.id, bestAgent.id, bestAgent.name);
        c.subadmin_id = bestAgent.id;
        c.subadmin_name = bestAgent.name;
        c.status = 'IN_CONVERSATION';
      }
    }
  }

  // Populate latest message & user details for each chat
  const users = await models.getAllUsersWithPortfolio();
  const enhancedChats = [];

  for (let c of chats) {
    const userObj = users.find(u => Number(u.id) === Number(c.user_id));
    const msgs = await models.getSupportMessages(c.id);
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    const latestTime = lastMsg ? lastMsg.created_at : c.created_at;

    enhancedChats.push({
      ...c,
      user_name: userObj ? userObj.name : (c.user_name || `User #${c.user_id}`),
      user_email: userObj ? userObj.email : (c.user_email || ''),
      user_avatar: userObj ? userObj.avatar_url : null,
      last_message: lastMsg ? lastMsg.text : c.initial_query,
      latest_activity: latestTime
    });
  }

  // Sort ALL chats by latest activity DESCENDING first
  enhancedChats.sort((a, b) => new Date(b.latest_activity || b.created_at).getTime() - new Date(a.latest_activity || a.created_at).getTime());

  // Deduplicate by user_name or user_id keeping the latest chat for each unique user name
  const userLatestChatMap = new Map();
  for (const c of enhancedChats) {
    const key = (c.user_name || `user_${c.user_id}`).toLowerCase().trim();
    if (!userLatestChatMap.has(key)) {
      userLatestChatMap.set(key, c);
    }
  }
  const deduplicatedChats = Array.from(userLatestChatMap.values());

  // Super Admin can see ALL live conversations across all sub-admins and users
  if (isSuper) {
    enhancedChats.sort((a, b) => new Date(b.latest_activity || b.created_at).getTime() - new Date(a.latest_activity || a.created_at).getTime());
    const superMap = new Map();
    for (const c of enhancedChats) {
      const key = (c.user_name || `user_${c.user_id}`).toLowerCase().trim();
      if (!superMap.has(key)) {
        superMap.set(key, c);
      }
    }
    return Array.from(superMap.values());
  }

  const currentSub = allSubadmins.find(s => 
    (s.email || '').toLowerCase() === (adminOrSubAdmin?.email || '').toLowerCase() ||
    (s.name || '').toLowerCase() === (adminOrSubAdmin?.name || '').toLowerCase() ||
    (s.id && Number(s.id) === Number(adminOrSubAdmin?.id))
  );

  const currentStatus = (currentSub?.status || adminOrSubAdmin?.status || 'FREE').toUpperCase();
  const subName = (currentSub?.name || adminOrSubAdmin?.name || '').toLowerCase().trim();
  const subId = currentSub ? currentSub.id : adminOrSubAdmin?.id;

  const filtered = [];

  for (const c of enhancedChats) {
    const assignedName = (c.subadmin_name || '').toLowerCase().trim();
    const assignedId = c.subadmin_id ? Number(c.subadmin_id) : null;

    const msgs = await models.getSupportMessages(c.id);
    const wasHandledByMe = msgs.some(m => m.sender_name && subName && m.sender_name.toLowerCase().includes(subName));

    const isAssignedToMe = (!assignedName.includes('awaiting')) && (
      (subId && assignedId && Number(subId) === Number(assignedId)) ||
      (subName && assignedName && (assignedName.includes(subName) || subName.includes(assignedName))) ||
      wasHandledByMe
    );

    const isUnassigned = !c.subadmin_name || assignedName.includes('awaiting');

    // Rule:
    // If BUSY / IN_WORK: Sub-admin sees ALL their assigned / previous chats. New unassigned chats will not come.
    // If FREE: Sub-admin sees assigned chats + unassigned chats.
    if (currentStatus === 'BUSY' || currentStatus === 'IN_WORK') {
      if (isAssignedToMe) {
        filtered.push(c);
      }
    } else {
      if (isAssignedToMe || isUnassigned) {
        filtered.push(c);
      }
    }
  }

  // Sort latest activity DESCENDING so newest messages/requests appear at the VERY TOP
  filtered.sort((a, b) => new Date(b.latest_activity || b.created_at).getTime() - new Date(a.latest_activity || a.created_at).getTime());

  // Deduplicate per sub-admin so each user appears once in their column box
  const userMap = new Map();
  for (const c of filtered) {
    const key = (c.user_name || `user_${c.user_id}`).toLowerCase().trim();
    if (!userMap.has(key)) {
      userMap.set(key, c);
    }
  }

  return Array.from(userMap.values());
}

async function getSupportChatMessagesList(chatId) {
  return await models.getSupportMessages(chatId);
}

async function sendAdminSupportReply(chatId, text, adminOrSubAdmin) {
  const approverName = `${adminOrSubAdmin.name} (${adminOrSubAdmin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Sub-Admin'})`;
  const approverId = adminOrSubAdmin.id || 1;

  // Create Message
  const msgId = await models.createSupportMessage(chatId, 'subadmin', approverName, text);

  // Assign Sub-Admin to Chat
  await models.assignSubAdminToSupportChat(chatId, approverId, adminOrSubAdmin.name);

  // Log Sub-Admin Activity
  await models.createSubAdminLog(
    approverId,
    adminOrSubAdmin.name,
    'SUPPORT_CHAT_REPLY',
    `Replied to Support Chat #${chatId}: "${text.substring(0, 50)}..."`
  );

  return { id: msgId, text, sender_name: approverName, created_at: new Date().toISOString() };
}

async function resolveSupportChatService(chatId, adminOrSubAdmin) {
  const approverName = adminOrSubAdmin?.name || 'Sub-Admin';
  const approverId = adminOrSubAdmin?.id || 1;

  // Mark Chat as RESOLVED
  await models.resolveSupportChat(chatId, approverId, approverName);

  // Post resolution message
  await models.createSupportMessage(
    chatId,
    'subadmin',
    `${approverName} (Sub-Admin)`,
    `✅ Support Ticket has been marked as RESOLVED by ${approverName}. Feel free to send a new message anytime if you need further help!`
  );

  // Log Sub-Admin Activity
  await models.createSubAdminLog(
    approverId,
    approverName,
    'SUPPORT_CHAT_RESOLVE',
    `Marked Support Ticket #${chatId} as RESOLVED`
  );

  return { success: true, message: 'Ticket marked as RESOLVED' };
}

module.exports = {
  getAdminDashboardStats,
  getAdminUsersList,
  getAdminInvestmentsList,
  getAdminSubAdminsList,
  createNewSubAdmin,
  deleteSubAdminService,
  updateSubAdminStatusService,
  getSubAdminActivityLogs,
  getAdminWithdrawalsList,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  getAdminSupportChatsList,
  getSupportChatMessagesList,
  sendAdminSupportReply,
  resolveSupportChatService
};
