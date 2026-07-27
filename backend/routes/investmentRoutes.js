const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/plans', investmentController.getPlans);
router.post('/invest', authenticateUser, investmentController.createInvestment);

module.exports = router;
