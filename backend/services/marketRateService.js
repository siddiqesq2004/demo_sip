const { query } = require('../config/db');

// Deterministic pseudo-random rate generator (0.50 - 1.00%) based on date string
function generateDailyRate(dateStr) {
  // Simple hash of date string to get deterministic 'random' rate
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  // Map to range 0.50 - 1.00 (50 possible values in steps of 0.01)
  const normalized = Math.abs(hash % 51); // 0-50
  return 0.50 + (normalized / 100); // 0.50 to 1.00
}

function isWeekend(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

function getTodayDateStr() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function getTodayRate() {
  const today = getTodayDateStr();
  
  if (isWeekend(today)) {
    return { date: today, rate: 0.00, source: 'WEEKEND', is_weekend: true };
  }
  
  // Check if admin has set a custom rate for today
  try {
    const [rows] = await query('SELECT * FROM market_rates WHERE rate_date = ?', [today]);
    if (rows && rows.length > 0) {
      return {
        date: today,
        rate: parseFloat(rows[0].rate_percentage),
        source: 'ADMIN',
        set_by: rows[0].set_by,
        is_weekend: false
      };
    }
  } catch (e) {
    // Fallback to auto-generated
  }
  
  // Auto-generate deterministic rate
  const rate = generateDailyRate(today);
  return { date: today, rate: parseFloat(rate.toFixed(2)), source: 'MARKET', is_weekend: false };
}

async function setDailyRate(dateStr, ratePercentage, setBy = 'ADMIN') {
  const rate = Math.min(1.00, Math.max(0.50, parseFloat(ratePercentage)));
  try {
    // Try to update existing
    const [existing] = await query('SELECT * FROM market_rates WHERE rate_date = ?', [dateStr]);
    if (existing && existing.length > 0) {
      await query('UPDATE market_rates SET rate_percentage = ?, set_by = ? WHERE rate_date = ?', [rate, setBy, dateStr]);
    } else {
      await query('INSERT INTO market_rates (rate_date, rate_percentage, set_by) VALUES (?, ?, ?)', [dateStr, rate, setBy]);
    }
  } catch (e) {
    // Fallback handled by memory store
    await query('INSERT INTO market_rates (rate_date, rate_percentage, set_by) VALUES (?, ?, ?)', [dateStr, rate, setBy]);
  }
  return { date: dateStr, rate: rate, set_by: setBy };
}

async function getRateHistory(days = 7) {
  const history = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const pad = n => String(n).padStart(2, '0');
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    
    if (isWeekend(dateStr)) {
      history.push({ date: dateStr, rate: 0.00, source: 'WEEKEND', is_weekend: true, day_name: d.toLocaleDateString('en-US', { weekday: 'short' }) });
      continue;
    }
    
    // Check admin-set rate
    try {
      const [rows] = await query('SELECT * FROM market_rates WHERE rate_date = ?', [dateStr]);
      if (rows && rows.length > 0) {
        history.push({
          date: dateStr,
          rate: parseFloat(rows[0].rate_percentage),
          source: 'ADMIN',
          set_by: rows[0].set_by,
          is_weekend: false,
          day_name: d.toLocaleDateString('en-US', { weekday: 'short' })
        });
        continue;
      }
    } catch (e) {}
    
    // Auto-generated
    const rate = generateDailyRate(dateStr);
    history.push({
      date: dateStr,
      rate: parseFloat(rate.toFixed(2)),
      source: 'MARKET',
      is_weekend: false,
      day_name: d.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  return history;
}

function calculateDailyGrowth(investedAmount, rate) {
  return parseFloat((investedAmount * rate / 100).toFixed(2));
}

module.exports = {
  getTodayRate,
  setDailyRate,
  getRateHistory,
  calculateDailyGrowth,
  generateDailyRate,
  isWeekend,
  getTodayDateStr
};
