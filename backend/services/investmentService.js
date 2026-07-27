const models = require('../models');

async function getAvailablePlans() {
  const plans = await models.getAllPlans();
  return plans.map(p => ({
    ...p,
    return_percentage: parseFloat(p.return_percentage),
    min_amount: parseFloat(p.min_amount)
  }));
}

async function processInvestment(userId, planId, amount, paymentMethod) {
  let plan = await models.getPlanById(planId);
  if (!plan) {
    const plans = await models.getAllPlans();
    plan = (plans || []).find(p => Number(p.id) === Number(planId)) || (plans || [])[0] || {
      id: 1,
      name: '22 Day Growth Plan',
      return_percentage: 22.00,
      min_amount: 5000.00,
      duration_days: 22
    };
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount < parseFloat(plan.min_amount)) {
    throw new Error(`Minimum investment amount for this plan is ₹${plan.min_amount}`);
  }

  // Calculate dynamic expected returns from plan's return_percentage
  const returnPercentage = parseFloat(plan.return_percentage);
  const expectedReturns = numAmount * (returnPercentage / 100);
  const totalReturnAmount = numAmount + expectedReturns;

  // 1. Create Investment Record
  const investmentId = await models.createInvestment(
    userId,
    planId,
    numAmount,
    expectedReturns
  );

  // 2. Record Transaction
  const methodLabel = paymentMethod === 'UPI' ? 'UPI' : (paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Simulated Payment');
  await models.createTransaction(
    userId,
    'INVESTMENT',
    numAmount,
    `Invested ₹${numAmount.toLocaleString('en-IN')} in ${plan.name} via ${methodLabel}`
  );

  // 3. Update Portfolio Values accurately from DB investments
  const userInvestments = await models.getInvestmentsByUserId(userId);
  const newInvestedAmount = userInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);

  const currentPortfolio = await models.getPortfolioByUserId(userId) || { total_returns: 0 };
  const newTotalReturns = parseFloat(currentPortfolio.total_returns || 0);
  const newTotalValue = newInvestedAmount + newTotalReturns;

  await models.updatePortfolio(userId, newTotalValue, newInvestedAmount, newTotalReturns);

  return {
    investment_id: investmentId,
    plan_name: plan.name,
    amount: numAmount,
    expected_returns: expectedReturns,
    total_expected: totalReturnAmount,
    payment_method: paymentMethod,
    status: 'ACTIVE'
  };
}

module.exports = {
  getAvailablePlans,
  processInvestment
};
