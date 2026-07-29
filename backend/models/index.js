const { query } = require('../config/db');

// --- User & Admin Auth Models ---
async function findUserByEmail(email) {
  const [rows] = await query('SELECT * FROM users WHERE email = ?', [email]);
  return rows.length > 0 ? rows[0] : null;
}

async function findUserById(id) {
  const [rows] = await query('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]);
  return rows.length > 0 ? rows[0] : null;
}

async function findAdminByEmail(email) {
  // Check in super admins
  const [adminRows] = await query('SELECT * FROM admins WHERE email = ?', [email]);
  if (adminRows.length > 0) {
    return { ...adminRows[0], is_super_admin: true, role: 'SUPER_ADMIN' };
  }
  // Check in subadmins
  const [subRows] = await query('SELECT * FROM subadmins WHERE email = ?', [email]);
  if (subRows.length > 0) {
    return { ...subRows[0], is_super_admin: false, role: subRows[0].role || 'SUB_ADMIN' };
  }
  return null;
}

// --- Sub-Admin Models ---
async function getAllSubAdmins() {
  const [rows] = await query('SELECT * FROM subadmins ORDER BY id DESC');
  return rows;
}

async function updateSubAdminStatus(subadminId, status) {
  await query('UPDATE subadmins SET status = ? WHERE id = ?', [status, subadminId]);
}

async function createSubAdmin(name, email, password, role = 'SUB_ADMIN', permissions = 'ALL') {
  const [res] = await query(
    'INSERT INTO subadmins (name, email, password, role, permissions, status) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, password, role, permissions, 'FREE']
  );
  return res.insertId;
}

async function deleteSubAdmin(subadminId) {
  const [res] = await query('DELETE FROM subadmins WHERE id = ?', [subadminId]);
  return res;
}

async function createSubAdminLog(subadminId, subadminName, actionType, description, targetUserId = null, targetUserName = null) {
  const [res] = await query(
    `INSERT INTO subadmin_logs (subadmin_id, subadmin_name, action_type, description, target_user_id, target_user_name, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [subadminId, subadminName, actionType, description, targetUserId, targetUserName, new Date().toISOString().replace('T', ' ').substring(0, 19)]
  );
  return res.insertId;
}

async function getAllSubAdminLogs() {
  const [rows] = await query('SELECT * FROM subadmin_logs ORDER BY id DESC');
  return rows;
}

// --- Portfolio Model ---
async function getPortfolioByUserId(userId) {
  const [rows] = await query('SELECT * FROM portfolio WHERE user_id = ?', [userId]);
  if (rows.length === 0) return null;
  
  const p = rows[0];
  return {
    ...p,
    available_cash: p.available_cash !== undefined ? p.available_cash : 2420.00,
    unclaimed_amount: p.unclaimed_amount !== undefined ? p.unclaimed_amount : 42.00,
    unclaimed_count: p.unclaimed_count !== undefined ? p.unclaimed_count : 1,
    streak_count: p.streak_count !== undefined ? p.streak_count : 18,
    auto_reinvest: p.auto_reinvest !== undefined ? p.auto_reinvest : 1,
    unclaimed_days: p.unclaimed_days ? (typeof p.unclaimed_days === 'string' ? JSON.parse(p.unclaimed_days) : p.unclaimed_days) : [
      { day: 'Monday', amount: 42.00, date: '2026-07-27' }
    ]
  };
}

async function updatePortfolio(userId, totalValue, investedAmount, totalReturns, extra = {}) {
  const existing = await getPortfolioByUserId(userId);
  if (existing) {
    const availableCash = extra.available_cash !== undefined ? extra.available_cash : existing.available_cash;
    const unclaimedAmount = extra.unclaimed_amount !== undefined ? extra.unclaimed_amount : existing.unclaimed_amount;
    const unclaimedCount = extra.unclaimed_count !== undefined ? extra.unclaimed_count : existing.unclaimed_count;
    const streakCount = extra.streak_count !== undefined ? extra.streak_count : existing.streak_count;
    const autoReinvest = extra.auto_reinvest !== undefined ? extra.auto_reinvest : existing.auto_reinvest;
    const unclaimedDays = extra.unclaimed_days ? JSON.stringify(extra.unclaimed_days) : JSON.stringify(existing.unclaimed_days || []);

    await query(
      `UPDATE portfolio 
       SET total_value = ?, invested_amount = ?, total_returns = ?, available_cash = ?, unclaimed_amount = ?, unclaimed_count = ?, streak_count = ?, auto_reinvest = ?, unclaimed_days = ?
       WHERE user_id = ?`,
      [totalValue, investedAmount, totalReturns, availableCash, unclaimedAmount, unclaimedCount, streakCount, autoReinvest, unclaimedDays, userId]
    );
  } else {
    await query(
      `INSERT INTO portfolio (user_id, total_value, invested_amount, total_returns, available_cash, unclaimed_amount, unclaimed_count, streak_count, auto_reinvest, unclaimed_days)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, totalValue, investedAmount, totalReturns, 2420.00, 42.00, 1, 18, 1, JSON.stringify([{ day: 'Monday', amount: 42.00, date: '2026-07-27' }])]
    );
  }
}

async function claimUserGrowth(userId) {
  const portfolio = await getPortfolioByUserId(userId);
  if (!portfolio || !portfolio.unclaimed_amount || portfolio.unclaimed_amount <= 0) {
    return { claimed: false, message: 'No pending growth rewards to claim' };
  }

  const claimAmt = parseFloat(portfolio.unclaimed_amount);
  const newTotalVal = parseFloat(portfolio.total_value) + claimAmt;
  const newTotalRet = parseFloat(portfolio.total_returns) + claimAmt;
  const newAvailable = parseFloat(portfolio.available_cash) + claimAmt;
  const newStreak = parseInt(portfolio.streak_count || 17) + 1;

  await updatePortfolio(userId, newTotalVal, portfolio.invested_amount, newTotalRet, {
    available_cash: newAvailable,
    unclaimed_amount: 0.00,
    unclaimed_count: 0,
    streak_count: newStreak,
    unclaimed_days: []
  });

  // Log transaction
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  await createTransaction(userId, 'CREDIT', claimAmt, `🌱 Growth Claimed (+₹${claimAmt.toFixed(0)})`, 'COMPLETED');

  return {
    claimed: true,
    claimed_amount: claimAmt,
    new_total_value: newTotalVal,
    new_available_cash: newAvailable,
    new_streak: newStreak
  };
}

async function toggleAutoReinvest(userId, status) {
  const portfolio = await getPortfolioByUserId(userId);
  if (!portfolio) return false;

  await query('UPDATE portfolio SET auto_reinvest = ? WHERE user_id = ?', [status ? 1 : 0, userId]);
  return true;
}

async function getLeaderboardData() {
  let users = await getAllUsersWithPortfolio();
  
  if (!users || users.length === 0) {
    users = [
      { id: 1, name: 'Anish P', email: 'anishp@email.com', invested_amount: 106510, total_returns: 18920, streak_count: 18, referral_count: 12 },
      { id: 2, name: 'Rahul Verma', email: 'rahul.v@email.com', invested_amount: 175000, total_returns: 35000, streak_count: 15, referral_count: 8 },
      { id: 3, name: 'Priya Sharma', email: 'priya.sharma@email.com', invested_amount: 70000, total_returns: 15000, streak_count: 12, referral_count: 6 },
      { id: 4, name: 'Vikram Malhotra', email: 'vikram.m@email.com', invested_amount: 290000, total_returns: 60000, streak_count: 10, referral_count: 5 },
      { id: 5, name: 'Sneha Patel', email: 'sneha.patel@email.com', invested_amount: 38000, total_returns: 7500, streak_count: 8, referral_count: 4 },
      { id: 6, name: 'Ananya Rao', email: 'ananya.rao@email.com', invested_amount: 125000, total_returns: 25000, streak_count: 6, referral_count: 3 }
    ];
  }

  const leaderboard = users.map((u, idx) => {
    const streak = u.streak_count || (18 - idx * 2 > 1 ? 18 - idx * 2 : 2);
    const referrals = u.referral_count || (14 - idx * 2 > 0 ? 14 - idx * 2 : 1);
    return {
      user_id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.name.charAt(0).toUpperCase(),
      total_invested: parseFloat(u.invested_amount || 0),
      total_returns: parseFloat(u.total_returns || 0),
      streak_count: streak,
      referral_count: referrals,
      rank: idx + 1
    };
  });

  const streakLeaderboard = [...leaderboard].sort((a, b) => b.streak_count - a.streak_count).map((item, index) => ({ ...item, rank: index + 1 }));
  const referralLeaderboard = [...leaderboard].sort((a, b) => b.referral_count - a.referral_count).map((item, index) => ({ ...item, rank: index + 1 }));

  return {
    by_streaks: streakLeaderboard,
    by_referrals: referralLeaderboard
  };
}

// --- Plans Model ---
async function getAllPlans() {
  const [rows] = await query('SELECT * FROM plans ORDER BY id ASC');
  return rows;
}

async function getPlanById(id) {
  const [rows] = await query('SELECT * FROM plans WHERE id = ?', [id]);
  return rows.length > 0 ? rows[0] : null;
}

// --- Investments Model ---
async function getInvestmentsByUserId(userId) {
  const [rows] = await query(
    `SELECT i.*, p.name as plan_name, p.duration_days, p.return_percentage 
     FROM investments i 
     JOIN plans p ON i.plan_id = p.id 
     WHERE i.user_id = ? 
     ORDER BY i.id DESC`,
    [userId]
  );
  return rows;
}

async function getActiveInvestmentByUserId(userId) {
  const [rows] = await query(
    `SELECT i.*, p.name as plan_name, p.duration_days, p.return_percentage 
     FROM investments i 
     JOIN plans p ON i.plan_id = p.id 
     WHERE i.user_id = ? AND i.status = 'ACTIVE' 
     ORDER BY i.id DESC LIMIT 1`,
    [userId]
  );
  return rows.length > 0 ? rows[0] : null;
}

async function createInvestment(userId, planId, amount, expectedReturns) {
  const [res] = await query(
    `INSERT INTO investments (user_id, plan_id, amount, expected_returns, current_day, status)
     VALUES (?, ?, ?, ?, 1, 'ACTIVE')`,
    [userId, planId, amount, expectedReturns]
  );
  return res.insertId;
}

// --- Withdrawals Workflow Model ---
async function createWithdrawalRequest(userId, amount, bankName, accountNo, ifsc, remarks = 'Personal Savings') {
  const [res] = await query(
    `INSERT INTO withdrawals (user_id, amount, bank_name, account_no, ifsc, remarks, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, amount, bankName, accountNo, ifsc, remarks, 'PENDING_APPROVAL', new Date().toISOString().replace('T', ' ').substring(0, 19)]
  );

  // Deduct from portfolio total_value & available_cash
  const portfolio = await getPortfolioByUserId(userId);
  if (portfolio) {
    const newTotal = Math.max(0, parseFloat(portfolio.total_value || 118930) - amount);
    const newAvailable = Math.max(0, parseFloat(portfolio.available_cash || 2420) - amount);
    await updatePortfolio(userId, newTotal, portfolio.invested_amount, portfolio.total_returns, {
      available_cash: newAvailable
    });
  }

  // Log debit transaction
  await createTransaction(userId, 'DEBIT', -amount, `Withdrawal to ${bankName} (${remarks})`, 'PENDING_APPROVAL');

  return res.insertId;
}

async function depositUserWallet(userId, amount, paymentMethod = 'UPI') {
  let portfolio = await getPortfolioByUserId(userId);
  if (!portfolio) {
    await updatePortfolio(userId, 118930 + amount, 116510, 18920, { available_cash: 2420 + amount });
  } else {
    const currentTotal = parseFloat(portfolio.total_value || 118930);
    const currentAvailable = parseFloat(portfolio.available_cash || 2420);
    const currentInvested = parseFloat(portfolio.invested_amount || 116510);

    const newTotalVal = currentTotal + amount;
    const newAvailable = currentAvailable + amount;

    await updatePortfolio(userId, newTotalVal, currentInvested, portfolio.total_returns || 18920, {
      available_cash: newAvailable
    });
  }

  const updatedPortfolio = await getPortfolioByUserId(userId);

  // Log deposit transaction
  await createTransaction(userId, 'CREDIT', amount, `Added Money via ${paymentMethod}`, 'COMPLETED');

  return {
    deposited: true,
    amount: amount,
    new_total_value: updatedPortfolio ? parseFloat(updatedPortfolio.total_value) : 118930 + amount,
    new_available_cash: updatedPortfolio ? parseFloat(updatedPortfolio.available_cash) : 2420 + amount
  };
}

async function getAllWithdrawals() {
  const [rows] = await query('SELECT * FROM withdrawals ORDER BY id DESC');
  return rows;
}

async function getWithdrawalById(id) {
  const [rows] = await query('SELECT * FROM withdrawals WHERE id = ?', [id]);
  return rows.length > 0 ? rows[0] : null;
}

async function getUserWithdrawals(userId) {
  const [rows] = await query('SELECT * FROM withdrawals WHERE user_id = ? ORDER BY id DESC', [userId]);
  return rows;
}

async function updateWithdrawalStatus(withdrawalId, status, subadminId, subadminName) {
  await query(
    'UPDATE withdrawals SET status = ?, processed_by_subadmin_id = ?, processed_by_name = ?, processed_at = ? WHERE id = ?',
    [status, subadminId, subadminName, new Date().toISOString().replace('T', ' ').substring(0, 19), withdrawalId]
  );
}

// --- Support Chat Desk Model ---
async function getAllSupportChats() {
  const [rows] = await query('SELECT * FROM support_chats ORDER BY id DESC');
  return rows;
}

async function getUserSupportChat(userId) {
  const [rows] = await query('SELECT * FROM support_chats WHERE user_id = ? ORDER BY id DESC', [userId]);
  return rows;
}

async function createSupportChat(userId, initialQuery, subadminId = null, subadminName = 'Awaiting Free Official') {
  const status = (subadminId || (subadminName && !subadminName.includes('Awaiting'))) ? 'IN_CONVERSATION' : 'OPEN';
  const [res] = await query(
    `INSERT INTO support_chats (user_id, initial_query, subadmin_id, subadmin_name, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, initialQuery, subadminId, subadminName, status, new Date().toISOString().replace('T', ' ').substring(0, 19)]
  );
  return res.insertId;
}

async function getSupportMessages(chatId) {
  const [rows] = await query('SELECT * FROM support_messages WHERE chat_id = ? ORDER BY id ASC', [chatId]);
  return rows;
}

async function createSupportMessage(chatId, senderType, senderName, text) {
  const [res] = await query(
    `INSERT INTO support_messages (chat_id, sender_type, sender_name, text, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [chatId, senderType, senderName, text, new Date().toISOString().replace('T', ' ').substring(0, 19)]
  );
  return res.insertId;
}

async function assignSubAdminToSupportChat(chatId, subadminId, subadminName) {
  await query(
    'UPDATE support_chats SET subadmin_id = ?, subadmin_name = ?, status = ? WHERE id = ?',
    [subadminId, subadminName, 'IN_CONVERSATION', chatId]
  );
}

async function resolveSupportChat(chatId, subadminId, subadminName) {
  await query(
    'UPDATE support_chats SET subadmin_id = ?, subadmin_name = ?, status = ? WHERE id = ?',
    [subadminId, subadminName, 'RESOLVED', chatId]
  );
}

// --- Transactions Model ---
async function getTransactionsByUserId(userId) {
  const [rows] = await query(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC',
    [userId]
  );
  return rows;
}

async function createTransaction(userId, type, amount, description, status = 'COMPLETED') {
  const [res] = await query(
    'INSERT INTO transactions (user_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?)',
    [userId, type, amount, description, status]
  );
  return res.insertId;
}

// --- Admin Queries ---
async function getAllUsersWithPortfolio() {
  const [rows] = await query(
    `SELECT u.id, u.name, u.email, u.created_at, 
            COALESCE(p.total_value, 0) as total_value, 
            COALESCE(p.invested_amount, 0) as invested_amount, 
            COALESCE(p.total_returns, 0) as total_returns,
            COALESCE(p.streak_count, 18) as streak_count,
            COALESCE(p.referral_count, 12) as referral_count
     FROM users u 
     LEFT JOIN portfolio p ON u.id = p.user_id 
     ORDER BY u.id ASC`
  );
  return rows;
}

async function getAllInvestmentsAdmin() {
  const [rows] = await query(
    `SELECT i.*, u.name as user_name, u.email as user_email, p.name as plan_name 
     FROM investments i 
     JOIN users u ON i.user_id = u.id 
     JOIN plans p ON i.plan_id = p.id 
     ORDER BY i.id DESC`
  );
  return rows;
}

// --- Bank Accounts Model ---
async function getUserBankAccounts(userId) {
  const [rows] = await query('SELECT * FROM bank_accounts WHERE user_id = ? ORDER BY is_primary DESC, id ASC', [userId]);
  return rows;
}

async function createUserBankAccount(userId, name, accNo, ifsc, isPrimary = 0) {
  const [res] = await query(
    'INSERT INTO bank_accounts (user_id, name, acc_no, ifsc, is_primary) VALUES (?, ?, ?, ?, ?)',
    [userId, name, accNo, ifsc, isPrimary]
  );
  return res.insertId;
}

async function setUserPrimaryBankAccount(userId, bankAccountId) {
  await query('UPDATE bank_accounts SET is_primary = 0 WHERE user_id = ?', [userId]);
  await query('UPDATE bank_accounts SET is_primary = 1 WHERE id = ? AND user_id = ?', [bankAccountId, userId]);
  return true;
}

module.exports = {
  findUserByEmail,
  findUserById,
  findAdminByEmail,
  getAllSubAdmins,
  updateSubAdminStatus,
  createSubAdmin,
  deleteSubAdmin,
  createSubAdminLog,
  getAllSubAdminLogs,
  getPortfolioByUserId,
  updatePortfolio,
  claimUserGrowth,
  toggleAutoReinvest,
  getLeaderboardData,
  getAllPlans,
  getPlanById,
  getInvestmentsByUserId,
  getActiveInvestmentByUserId,
  createInvestment,
  createWithdrawalRequest,
  depositUserWallet,
  getUserWithdrawals,
  getAllWithdrawals,
  getWithdrawalById,
  updateWithdrawalStatus,
  getAllSupportChats,
  getUserSupportChat,
  createSupportChat,
  getSupportMessages,
  createSupportMessage,
  assignSubAdminToSupportChat,
  resolveSupportChat,
  getTransactionsByUserId,
  createTransaction,
  getAllUsersWithPortfolio,
  getAllInvestmentsAdmin,
  getUserBankAccounts,
  createUserBankAccount,
  setUserPrimaryBankAccount
};
