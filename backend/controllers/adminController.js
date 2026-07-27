const adminService = require('../services/adminService');
const models = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHandler');

async function getAdminDashboard(req, res) {
  try {
    const stats = await adminService.getAdminDashboardStats();
    return sendSuccess(res, 'Admin stats retrieved successfully', stats);
  } catch (err) {
    return sendError(res, 'Failed to fetch admin stats', err.message, 500);
  }
}

async function getAdminUsers(req, res) {
  try {
    const users = await adminService.getAdminUsersList();
    return sendSuccess(res, 'Users list retrieved successfully', { users });
  } catch (err) {
    return sendError(res, 'Failed to fetch users list', err.message, 500);
  }
}

async function getAdminInvestments(req, res) {
  try {
    const investments = await adminService.getAdminInvestmentsList();
    return sendSuccess(res, 'Investments list retrieved successfully', { investments });
  } catch (err) {
    return sendError(res, 'Failed to fetch investments list', err.message, 500);
  }
}

// --- Sub-Admin Controllers ---
async function getSubAdmins(req, res) {
  try {
    const subadmins = await adminService.getAdminSubAdminsList();
    return sendSuccess(res, 'Sub-admins list retrieved successfully', { subadmins });
  } catch (err) {
    return sendError(res, 'Failed to fetch sub-admins list', err.message, 500);
  }
}

async function createSubAdmin(req, res) {
  try {
    const { name, email, password, role, permissions } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required.');
    }
    const creatorName = req.admin ? req.admin.name : 'Super Admin';
    const subadmin = await adminService.createNewSubAdmin(name, email, password, role, permissions, creatorName);
    return sendSuccess(res, 'Sub-admin account created successfully', { subadmin });
  } catch (err) {
    return sendError(res, err.message || 'Failed to create sub-admin account', err.message, 400);
  }
}

async function deleteSubAdmin(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return sendError(res, 'Sub-admin ID is required.', null, 400);
    }
    const creatorName = req.admin?.name || 'Super Admin';
    const result = await adminService.deleteSubAdminService(id, creatorName);
    return sendSuccess(res, 'Sub-admin deleted successfully', result);
  } catch (err) {
    return sendError(res, err.message || 'Failed to delete sub-admin', err.message, 500);
  }
}

async function updateSubAdminStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) {
      return sendError(res, 'Status is required.');
    }
    const adminEmail = req.admin?.email;
    const allSub = await models.getAllSubAdmins();
    const targetSub = allSub.find(s => (s.email || '').toLowerCase() === (adminEmail || '').toLowerCase());
    const subadminId = targetSub ? targetSub.id : req.admin?.id;
    if (!subadminId) {
      return sendError(res, 'Sub-admin ID missing in token.', null, 400);
    }
    const result = await adminService.updateSubAdminStatusService(subadminId, status, adminEmail);
    return sendSuccess(res, 'Sub-admin status updated successfully', result);
  } catch (err) {
    return sendError(res, 'Failed to update sub-admin status', err.message, 500);
  }
}

async function getSubAdminLogs(req, res) {
  try {
    const logs = await adminService.getSubAdminActivityLogs();
    return sendSuccess(res, 'Sub-admin activity logs retrieved successfully', { logs });
  } catch (err) {
    return sendError(res, 'Failed to fetch sub-admin activity logs', err.message, 500);
  }
}

// --- Withdrawal Approval Controllers ---
async function getWithdrawals(req, res) {
  try {
    const isSuper = req.admin?.role === 'SUPER_ADMIN' || req.admin?.admin_role === 'SUPER_ADMIN' || req.admin?.is_super_admin === true;
    const isWithdrawalApprover = req.admin?.role === 'WITHDRAWAL_APPROVER' || req.admin?.admin_role === 'WITHDRAWAL_APPROVER' || req.admin?.permissions === 'WITHDRAWALS_ONLY' || req.admin?.permissions === 'ALL_PERMISSIONS' || req.admin?.permissions === 'ALL';
    if (!isSuper && !isWithdrawalApprover) {
      return sendError(res, 'Access denied. You do not have permissions to view withdrawals.', null, 403);
    }
    const withdrawals = await adminService.getAdminWithdrawalsList(req.admin);
    return sendSuccess(res, 'Withdrawals list retrieved successfully', { withdrawals });
  } catch (err) {
    return sendError(res, 'Failed to fetch withdrawals list', err.message, 500);
  }
}

async function approveWithdrawal(req, res) {
  try {
    const { withdrawal_id } = req.body;
    if (!withdrawal_id) {
      return sendError(res, 'withdrawal_id is required.');
    }
    const isSuper = req.admin?.role === 'SUPER_ADMIN' || req.admin?.admin_role === 'SUPER_ADMIN' || req.admin?.is_super_admin === true;
    const isWithdrawalApprover = req.admin?.role === 'WITHDRAWAL_APPROVER' || req.admin?.admin_role === 'WITHDRAWAL_APPROVER' || req.admin?.permissions === 'WITHDRAWALS_ONLY' || req.admin?.permissions === 'ALL_PERMISSIONS' || req.admin?.permissions === 'ALL';
    if (!isSuper && !isWithdrawalApprover) {
      return sendError(res, 'Access denied. You do not have permissions to approve withdrawals.', null, 403);
    }
    const adminOrSubAdmin = req.admin || { id: 1, name: 'Super Admin', role: 'SUPER_ADMIN' };
    const result = await adminService.approveWithdrawalRequest(withdrawal_id, adminOrSubAdmin);
    return sendSuccess(res, result.message, result);
  } catch (err) {
    return sendError(res, err.message || 'Failed to approve withdrawal', err.message, 400);
  }
}

async function rejectWithdrawal(req, res) {
  try {
    const { withdrawal_id, reason } = req.body;
    if (!withdrawal_id) {
      return sendError(res, 'withdrawal_id is required.');
    }
    const isSuper = req.admin?.role === 'SUPER_ADMIN' || req.admin?.admin_role === 'SUPER_ADMIN' || req.admin?.is_super_admin === true;
    const isWithdrawalApprover = req.admin?.role === 'WITHDRAWAL_APPROVER' || req.admin?.admin_role === 'WITHDRAWAL_APPROVER' || req.admin?.permissions === 'WITHDRAWALS_ONLY' || req.admin?.permissions === 'ALL_PERMISSIONS' || req.admin?.permissions === 'ALL';
    if (!isSuper && !isWithdrawalApprover) {
      return sendError(res, 'Access denied. You do not have permissions to reject withdrawals.', null, 403);
    }
    const adminOrSubAdmin = req.admin || { id: 1, name: 'Super Admin', role: 'SUPER_ADMIN' };
    const result = await adminService.rejectWithdrawalRequest(withdrawal_id, adminOrSubAdmin, reason);
    return sendSuccess(res, result.message, result);
  } catch (err) {
    return sendError(res, err.message || 'Failed to reject withdrawal', err.message, 400);
  }
}

// --- Support Chat Controllers ---
async function getSupportChats(req, res) {
  try {
    const adminOrSubAdmin = req.admin || { name: 'Neha Gupta', role: 'SUPPORT_AGENT' };
    const chats = await adminService.getAdminSupportChatsList(adminOrSubAdmin);
    return sendSuccess(res, 'Support chats list retrieved successfully', { chats });
  } catch (err) {
    return sendError(res, 'Failed to fetch support chats list', err.message, 500);
  }
}

async function getSupportMessages(req, res) {
  try {
    const { chatId } = req.params;
    const messages = await adminService.getSupportChatMessagesList(chatId);
    return sendSuccess(res, 'Support messages retrieved successfully', { messages });
  } catch (err) {
    return sendError(res, 'Failed to fetch support messages', err.message, 500);
  }
}

async function sendSupportReply(req, res) {
  try {
    const { chat_id, text } = req.body;
    if (!chat_id || !text) {
      return sendError(res, 'chat_id and text are required.');
    }
    const adminOrSubAdmin = req.admin || { id: 1, name: 'Support Agent', role: 'SUB_ADMIN' };
    const reply = await adminService.sendAdminSupportReply(chat_id, text, adminOrSubAdmin);
    return sendSuccess(res, 'Support reply sent successfully', { reply });
  } catch (err) {
    return sendError(res, 'Failed to send support reply', err.message, 500);
  }
}

async function resolveSupportChat(req, res) {
  try {
    const { chat_id } = req.body;
    if (!chat_id) {
      return sendError(res, 'chat_id is required.');
    }
    const adminOrSubAdmin = req.admin || { id: 1, name: 'Support Agent', role: 'SUB_ADMIN' };
    const result = await adminService.resolveSupportChatService(chat_id, adminOrSubAdmin);
    return sendSuccess(res, 'Support ticket resolved successfully', result);
  } catch (err) {
    return sendError(res, 'Failed to resolve support chat', err.message, 500);
  }
}

module.exports = {
  getAdminDashboard,
  getAdminUsers,
  getAdminInvestments,
  getSubAdmins,
  createSubAdmin,
  deleteSubAdmin,
  updateSubAdminStatus,
  getSubAdminLogs,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getSupportChats,
  getSupportMessages,
  sendSupportReply,
  resolveSupportChat
};
