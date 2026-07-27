# CREDORA FinTech Platform - Client Presentation MVP

CREDORA is a high-yield working-day growth investment platform. This MVP is designed for client presentations to demonstrate product design, user experience, clean architecture, and technical scalability.

---

## 🌟 Key Features & Highlights

- **Pixel-Perfect Mobile First UI**: Matches the exact design specifications (Deep Emerald `#062E23` theme, Gold Accents `#D4AF37`, rounded cards, bottom tab navigation).
- **Presentation Frame Toggle**: Built-in toggle on desktop view to switch between an authentic iPhone frame and full-width mode.
- **Dynamic Plan Engine**: Investment plans, return percentages, durations, expected returns, and payouts are dynamically loaded from database records.
- **Simulated Payment Gateway**: Instant checkout flow supporting UPI, Bank Transfer, and Simulated Payment Sandbox options, creating transactions and updating portfolio states dynamically.
- **Standardized API Response Format**: All backend endpoints return the uniform JSON structure: `{ success, message, data, errors }`.
- **Admin Management Console**: Dedicated admin interface for monitoring platform metrics, registered users, and active investments.

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **React 18** & **Vite**
- **Tailwind CSS v3** (Custom emerald & gold design system)
- **React Router DOM v6**
- **Axios** (API HTTP Client with JWT interceptors)
- **Context API** (`AuthContext` for JWT state)
- **Lucide React Icons**

### Backend
- **Node.js** & **Express.js**
- **JWT (`jsonwebtoken`)** Authentication
- **`bcryptjs`** Password Hashing
- **`mysql2`** Database Driver with automatic SQLite zero-config fallback mode
- **Clean Architecture**: Controller - Service - Model pattern

---

## 📁 Project Structure

```
c:\Demo/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database pool & zero-config connection
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── investmentController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT Bearer token authentication
│   ├── models/
│   │   └── index.js              # MySQL queries & model definitions
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── investmentRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── adminService.js
│   │   ├── investmentService.js
│   │   └── userService.js
│   ├── database/
│   │   ├── schema.sql            # MySQL Database DDL
│   │   └── seed.js               # Demo data seeder script
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/           # 13 Reusable UI primitives
│   │   │   ├── Loader.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   ├── MobileFrameToggle.jsx
│   │   │   ├── PaymentModal.jsx
│   │   │   └── SuccessModal.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── pages/                # 13 Phase-1 Screens
│   │   │   ├── SplashPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── InvestmentPlansPage.jsx
│   │   │   ├── InvestmentDetailsPage.jsx
│   │   │   ├── InvestPage.jsx
│   │   │   ├── PortfolioPage.jsx
│   │   │   ├── ActivityPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── AdminLoginPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── AdminUsersPage.jsx
│   │   │   └── AdminInvestmentsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── ecosystem.config.js           # PM2 configuration for VPS
├── nginx.conf                    # Nginx Reverse Proxy config
└── README.md
```

---

## ⚡ Quick Start (Runnable Out of the Box)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Install Dependencies
Run from the root directory:
```bash
npm install
```

### 2. Configure Environment (Optional)
By default, the backend runs out-of-the-box in zero-config mode. To use a local MySQL server, edit `backend/.env`:
```env
DB_MODE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=credora_db
DB_PORT=3306
```

### 3. Run Seed Data
```bash
npm run seed
```

### 4. Start Development Servers
```bash
npm run dev
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## 🔑 Demo Credentials

### User Demo Account
- **Email**: `anishp@email.com`
- **Password**: `password123`
- **Portfolio Value**: ₹1,25,430.00
- **Invested Amount**: ₹1,06,510.00
- **Total Returns**: ₹18,920.00

### Admin Demo Account
- **Email**: `admin@credora.com`
- **Password**: `admin123`

---

## 📡 API Endpoints Documentation

All endpoints return JSON in the standardized response format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "errors": null
}
```

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User JWT Login | Public |
| `GET` | `/api/dashboard` | Dashboard Portfolio & Active Cycle | User Token |
| `GET` | `/api/plans` | Fetch Available Investment Plans | Public |
| `POST` | `/api/invest` | Process Simulated Investment | User Token |
| `GET` | `/api/portfolio` | Fetch User Portfolio Breakdown | User Token |
| `GET` | `/api/activity` | Fetch Date-Grouped Activity Feed | User Token |
| `GET` | `/api/profile` | Fetch User Profile & Account Summary | User Token |
| `POST` | `/api/admin/login` | Admin JWT Login | Public |
| `GET` | `/api/admin/users` | Fetch All Users (Admin) | Admin Token |
| `GET` | `/api/admin/investments` | Fetch All Investments (Admin) | Admin Token |

---

## 🚀 Production VPS Deployment (Hostinger / Linux)

### 1. Build Frontend
```bash
npm run build
```

### 2. Start PM2 Process Manager
```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

### 3. Configure Nginx
Copy `nginx.conf` to `/etc/nginx/sites-available/credora` and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/credora /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
