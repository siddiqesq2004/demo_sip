const models = require('../backend/models');
const userService = require('../backend/services/userService');

async function test() {
  console.log('--- BEFORE DEPOSIT ---');
  let p1 = await models.getPortfolioByUserId(1);
  console.log('Portfolio User 1:', p1);

  console.log('\n--- DEPOSITING 5000 TO AVAILABLE CASH ---');
  let result = await models.depositUserWallet(1, 5000, 'HDFC Bank Ltd', 'available_cash');
  console.log('Deposit Result:', result);

  console.log('\n--- AFTER DEPOSIT ---');
  let p2 = await models.getPortfolioByUserId(1);
  console.log('Portfolio User 1 after deposit:', p2);

  let dash = await userService.getDashboardData(1);
  console.log('Dashboard Data after deposit:', dash.portfolio);
}

test().catch(console.error);
