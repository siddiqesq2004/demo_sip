-- Supabase PostgreSQL Schema & Seeding for CREDORA FinTech

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subadmins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(100) DEFAULT 'SUB_ADMIN',
  permissions TEXT DEFAULT 'ALL',
  status VARCHAR(50) DEFAULT 'FREE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  total_value NUMERIC(15,2) DEFAULT 0.00,
  invested_amount NUMERIC(15,2) DEFAULT 0.00,
  total_returns NUMERIC(15,2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  return_percentage NUMERIC(5,2) NOT NULL,
  duration_days INT NOT NULL,
  working_days_only INT DEFAULT 1,
  min_amount NUMERIC(15,2) NOT NULL,
  description TEXT,
  benefits TEXT
);

CREATE TABLE IF NOT EXISTS support_chats (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  subadmin_id INT NULL,
  subadmin_name VARCHAR(255) DEFAULT 'Awaiting Free Official',
  status VARCHAR(50) DEFAULT 'IN_CONVERSATION',
  initial_query TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_messages (
  id SERIAL PRIMARY KEY,
  chat_id INT REFERENCES support_chats(id) ON DELETE CASCADE,
  sender_type VARCHAR(50) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  bank_name VARCHAR(255),
  account_no VARCHAR(255),
  ifsc VARCHAR(100),
  status VARCHAR(50) DEFAULT 'PENDING',
  processed_by_subadmin_id INT NULL,
  processed_by_name VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed Default Sub-Admins
INSERT INTO subadmins (id, name, email, password, role, permissions, status) VALUES
(1, 'System Super Admin', 'admin@credora.com', '$2b$10$3YmP021b3xR4s659O57eTe9c4v.Y7S53Yg/2N4X.X0u8b959O57eT', 'SUPER_ADMIN', 'ALL', 'FREE'),
(2, 'Vijay', 'mdabsdq2004@gmail.com', '$2b$10$3YmP021b3xR4s659O57eTe9c4v.Y7S53Yg/2N4X.X0u8b959O57eT', 'SUPPORT_AGENT', 'SUPPORT_CHAT_ONLY', 'FREE'),
(3, 'Neha Gupta', 'neha.subadmin@credora.com', '$2b$10$3YmP021b3xR4s659O57eTe9c4v.Y7S53Yg/2N4X.X0u8b959O57eT', 'SUPPORT_AGENT', 'SUPPORT_CHAT_ONLY', 'FREE'),
(4, 'Siddiqe', 'siddiqesq2004@gmail.com', '$2b$10$3YmP021b3xR4s659O57eTe9c4v.Y7S53Yg/2N4X.X0u8b959O57eT', 'WITHDRAWAL_APPROVER', 'WITHDRAWAL_APPROVAL_ONLY', 'FREE'),
(5, 'Karan Singh', 'karan.subadmin@credora.com', '$2b$10$3YmP021b3xR4s659O57eTe9c4v.Y7S53Yg/2N4X.X0u8b959O57eT', 'WITHDRAWAL_APPROVER', 'WITHDRAWAL_APPROVAL_ONLY', 'FREE'),
(6, 'Amit Kumar', 'amit.subadmin@credora.com', '$2b$10$3YmP021b3xR4s659O57eTe9c4v.Y7S53Yg/2N4X.X0u8b959O57eT', 'FULL_SUBADMIN', 'ALL', 'FREE')
ON CONFLICT (email) DO NOTHING;

-- Seed Default Investor User (Anish P)
INSERT INTO users (id, name, email, password, is_verified) VALUES
(1, 'Anish P', 'anishp@email.com', '$2b$10$3YmP021b3xR4s659O57eTe9c4v.Y7S53Yg/2N4X.X0u8b959O57eT', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO portfolio (user_id, total_value, invested_amount, total_returns) VALUES
(1, 125430.00, 106510.00, 18920.00)
ON CONFLICT DO NOTHING;
