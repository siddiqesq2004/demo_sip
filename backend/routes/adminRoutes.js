const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.post('/login', authController.loginAdmin);
router.get('/stats', authenticateAdmin, adminController.getAdminDashboard);
router.get('/users', authenticateAdmin, adminController.getAdminUsers);
router.get('/investments', authenticateAdmin, adminController.getAdminInvestments);

// Sub-Admins Management & Activity Logs
router.get('/subadmins', authenticateAdmin, adminController.getSubAdmins);
router.post('/subadmins', authenticateAdmin, adminController.createSubAdmin);
router.delete('/subadmins/:id', authenticateAdmin, adminController.deleteSubAdmin);
router.post('/subadmin/status', authenticateAdmin, adminController.updateSubAdminStatus);
router.get('/subadmin-logs', authenticateAdmin, adminController.getSubAdminLogs);

// Withdrawal Approval Workflow
router.get('/withdrawals', authenticateAdmin, adminController.getWithdrawals);
router.post('/withdrawals/approve', authenticateAdmin, adminController.approveWithdrawal);
router.post('/withdrawals/reject', authenticateAdmin, adminController.rejectWithdrawal);

// Live Support Chat Desk
router.get('/support/chats', authenticateAdmin, adminController.getSupportChats);
router.get('/support/messages/:chatId', authenticateAdmin, adminController.getSupportMessages);
router.post('/support/reply', authenticateAdmin, adminController.sendSupportReply);
router.post('/support/resolve', authenticateAdmin, adminController.resolveSupportChat);

// Market Rate Control
router.get('/market-rate', authenticateAdmin, adminController.getMarketRateAdmin);
router.post('/market-rate', authenticateAdmin, adminController.setMarketRateAdmin);

module.exports = router;
