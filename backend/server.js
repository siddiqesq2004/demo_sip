const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initDB, query } = require('./config/db');
const seedDatabase = require('./database/seed');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - Auth: ${req.headers.authorization ? 'Present' : 'None'}`);
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', investmentRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CREDORA API server running smoothly', timestamp: new Date() });
});

// Start Server
async function startServer() {
  try {
    await initDB();

    // Auto seed if empty
    try {
      const [users] = await query('SELECT count(*) as count FROM users');
      const count = users.length > 0 ? (users[0].count || users[0]['count(*)']) : 0;
      if (count === 0) {
        console.log('🌱 Empty database detected. Running initial demo seed...');
        await seedDatabase();
      }
    } catch (e) {
      console.log('Auto-seed check note:', e.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 CREDORA Backend API listening on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
