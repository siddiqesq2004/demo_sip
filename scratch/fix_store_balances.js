const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '../backend/database/credora_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

console.log('Store Portfolio Records:');
console.log(store.portfolio);

// Guarantee user 1 has unified matching balances
store.portfolio = store.portfolio.map(p => {
  const invested = parseFloat(p.invested_amount || 116510);
  const available = parseFloat(p.available_cash !== undefined ? p.available_cash : 20505);
  const total = invested + available;
  return {
    ...p,
    invested_amount: invested,
    available_cash: available,
    total_value: total,
    total_returns: parseFloat(p.total_returns || 17005),
    unclaimed_amount: parseFloat(p.unclaimed_amount || 42),
    unclaimed_count: parseInt(p.unclaimed_count || 1),
    streak_count: parseInt(p.streak_count || 20),
    auto_reinvest: 1,
    unclaimed_days: p.unclaimed_days || []
  };
});

fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
console.log('\n--- STORE BALANCES UNIFIED SUCCESSFULLY ---');
console.log(store.portfolio);
