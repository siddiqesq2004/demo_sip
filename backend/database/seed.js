const bcrypt = require('bcryptjs');
const { initDB, query } = require('../config/db');

async function seedDatabase() {
  console.log('🌱 Starting CREDORA demo seed process with Sub-Admins & 6 Dummy Users...');

  // 1. Password Hashes
  const userPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const subAdminPasswordHash = await bcrypt.hash('subadmin123', 10);

  // 2. Safely check existing data (DO NOT wipe user-created subadmins)
  const [existingSubadmins] = await query('SELECT * FROM subadmins');
  const existingSubList = Array.isArray(existingSubadmins) ? existingSubadmins : [];
  const existingSubEmails = new Set(existingSubList.map(s => (s.email || '').toLowerCase()));

  const [existingUsers] = await query('SELECT * FROM users');
  const existingUserList = Array.isArray(existingUsers) ? existingUsers : [];

  // Seed default 6 Users ONLY if users table is empty
  const userIds = [];
  if (existingUserList.length === 0) {
    const dummyUsers = [
      { name: 'Anish P', email: 'anishp@email.com', val: 125430.00, inv: 106510.00, ret: 18920.00 },
      { name: 'Priya Sharma', email: 'priya.sharma@email.com', val: 85000.00, inv: 70000.00, ret: 15000.00 },
      { name: 'Rahul Verma', email: 'rahul.v@email.com', val: 210000.00, inv: 175000.00, ret: 35000.00 },
      { name: 'Sneha Patel', email: 'sneha.patel@email.com', val: 45500.00, inv: 38000.00, ret: 7500.00 },
      { name: 'Vikram Malhotra', email: 'vikram.m@email.com', val: 350000.00, inv: 290000.00, ret: 60000.00 },
      { name: 'Ananya Rao', email: 'ananya.rao@email.com', val: 150000.00, inv: 125000.00, ret: 25000.00 }
    ];

    for (let i = 0; i < dummyUsers.length; i++) {
      const u = dummyUsers[i];
      const [res] = await query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [u.name, u.email, userPasswordHash]
      );
      const uId = res.insertId;
      userIds.push(uId);

      await query(
        'INSERT INTO portfolio (user_id, total_value, invested_amount, total_returns) VALUES (?, ?, ?, ?)',
        [uId, u.val, u.inv, u.ret]
      );

      await query(
        'INSERT INTO bank_accounts (user_id, name, acc_no, ifsc, is_primary) VALUES (?, ?, ?, ?, ?)',
        [uId, 'HDFC Bank Ltd', '•••• •••• 4921', 'HDFC0001234', 1]
      );
      if (i === 0) {
        await query(
          'INSERT INTO bank_accounts (user_id, name, acc_no, ifsc, is_primary) VALUES (?, ?, ?, ?, ?)',
          [uId, 'ICICI Bank Ltd', '•••• •••• 4431', 'ICIC0008832', 0]
        );
      }
    }
  }

  // Seed Super Admin if missing
  const existingAdmins = await query('SELECT * FROM admins WHERE email = ?', ['admin@credora.com']);
  if (!existingAdmins || !existingAdmins[0] || existingAdmins[0].length === 0) {
    await query(
      'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
      ['System Super Admin', 'admin@credora.com', adminPasswordHash]
    );
  }

  // Seed default Sub-Admins ONLY IF missing (PRESERVES ALL USER-ADDED SUBADMINS!)
  const defaultSubAdminData = [
    { name: 'Karan Singh', email: 'karan.subadmin@credora.com', role: 'WITHDRAWAL_APPROVER', permissions: 'WITHDRAWALS_ONLY' },
    { name: 'Neha Gupta', email: 'neha.subadmin@credora.com', role: 'SUPPORT_AGENT', permissions: 'SUPPORT_CHAT_ONLY' },
    { name: 'Amit Kumar', email: 'amit.subadmin@credora.com', role: 'FULL_SUBADMIN', permissions: 'ALL_PERMISSIONS' },
    { name: 'Vijay', email: 'mdabsdq2004@gmail.com', role: 'SUPPORT_AGENT', permissions: 'SUPPORT_CHAT_ONLY' },
    { name: 'Siddiqe', email: 'siddiqesq2004@gmail.com', role: 'WITHDRAWAL_APPROVER', permissions: 'WITHDRAWALS_ONLY' }
  ];

  for (const sa of defaultSubAdminData) {
    if (!existingSubEmails.has(sa.email.toLowerCase())) {
      await query(
        'INSERT INTO subadmins (name, email, password, role, permissions, status) VALUES (?, ?, ?, ?, ?, ?)',
        [sa.name, sa.email, subAdminPasswordHash, sa.role, sa.permissions, 'FREE']
      );
    }
  }
  console.log(`🛡️ Sub-Admins database verified and preserved.`);

  // 6. Seed Plans if empty
  const existingPlans = await query('SELECT * FROM plans');
  const existingPlanList = existingPlans && existingPlans[0] ? existingPlans[0] : [];
  let planIds = existingPlanList.map(p => p.id);

  if (existingPlanList.length === 0) {
    const plansData = [
      {
        name: '22 Day Growth Plan',
        return_percentage: 22.00,
        duration_days: 22,
        working_days_only: 1,
        min_amount: 5000.00,
        description: '1% Daily Returns for 22 working days (Mon-Fri). Perfect for short-term consistent capital growth.',
        benefits: '• Daily return payout credit\n• Weekend holidays (Mon-Fri active)\n• Capital refund on completion'
      },
      {
        name: '45 Day Accelerator Plan',
        return_percentage: 50.00,
        duration_days: 45,
        working_days_only: 1,
        min_amount: 10000.00,
        description: '1.11% Daily Returns for 45 working days with accelerated payout multipliers.',
        benefits: '• Higher daily returns\n• Priority withdrawal processing\n• Automated reinvestment option'
      },
      {
        name: '90 Day Wealth Builder',
        return_percentage: 110.00,
        duration_days: 90,
        working_days_only: 1,
        min_amount: 25000.00,
        description: 'Maximum compound return plan for long-term growth investors.',
        benefits: '• Max yield rate (1.22% daily)\n• Dedicated portfolio manager\n• Zero transaction fee'
      }
    ];

    for (const plan of plansData) {
      const [res] = await query(
        `INSERT INTO plans (name, return_percentage, duration_days, working_days_only, min_amount, description, benefits)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [plan.name, plan.return_percentage, plan.duration_days, plan.working_days_only, plan.min_amount, plan.description, plan.benefits]
      );
      planIds.push(res.insertId);
    }
  }

  // 7. Seed initial dummy investments/withdrawals/chats ONLY IF userIds were inserted
  if (userIds.length > 0) {
    const dummyUsers = [
      { name: 'Anish P', email: 'anishp@email.com', val: 125430.00, inv: 106510.00, ret: 18920.00 },
      { name: 'Priya Sharma', email: 'priya.sharma@email.com', val: 85000.00, inv: 70000.00, ret: 15000.00 },
      { name: 'Rahul Verma', email: 'rahul.v@email.com', val: 210000.00, inv: 175000.00, ret: 35000.00 },
      { name: 'Sneha Patel', email: 'sneha.patel@email.com', val: 45500.00, inv: 38000.00, ret: 7500.00 },
      { name: 'Vikram Malhotra', email: 'vikram.m@email.com', val: 350000.00, inv: 290000.00, ret: 60000.00 },
      { name: 'Ananya Rao', email: 'ananya.rao@email.com', val: 150000.00, inv: 125000.00, ret: 25000.00 }
    ];

    for (let i = 0; i < userIds.length; i++) {
      const uId = userIds[i];
      const planId = planIds[i % planIds.length];
      const invAmount = dummyUsers[i].inv;

      await query(
        `INSERT INTO investments (user_id, plan_id, amount, expected_returns, current_day, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uId, planId, invAmount, invAmount * 0.22, 8 + i, 'ACTIVE']
      );
    }

    const allSubs = await query('SELECT * FROM subadmins');
    const karanId = allSubs[0] && allSubs[0][0] ? allSubs[0][0].id : 1;
    const nehaId = allSubs[0] && allSubs[0][1] ? allSubs[0][1].id : 2;

    await query(
      `INSERT INTO withdrawals (user_id, amount, bank_name, account_no, ifsc, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userIds[2], 25000.00, 'HDFC Bank Ltd', '•••• •••• 4921', 'HDFC0001234', 'PENDING_APPROVAL', '2026-07-25 10:30:00']
    );

    await query(
      `INSERT INTO withdrawals (user_id, amount, bank_name, account_no, ifsc, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userIds[1], 12000.00, 'ICICI Bank Ltd', '•••• •••• 4431', 'ICIC0008832', 'PENDING_APPROVAL', '2026-07-25 11:15:00']
    );

    await query(
      `INSERT INTO withdrawals (user_id, amount, bank_name, account_no, ifsc, status, processed_by_subadmin_id, processed_by_name, created_at, processed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userIds[0], 18920.00, 'HDFC Bank Ltd', '•••• •••• 4921', 'HDFC0001234', 'APPROVED', karanId, 'Karan Singh', '2026-07-24 14:00:00', '2026-07-24 14:15:00']
    );

    await query(
      `INSERT INTO subadmin_logs (subadmin_id, subadmin_name, action_type, description, target_user_id, target_user_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [karanId, 'Karan Singh', 'WITHDRAWAL_APPROVAL', `Approved ₹18,920.00 payout to HDFC Bank **** 4921`, userIds[0], 'Anish P', '2026-07-24 14:15:00']
    );

    await query(
      `INSERT INTO subadmin_logs (subadmin_id, subadmin_name, action_type, description, target_user_id, target_user_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nehaId, 'Neha Gupta', 'SUPPORT_CHAT_REPLY', `Answered query regarding 22-day compounding returns`, userIds[1], 'Priya Sharma', '2026-07-25 09:45:00']
    );

    const [chatAnish] = await query(
      `INSERT INTO support_chats (user_id, subadmin_id, subadmin_name, initial_query, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userIds[0], null, 'Awaiting Free Official', 'Hi, when will my daily 1% payout arrive today?', 'OPEN', '2026-07-25 11:00:00']
    );

    await query(
      `INSERT INTO support_messages (chat_id, sender_type, sender_name, text, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [chatAnish.insertId, 'user', 'Anish P', 'Hi, when will my daily 1% payout arrive today?', '2026-07-25 11:00:00']
    );

    const [chat1] = await query(
      `INSERT INTO support_chats (user_id, subadmin_id, subadmin_name, initial_query, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userIds[1], nehaId, 'Neha Gupta', 'When will my 45-day accelerator daily return be credited?', 'IN_CONVERSATION', '2026-07-25 09:30:00']
    );

    await query(
      `INSERT INTO support_messages (chat_id, sender_type, sender_name, text, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [chat1.insertId, 'user', 'Priya Sharma', 'Hi, when will my daily 1.11% payout arrive today?', '2026-07-25 09:30:00']
    );
    await query(
      `INSERT INTO support_messages (chat_id, sender_type, sender_name, text, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [chat1.insertId, 'subadmin', 'Neha Gupta (Sub-Admin)', 'Hello Priya! Daily returns are credited automatically every working day at 09:30 AM.', '2026-07-25 09:45:00']
    );

    const [chat2] = await query(
      `INSERT INTO support_chats (user_id, subadmin_id, subadmin_name, initial_query, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userIds[2], null, null, 'I submitted a withdrawal request of ₹25,000. How long for approval?', 'OPEN', '2026-07-25 10:35:00']
    );

    await query(
      `INSERT INTO support_messages (chat_id, sender_type, sender_name, text, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [chat2.insertId, 'user', 'Rahul Verma', 'Hi support, I requested ₹25,000 payout. Please confirm approval timeline.', '2026-07-25 10:35:00']
    );

    const transactions = [
      { user_id: userIds[0], type: 'WITHDRAWAL', amount: 18920.00, description: 'Withdrawal to HDFC Bank (**** 4921) - Approved by Karan Singh', status: 'COMPLETED', created_at: '2026-07-24 14:15:00' },
      { user_id: userIds[0], type: 'DAILY_RETURN', amount: 1065.10, description: 'Daily Return Received - 1% of ₹1,06,510.00', status: 'COMPLETED', created_at: '2026-07-24 09:30:00' },
      { user_id: userIds[1], type: 'INVESTMENT', amount: 70000.00, description: 'Invested in 45 Day Accelerator Plan', status: 'COMPLETED', created_at: '2026-07-20 11:00:00' },
      { user_id: userIds[2], type: 'INVESTMENT', amount: 175000.00, description: 'Invested in 90 Day Wealth Builder', status: 'COMPLETED', created_at: '2026-07-15 14:30:00' }
    ];

    for (const tx of transactions) {
      await query(
        `INSERT INTO transactions (user_id, type, amount, description, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [tx.user_id, tx.type, tx.amount, tx.description, tx.status, tx.created_at]
      );
    }
  }

  console.log('✨ Demo database seeding complete!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
