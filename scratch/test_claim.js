const models = require('../backend/models');
const userService = require('../backend/services/userService');

async function test() {
  console.log('--- BEFORE CLAIM ---');
  let p1 = await models.getPortfolioByUserId(1);
  console.log('Portfolio User 1:', { total_value: p1.total_value, available_cash: p1.available_cash, unclaimed_amount: p1.unclaimed_amount });

  console.log('\n--- CLAIMING GROWTH ---');
  let result = await models.claimUserGrowth(1);
  console.log('Claim Result:', result);

  console.log('\n--- AFTER CLAIM ---');
  let p2 = await models.getPortfolioByUserId(1);
  console.log('Portfolio User 1 after claim:', { total_value: p2.total_value, available_cash: p2.available_cash, unclaimed_amount: p2.unclaimed_amount });

  let dash = await userService.getDashboardData(1);
  console.log('Dashboard Data after claim:', dash.portfolio);
}

test().catch(console.error);
