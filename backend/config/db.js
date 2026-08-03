const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const jsonStorePath = path.join(__dirname, '../database/credora_store.json');

const defaultPlans = [
  {
    id: 1,
    name: '22 Day Growth Plan',
    return_percentage: 22.00,
    duration_days: 22,
    working_days_only: 1,
    min_amount: 5000.00,
    description: '1% Daily Returns for 22 working days (Mon-Fri). Perfect for short-term consistent capital growth.',
    benefits: '• Daily return payout credit\n• Weekend holidays (Mon-Fri active)\n• Capital refund on completion'
  },
  {
    id: 2,
    name: '45 Day Accelerator Plan',
    return_percentage: 50.00,
    duration_days: 45,
    working_days_only: 1,
    min_amount: 10000.00,
    description: '1.11% Daily Returns for 45 working days with accelerated payout multipliers.',
    benefits: '• Higher daily returns\n• Priority withdrawal processing\n• Automated reinvestment option'
  },
  {
    id: 3,
    name: '90 Day Wealth Builder',
    return_percentage: 110.00,
    duration_days: 90,
    working_days_only: 1,
    min_amount: 25000.00,
    description: 'Maximum compound return plan for long-term growth investors.',
    benefits: '• Max yield rate (1.22% daily)\n• Dedicated portfolio manager\n• Zero transaction fee'
  }
];

// Default initial state for JSON fallback database
const initialStore = {
  users: [],
  admins: [],
  subadmins: [],
  subadmin_logs: [],
  portfolio: [],
  plans: defaultPlans,
  investments: [],
  withdrawals: [],
  support_chats: [],
  support_messages: [],
  transactions: [],
  bank_accounts: [],
  market_rates: []
};

let memoryStore = { ...initialStore };

function loadJsonStore() {
  try {
    if (fs.existsSync(jsonStorePath)) {
      const data = fs.readFileSync(jsonStorePath, 'utf8');
      if (data && data.trim().length > 0) {
        memoryStore = JSON.parse(data);
      } else {
        memoryStore = JSON.parse(JSON.stringify(initialStore));
        saveJsonStore();
      }
    } else {
      memoryStore = JSON.parse(JSON.stringify(initialStore));
      saveJsonStore();
    }
  } catch (err) {
    console.error('Error loading JSON store:', err.message);
    memoryStore = JSON.parse(JSON.stringify(initialStore));
    saveJsonStore();
  }
}

function saveJsonStore() {
  try {
    fs.writeFileSync(jsonStorePath, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving JSON store:', err.message);
  }
}

loadJsonStore();

// Create connection pool if MySQL configured
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'credora_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function query(sql, params = []) {
  try {
    const res = await pool.query(sql, params);
    return res;
  } catch (err) {
    // Fallback to in-memory JSON Store
    return queryMemoryStore(sql, params);
  }
}

function getRealNowFormatted() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function queryMemoryStore(sql, params = []) {
  loadJsonStore();
  const upperSql = sql.trim().toUpperCase();

  if (upperSql.startsWith('DELETE')) {
    if (upperSql.includes('FROM SUBADMINS WHERE ID')) {
      const subId = params[0];
      const beforeLen = memoryStore.subadmins.length;
      memoryStore.subadmins = memoryStore.subadmins.filter(s => Number(s.id) !== Number(subId));
      saveJsonStore();
      return [{ affectedRows: beforeLen - memoryStore.subadmins.length }];
    }
    if (upperSql.includes('FROM TRANSACTIONS')) memoryStore.transactions = [];
    if (upperSql.includes('FROM INVESTMENTS')) memoryStore.investments = [];
    if (upperSql.includes('FROM PORTFOLIO')) memoryStore.portfolio = [];
    if (upperSql.includes('FROM PLANS')) memoryStore.plans = [];
    if (upperSql.includes('FROM USERS')) memoryStore.users = [];
    if (upperSql.includes('FROM ADMINS')) memoryStore.admins = [];
    if (upperSql.includes('FROM SUBADMINS')) memoryStore.subadmins = [];
    if (upperSql.includes('FROM WITHDRAWALS')) memoryStore.withdrawals = [];
    if (upperSql.includes('FROM SUBADMIN_LOGS')) memoryStore.subadmin_logs = [];
    if (upperSql.includes('FROM SUPPORT_CHATS')) memoryStore.support_chats = [];
    if (upperSql.includes('FROM SUPPORT_MESSAGES')) memoryStore.support_messages = [];
    if (upperSql.includes('FROM BANK_ACCOUNTS')) memoryStore.bank_accounts = [];
    saveJsonStore();
    return [{ affectedRows: 1 }];
  }

  if (upperSql.startsWith('INSERT INTO')) {
    if (upperSql.includes('INSERT INTO USERS')) {
      const newId = memoryStore.users.length + 1;
      const newUser = {
        id: newId,
        name: params[0],
        email: params[1],
        password: params[2],
        created_at: getRealNowFormatted()
      };
      memoryStore.users.push(newUser);
      memoryStore.portfolio.push({
        id: memoryStore.portfolio.length + 1,
        user_id: newId,
        total_value: 0.00,
        invested_amount: 0.00,
        total_returns: 0.00
      });
      saveJsonStore();
      return [{ insertId: newId }];
    } else if (upperSql.includes('INSERT INTO ADMINS')) {
      const newId = memoryStore.admins.length + 1;
      const newAdmin = {
        id: newId,
        name: params[0],
        email: params[1],
        password: params[2],
        created_at: getRealNowFormatted()
      };
      memoryStore.admins.push(newAdmin);
      saveJsonStore();
      return [{ insertId: newId }];
    } else if (upperSql.includes('INSERT INTO SUBADMINS')) {
      const newId = memoryStore.subadmins.length + 1;
      const newSub = {
        id: newId,
        name: params[0],
        email: params[1],
        password: params[2],
        role: params[3] || 'WITHDRAWAL_APPROVER',
        permissions: params[4] || 'WITHDRAWALS_ONLY',
        status: params[5] || 'FREE',
        created_at: getRealNowFormatted()
      };
      memoryStore.subadmins.push(newSub);
      saveJsonStore();
      return [{ insertId: newId }];
    } else if (upperSql.includes('INSERT INTO SUBADMIN_LOGS')) {
      const newId = memoryStore.subadmin_logs.length + 1;
      const newLog = {
        id: newId,
        subadmin_id: params[0],
        subadmin_name: params[1],
        action_type: params[2],
        description: params[3],
        target_user_id: params[4] || null,
        target_user_name: params[5] || null,
        created_at: getRealNowFormatted()
      };
      memoryStore.subadmin_logs.push(newLog);
      saveJsonStore();
      return [{ insertId: newId }];
    } else if (upperSql.includes('INSERT INTO PLANS')) {
      const newId = memoryStore.plans.length + 1;
      const newPlan = {
        id: newId,
        name: params[0],
        return_percentage: parseFloat(params[1]),
        duration_days: parseInt(params[2]),
        working_days_only: params[3],
        min_amount: parseFloat(params[4]),
        description: params[5],
        benefits: params[6]
      };
      memoryStore.plans.push(newPlan);
      saveJsonStore();
      return [{ insertId: newId }];
    } else if (upperSql.includes('INSERT INTO INVESTMENTS')) {
      const newId = memoryStore.investments.length + 1;
      const newInv = {
        id: newId,
        user_id: params[0],
        plan_id: params[1],
        amount: params[2],
        expected_returns: params[3],
        total_expected: params[4],
        status: params[5] || 'ACTIVE',
        created_at: getRealNowFormatted()
      };
      memoryStore.investments.push(newInv);

      const pIdx = memoryStore.portfolio.findIndex(p => Number(p.user_id) === Number(params[0]));
      if (pIdx !== -1) {
        const userInvs = memoryStore.investments.filter(i => Number(i.user_id) === Number(params[0]));
        const sumInvested = userInvs.reduce((acc, inv) => acc + parseFloat(inv.amount || 0), 0);
        memoryStore.portfolio[pIdx].invested_amount = sumInvested;
        memoryStore.portfolio[pIdx].total_value = sumInvested + parseFloat(memoryStore.portfolio[pIdx].total_returns || 0);
      }

      saveJsonStore();
      return [{ insertId: newId }];
    } else if (upperSql.includes('INSERT INTO PORTFOLIO')) {
      const userId = params[0];
      const totalVal = parseFloat(params[1] || 0);
      const invAmt = parseFloat(params[2] || 0);
      const totRet = parseFloat(params[3] || 0);
      const availCash = params[4] !== undefined ? parseFloat(params[4]) : 2420.00;
      const unclaimAmt = params[5] !== undefined ? parseFloat(params[5]) : 42.00;

      const pIdx = memoryStore.portfolio.findIndex(p => Number(p.user_id) === Number(userId));
      if (pIdx !== -1) {
        memoryStore.portfolio[pIdx].total_value = totalVal;
        memoryStore.portfolio[pIdx].invested_amount = invAmt;
        memoryStore.portfolio[pIdx].total_returns = totRet;
        memoryStore.portfolio[pIdx].available_cash = availCash;
        memoryStore.portfolio[pIdx].unclaimed_amount = unclaimAmt;
      } else {
        memoryStore.portfolio.push({
          id: memoryStore.portfolio.length + 1,
          user_id: userId,
          total_value: totalVal,
          invested_amount: invAmt,
          total_returns: totRet,
          available_cash: availCash,
          unclaimed_amount: unclaimAmt
        });
      }
      saveJsonStore();
      return [{ affectedRows: 1 }];
    } else if (upperSql.includes('INSERT INTO WITHDRAWALS')) {
      const newId = memoryStore.withdrawals.length + 1;
      const newW = {
        id: newId,
        user_id: params[0],
        amount: params[1],
        bank_name: params[2],
        account_no: params[3],
        ifsc: params[4],
        status: 'PENDING_APPROVAL',
        processed_by_subadmin_id: null,
        processed_by_name: null,
        created_at: getRealNowFormatted(),
        processed_at: null
      };

      if (params.length >= 6) {
        newW.status = params[5];
      }

      if (params.length === 8) {
        newW.remarks = params[5];
        newW.status = params[6];
        newW.created_at = params[7];
      } else if (params.length === 7) {
        newW.status = params[5];
        newW.created_at = params[6];
      } else if (params.length === 10) {
        newW.processed_by_subadmin_id = params[6];
        newW.processed_by_name = params[7];
        newW.created_at = params[8];
        newW.processed_at = params[9];
      }
      
      // Fallback for hardcoded status strings in SQL statement
      if (typeof params[5] === 'number' || (params[5] && String(params[5]).includes('-') && params[5].length > 15)) {
        newW.status = upperSql.includes("'APPROVED'") ? 'APPROVED' : 'PENDING_APPROVAL';
        newW.processed_by_subadmin_id = typeof params[5] === 'number' ? params[5] : null;
        newW.processed_by_name = typeof params[5] === 'number' ? params[6] : null;
        newW.created_at = typeof params[5] === 'number' ? params[7] : params[5];
        newW.processed_at = typeof params[5] === 'number' ? params[8] : null;
      }
      
      memoryStore.withdrawals.push(newW);
      saveJsonStore();
      return [{ insertId: newId }];
    } else if (upperSql.includes('INSERT INTO SUPPORT_CHATS')) {
      const newId = memoryStore.support_chats.length + 1;
      const newChat = {
        id: newId,
        user_id: params[0],
        subadmin_id: params[1] || 2,
        subadmin_name: params[2] || 'Neha Gupta',
        initial_query: params[3] || 'Support query',
        status: params[4] || 'IN_CONVERSATION',
        created_at: params[5] || getRealNowFormatted()
      };
      memoryStore.support_chats.push(newChat);
      saveJsonStore();
      return [{ insertId: newId }];
    } else if (upperSql.includes('INSERT INTO SUPPORT_MESSAGES')) {
      const newId = memoryStore.support_messages.length + 1;
      const newMsg = {
        id: newId,
        chat_id: params[0],
        sender_type: params[1],
        sender_name: params[2],
        text: params[3],
        created_at: params[4] || getRealNowFormatted()
      };
      memoryStore.support_messages.push(newMsg);
      saveJsonStore();
      return [{ insertId: newId }];
    } else if (upperSql.includes('INSERT INTO TRANSACTIONS')) {
      const newId = memoryStore.transactions.length + 1;
      const newTx = {
        id: newId,
        user_id: params[0],
        type: params[1],
        amount: params[2],
        description: params[3],
        status: params[4] || 'COMPLETED',
        created_at: getRealNowFormatted()
      };
      memoryStore.transactions.push(newTx);
      saveJsonStore();
      return [{ insertId: newId }];
    } else if (upperSql.includes('INSERT INTO BANK_ACCOUNTS')) {
      const newId = memoryStore.bank_accounts.length + 1;
      const newAcc = {
        id: newId,
        user_id: params[0],
        name: params[1],
        acc_no: params[2],
        ifsc: params[3],
        is_primary: params[4] !== undefined ? params[4] : 0,
        created_at: getRealNowFormatted()
      };
      if (newAcc.is_primary) {
        memoryStore.bank_accounts.forEach(b => {
          if (Number(b.user_id) === Number(params[0])) b.is_primary = 0;
        });
      }
      memoryStore.bank_accounts.push(newAcc);
      saveJsonStore();
      return [{ insertId: newId }];
    } else if (upperSql.includes('INSERT INTO MARKET_RATES')) {
      const newId = (memoryStore.market_rates || []).length + 1;
      if (!memoryStore.market_rates) memoryStore.market_rates = [];
      const newRate = {
        id: newId,
        rate_date: params[0],
        rate_percentage: parseFloat(params[1]),
        set_by: params[2] || 'ADMIN',
        created_at: getRealNowFormatted()
      };
      memoryStore.market_rates.push(newRate);
      saveJsonStore();
      return [{ insertId: newId }];
    }
  }

  if (upperSql.startsWith('UPDATE')) {
    if (upperSql.includes('UPDATE PORTFOLIO')) {
      const userId = Number(params[params.length - 1]);
      let idx = memoryStore.portfolio.findIndex(p => Number(p.user_id) === userId);
      
      if (idx === -1) {
        memoryStore.portfolio.push({
          id: memoryStore.portfolio.length + 1,
          user_id: userId,
          total_value: parseFloat(params[0] || 0),
          invested_amount: parseFloat(params[1] || 0),
          total_returns: parseFloat(params[2] || 0),
          available_cash: 2420.00,
          unclaimed_amount: 42.00,
          unclaimed_count: 1,
          streak_count: 18,
          unclaimed_days: []
        });
        idx = memoryStore.portfolio.length - 1;
      }

      memoryStore.portfolio[idx].total_value = parseFloat(params[0]);
      memoryStore.portfolio[idx].invested_amount = parseFloat(params[1]);
      memoryStore.portfolio[idx].total_returns = parseFloat(params[2]);

      if (params.length >= 9) {
        memoryStore.portfolio[idx].available_cash = parseFloat(params[3]);
        memoryStore.portfolio[idx].unclaimed_amount = parseFloat(params[4]);
        memoryStore.portfolio[idx].unclaimed_count = parseInt(params[5]);
        memoryStore.portfolio[idx].streak_count = parseInt(params[6]);
        memoryStore.portfolio[idx].unclaimed_days = params[7];
      }

      saveJsonStore();
      return [{ affectedRows: 1 }];
    } else if (upperSql.includes('UPDATE USERS')) {
      const userId = params[params.length - 1];
      const idx = memoryStore.users.findIndex(u => Number(u.id) === Number(userId));
      if (idx !== -1) {
        if (upperSql.includes('AVATAR_URL')) {
          memoryStore.users[idx].avatar_url = params[0];
        } else if (params[0] !== undefined) {
          memoryStore.users[idx].name = params[0];
        }
        saveJsonStore();
        return [{ affectedRows: 1 }];
      }
    } else if (upperSql.includes('UPDATE WITHDRAWALS')) {
      const withdrawalId = params[params.length - 1];
      const idx = memoryStore.withdrawals.findIndex(w => Number(w.id) === Number(withdrawalId));
      if (idx !== -1) {
        memoryStore.withdrawals[idx].status = params[0];
        memoryStore.withdrawals[idx].processed_by_subadmin_id = params[1];
        memoryStore.withdrawals[idx].processed_by_name = params[2];
        memoryStore.withdrawals[idx].processed_at = getRealNowFormatted();
        saveJsonStore();
        return [{ affectedRows: 1 }];
      }
    } else if (upperSql.includes('UPDATE SUPPORT_CHATS')) {
      const chatId = params[params.length - 1];
      const idx = memoryStore.support_chats.findIndex(c => Number(c.id) === Number(chatId));
      if (idx !== -1) {
        memoryStore.support_chats[idx].subadmin_id = params[0];
        memoryStore.support_chats[idx].subadmin_name = params[1];
        memoryStore.support_chats[idx].status = params[2] || memoryStore.support_chats[idx].status;
        saveJsonStore();
        return [{ affectedRows: 1 }];
      }
    } else if (upperSql.includes('UPDATE SUBADMINS')) {
      const subadminId = params[params.length - 1];
      const idx = memoryStore.subadmins.findIndex(s => Number(s.id) === Number(subadminId));
      if (idx !== -1) {
        memoryStore.subadmins[idx].status = params[0];
        saveJsonStore();
        return [{ affectedRows: 1 }];
      }
    } else if (upperSql.includes('UPDATE BANK_ACCOUNTS SET IS_PRIMARY')) {
      const accId = params[0];
      const userId = params[1];
      memoryStore.bank_accounts.forEach(b => {
        if (Number(b.user_id) === Number(userId)) {
          b.is_primary = Number(b.id) === Number(accId) ? 1 : 0;
        }
      });
      saveJsonStore();
      return [{ affectedRows: 1 }];
    } else if (upperSql.includes('UPDATE MARKET_RATES')) {
      if (!memoryStore.market_rates) memoryStore.market_rates = [];
      const rateDate = params[params.length - 1];
      const idx = memoryStore.market_rates.findIndex(r => r.rate_date === rateDate);
      if (idx !== -1) {
        memoryStore.market_rates[idx].rate_percentage = parseFloat(params[0]);
        memoryStore.market_rates[idx].set_by = params[1] || 'ADMIN';
        saveJsonStore();
        return [{ affectedRows: 1 }];
      }
      return [{ affectedRows: 0 }];
    }
    return [{ affectedRows: 0 }];
  }

  if (upperSql.startsWith('SELECT')) {
    if (upperSql.includes('FROM USERS WHERE EMAIL')) {
      const email = params[0];
      const rows = memoryStore.users.filter(u => u.email.toLowerCase() === String(email).toLowerCase());
      return [rows];
    }
    if (upperSql.includes('FROM USERS WHERE ID')) {
      const id = params[0];
      const rows = memoryStore.users.filter(u => Number(u.id) === Number(id));
      return [rows];
    }
    if (upperSql.includes('FROM USERS')) {
      return [memoryStore.users];
    }
    if (upperSql.includes('FROM ADMINS WHERE EMAIL')) {
      const email = params[0];
      const rows = memoryStore.admins.filter(a => a.email.toLowerCase() === String(email).toLowerCase());
      return [rows];
    }
    if (upperSql.includes('FROM SUBADMINS WHERE EMAIL')) {
      const email = params[0];
      const rows = memoryStore.subadmins.filter(sa => sa.email.toLowerCase() === String(email).toLowerCase());
      return [rows];
    }
    if (upperSql.includes('FROM SUBADMINS')) {
      const rows = [...memoryStore.subadmins].sort((a, b) => b.id - a.id);
      return [rows];
    }
    if (upperSql.includes('FROM SUBADMIN_LOGS')) {
      const rows = [...memoryStore.subadmin_logs].sort((a, b) => b.id - a.id);
      return [rows];
    }
    if (upperSql.includes('FROM WITHDRAWALS') && upperSql.includes('WHERE ID')) {
      const id = params[0];
      const rows = memoryStore.withdrawals.filter(w => Number(w.id) === Number(id));
      return [rows];
    }
    if (upperSql.includes('FROM WITHDRAWALS')) {
      const rows = memoryStore.withdrawals.map(w => {
        const user = memoryStore.users.find(u => Number(u.id) === Number(w.user_id)) || {};
        return {
          ...w,
          user_name: user.name || 'Investor',
          user_email: user.email || '',
          user_avatar: user.avatar_url || null
        };
      }).sort((a, b) => b.id - a.id);
      return [rows];
    }
    if (upperSql.includes('FROM BANK_ACCOUNTS WHERE USER_ID')) {
      const userId = params[0];
      const rows = memoryStore.bank_accounts.filter(b => Number(b.user_id) === Number(userId));
      return [rows];
    }
    if (upperSql.includes('FROM SUPPORT_CHATS') && upperSql.includes('WHERE USER_ID')) {
      const userId = params[0];
      const rows = memoryStore.support_chats.filter(c => Number(c.user_id) === Number(userId));
      return [rows];
    }
    if (upperSql.includes('FROM SUPPORT_CHATS')) {
      const rows = memoryStore.support_chats.map(c => {
        const user = memoryStore.users.find(u => Number(u.id) === Number(c.user_id)) || {};
        const msgs = memoryStore.support_messages.filter(m => Number(m.chat_id) === Number(c.id));
        const lastMsg = msgs[msgs.length - 1];
        return {
          ...c,
          user_name: user.name || c.user_name || 'Investor',
          user_email: user.email || c.user_email || '',
          user_avatar: user.avatar_url || null,
          last_message: lastMsg ? lastMsg.text : c.initial_query,
          message_count: msgs.length
        };
      }).sort((a, b) => b.id - a.id);
      return [rows];
    }
    if (upperSql.includes('FROM SUPPORT_MESSAGES WHERE CHAT_ID')) {
      const chatId = params[0];
      const rows = memoryStore.support_messages
        .filter(m => Number(m.chat_id) === Number(chatId))
        .sort((a, b) => a.id - b.id);
      return [rows];
    }
    if (upperSql.includes('FROM PORTFOLIO WHERE USER_ID')) {
      const userId = params[0];
      const rows = memoryStore.portfolio.filter(p => Number(p.user_id) === Number(userId));
      return [rows];
    }
    if (upperSql.includes('FROM PLANS WHERE ID')) {
      const id = params[0];
      const rows = memoryStore.plans.filter(p => Number(p.id) === Number(id));
      return [rows];
    }
    if (upperSql.includes('FROM PLANS')) {
      return [memoryStore.plans];
    }
    if (upperSql.includes('FROM INVESTMENTS')) {
      let rows = memoryStore.investments;
      const userId = params[0];

      if (upperSql.includes('USER_ID') && userId !== undefined && userId !== null) {
        rows = rows.filter(i => Number(i.user_id) === Number(userId));
      }

      if (upperSql.includes("STATUS = 'ACTIVE'") || upperSql.includes("STATUS='ACTIVE'")) {
        rows = rows.filter(i => i.status === 'ACTIVE');
      }

      rows = rows.map(i => {
        const plan = memoryStore.plans.find(p => Number(p.id) === Number(i.plan_id)) || {};
        const user = memoryStore.users.find(u => Number(u.id) === Number(i.user_id)) || {};
        return { 
          ...i, 
          plan_name: plan.name || '22 Day Growth Plan',
          duration_days: plan.duration_days || 22,
          return_percentage: plan.return_percentage || 22.0,
          user_name: user.name || 'Investor',
          user_email: user.email || ''
        };
      }).sort((a, b) => b.id - a.id);

      return [rows];
    }
    if (upperSql.includes('FROM TRANSACTIONS WHERE USER_ID')) {
      const userId = params[0];
      const rows = memoryStore.transactions
        .filter(t => Number(t.user_id) === Number(userId))
        .sort((a, b) => b.id - a.id);
      return [rows];
    }
    if (upperSql.includes('FROM MARKET_RATES WHERE RATE_DATE')) {
      if (!memoryStore.market_rates) memoryStore.market_rates = [];
      const rateDate = params[0];
      const rows = memoryStore.market_rates.filter(r => r.rate_date === rateDate);
      return [rows];
    }
    if (upperSql.includes('FROM MARKET_RATES')) {
      if (!memoryStore.market_rates) memoryStore.market_rates = [];
      const rows = [...memoryStore.market_rates].sort((a, b) => b.id - a.id);
      return [rows];
    }
  }

  return [[]];
}

async function initDB() {
  loadJsonStore();
}

module.exports = {
  query,
  initDB
};
