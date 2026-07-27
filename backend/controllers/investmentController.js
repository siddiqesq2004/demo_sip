const investmentService = require('../services/investmentService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

async function getPlans(req, res) {
  try {
    const plans = await investmentService.getAvailablePlans();
    return sendSuccess(res, 'Investment plans retrieved successfully', { plans });
  } catch (err) {
    return sendError(res, 'Failed to fetch investment plans', err.message, 500);
  }
}

async function createInvestment(req, res) {
  try {
    const { plan_id, amount, payment_method } = req.body;
    if (!plan_id || !amount || !payment_method) {
      return sendError(res, 'Missing required fields: plan_id, amount, payment_method', null, 400);
    }

    const result = await investmentService.processInvestment(
      req.user.id,
      plan_id,
      amount,
      payment_method
    );

    return sendSuccess(res, 'Investment simulated successfully', result, 201);
  } catch (err) {
    return sendError(res, err.message || 'Investment processing failed', null, 400);
  }
}

module.exports = {
  getPlans,
  createInvestment
};
