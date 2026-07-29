const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/dashboard', authenticateUser, userController.getDashboard);
router.get('/portfolio', authenticateUser, userController.getPortfolio);
router.get('/activity', authenticateUser, userController.getActivity);
router.get('/profile', authenticateUser, userController.getProfile);
router.post('/withdraw', authenticateUser, userController.requestWithdrawal);

// Support Chat Endpoints
router.get('/support/messages', authenticateUser, userController.getSupportMessages);
router.post('/support/message', authenticateUser, userController.sendSupportMessage);

// Growth Claim & Streaks Endpoints
router.post('/claim-growth', authenticateUser, userController.claimGrowth);
router.get('/wallet', authenticateUser, userController.getWallet);
router.post('/wallet/deposit', authenticateUser, userController.depositWallet);
router.post('/wallet/auto-reinvest', authenticateUser, userController.handleToggleAutoReinvest);
router.get('/leaderboard', authenticateUser, userController.getLeaderboard);

// Bank Accounts Endpoints
router.get('/bank-accounts', authenticateUser, userController.getBankAccounts);
router.post('/bank-accounts', authenticateUser, userController.addBankAccount);
router.put('/bank-accounts/primary', authenticateUser, userController.setPrimaryBankAccount);

module.exports = router;
