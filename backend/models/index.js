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
  return rows.length > 0 ? rows[0] : null;
}

async function updatePortfolio(userId, totalValue, investedAmount, totalReturns) {
  const existing = await getPortfolioByUserId(userId);
  if (existing) {
    await query(
      'UPDATE portfolio SET total_value = ?, invested_amount = ?, total_returns = ? WHERE user_id = ?',
      [totalValue, investedAmount, totalReturns, userId]
    );
  } else {
    await query(
      'INSERT INTO portfolio (user_id, total_value, invested_amount, total_returns) VALUES (?, ?, ?, ?)',
      [userId, totalValue, investedAmount, totalReturns]
    );
  }
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
  return res.insertId;
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
            COALESCE(p.total_returns, 0) as total_returns 
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
  getAllPlans,
  getPlanById,
  getInvestmentsByUserId,
  getActiveInvestmentByUserId,
  createInvestment,
  createWithdrawalRequest,
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
