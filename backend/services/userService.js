const models = require('../models');

async function getDashboardData(userId) {
  const user = await models.findUserById(userId);
  const portfolio = await models.getPortfolioByUserId(userId) || {
    total_value: 0,
    invested_amount: 0,
    total_returns: 0
  };
  
  const activePlan = await models.getActiveInvestmentByUserId(userId);
  const transactions = await models.getTransactionsByUserId(userId);
  const userWithdrawals = await models.getUserWithdrawals(userId);
  
  // Calculate today's earnings dynamically based on active investments (1% daily rate assumption)
  const todayEarning = activePlan ? (parseFloat(activePlan.amount) * 0.01) : (parseFloat(portfolio.invested_amount) * 0.01);

  // Generate dynamic notifications
  const notifications = [];

  userWithdrawals.forEach((w) => {
    // 1. Approval Request Sent to Officials
    notifications.push({
      id: `w-requested-${w.id}`,
      type: 'withdrawal_pending',
      title: 'Approval Request Sent to Officials',
      desc: `Approval request of ₹${parseFloat(w.amount).toLocaleString('en-IN')} sent to sub-admin officials (Reason: "${w.remarks || 'Personal Savings'}"). After review, amount will be sent to your account shortly. Please check notifications frequently for updates.`,
      time: w.created_at || 'Just now',
      unread: w.status === 'PENDING_APPROVAL'
    });

    // 2. If APPROVED, include separate Withdrawal Approved message
    if (w.status === 'APPROVED' || w.status === 'COMPLETED') {
      notifications.push({
        id: `w-approved-${w.id}`,
        type: 'withdrawal_approved',
        title: 'Withdrawal Approved & Transferred',
        desc: `₹${parseFloat(w.amount).toLocaleString('en-IN')} approved by ${w.processed_by_name || 'Sub-Admin Official'} and transferred to your ${w.bank_name} account. Debited from Total Wallet Balance.`,
        time: w.processed_at || w.created_at || 'Just now',
        unread: true
      });
    } 
    // 3. If REJECTED
    else if (w.status === 'REJECTED') {
      notifications.push({
        id: `w-rejected-${w.id}`,
        type: 'withdrawal_rejected',
        title: 'Withdrawal Request Rejected',
        desc: `Your payout request of ₹${parseFloat(w.amount).toLocaleString('en-IN')} to ${w.bank_name} was reviewed and rejected by officials.`,
        time: w.processed_at || w.created_at || 'Just now',
        unread: true
      });
    }
  });

  transactions.forEach((tx) => {
    if (tx.type === 'DAILY_RETURN') {
      notifications.push({
        id: `tx-${tx.id}`,
        type: 'payout',
        title: 'Daily Return Credited',
        desc: `₹${tx.amount.toLocaleString()} (1%) credited to your portfolio.`,
        time: tx.created_at || 'Just now',
        unread: false
      });
    }
  });

  notifications.push({
    id: 'promo-1',
    type: 'promo',
    title: 'Referral Program Active',
    desc: 'Earn ₹500 credited per friend who starts an investment.',
    time: '24 July 2026',
    unread: false
  });
  
  notifications.push({
    id: 'security-1',
    type: 'security',
    title: 'Security Login Alert',
    desc: 'Successful login from Chrome on Windows.',
    time: '23 July 2026',
    unread: false
  });

  notifications.sort((a, b) => {
    const timeA = a.time ? new Date(a.time).getTime() : 0;
    const timeB = b.time ? new Date(b.time).getTime() : 0;
    if (isNaN(timeA) || isNaN(timeB)) return 0;
    return timeB - timeA;
  });

  const investedAmount = parseFloat(portfolio.invested_amount || 116510);
  const totalReturns = parseFloat(portfolio.total_returns || 18920);
  const availableCash = parseFloat(portfolio.available_cash !== undefined ? portfolio.available_cash : 2420.00);
  const totalValue = investedAmount + availableCash;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url || null
    },
    portfolio: {
      total_value: totalValue,
      invested_amount: investedAmount,
      total_returns: totalReturns,
      available_cash: availableCash,
      all_time_profit_percent: investedAmount > 0 
        ? ((totalReturns / investedAmount) * 100).toFixed(2)
        : 0
    },
    today_earning: {
      amount: todayEarning.toFixed(2),
      percent: 1.00
    },
    active_cycle: activePlan ? {
      id: activePlan.id,
      plan_name: activePlan.plan_name,
      current_day: activePlan.current_day,
      total_days: activePlan.duration_days,
      days_left: activePlan.duration_days - activePlan.current_day,
      progress_percent: Math.round((activePlan.current_day / activePlan.duration_days) * 100),
      invested: parseFloat(activePlan.amount),
      returns_earned: (parseFloat(activePlan.amount) * 0.01 * activePlan.current_day).toFixed(2),
      next_payout_date: '28 July 2026' // Dynamic calculation indicator
    } : null,
    recent_transactions: transactions.slice(0, 5),
    notifications: notifications.slice(0, 8)
  };
}

async function getUserPortfolio(userId) {
  const portfolio = await models.getPortfolioByUserId(userId) || {
    total_value: 0,
    invested_amount: 0,
    total_returns: 0
  };
  const investments = await models.getInvestmentsByUserId(userId);
  
  const activePlans = investments.filter(inv => inv.status === 'ACTIVE');
  const completedPlans = investments.filter(inv => inv.status === 'COMPLETED');

  const investedAmount = parseFloat(portfolio.invested_amount || 0);
  const totalReturns = parseFloat(portfolio.total_returns || 0);
  const totalValue = investedAmount + totalReturns;

  return {
    portfolio: {
      total_value: totalValue,
      invested_amount: investedAmount,
      total_returns: totalReturns
    },
    active_plans: activePlans.map(plan => ({
      ...plan,
      amount: parseFloat(plan.amount),
      returns_earned: (parseFloat(plan.amount) * 0.01 * plan.current_day).toFixed(2)
    })),
    completed_plans: completedPlans.map(plan => ({
      ...plan,
      amount: parseFloat(plan.amount),
      returns_earned: parseFloat(plan.expected_returns)
    }))
  };
}

async function getUserActivity(userId) {
  const transactions = await models.getTransactionsByUserId(userId);
  return {
    transactions: transactions.map(t => ({
      ...t,
      amount: parseFloat(t.amount)
    }))
  };
}

async function getUserProfile(userId) {
  const user = await models.findUserById(userId);
  const portfolio = await models.getPortfolioByUserId(userId) || {
    total_value: 0,
    invested_amount: 0,
    total_returns: 0
  };

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url || null,
      is_verified: true,
      member_since: user.created_at
    },
    account_summary: {
      total_invested: parseFloat(portfolio.invested_amount),
      total_returns: parseFloat(portfolio.total_returns),
      account_balance: 0.00
    }
  };
}

module.exports = {
  getDashboardData,
  getUserPortfolio,
  getUserActivity,
  getUserProfile
};
