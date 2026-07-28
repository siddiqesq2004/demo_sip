import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PhoneFrame from './components/PhoneFrame';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// User Pages
import SplashPage from './pages/SplashPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InvestmentPlansPage from './pages/InvestmentPlansPage';
import InvestmentDetailsPage from './pages/InvestmentDetailsPage';
import InvestPage from './pages/InvestPage';
import PortfolioPage from './pages/PortfolioPage';
import ActivityPage from './pages/ActivityPage';
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';
import LeaderboardPage from './pages/LeaderboardPage';

// Admin Pages
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminInvestmentsPage from './pages/AdminInvestmentsPage';
import AdminSubAdminsPage from './pages/AdminSubAdminsPage';
import AdminWithdrawalsPage from './pages/AdminWithdrawalsPage';
import AdminSupportPage from './pages/AdminSupportPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - wrapped in PhoneFrame */}
          <Route path="/splash" element={<PhoneFrame><SplashPage /></PhoneFrame>} />
          <Route path="/login" element={<PhoneFrame><LoginPage /></PhoneFrame>} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* User Protected App Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute role="user">
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="plans" element={<InvestmentPlansPage />} />
            <Route path="plans/:id" element={<InvestmentDetailsPage />} />
            <Route path="invest" element={<InvestPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Protected Console Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="investments" element={<AdminInvestmentsPage />} />
            <Route path="subadmins" element={<AdminSubAdminsPage />} />
            <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
            <Route path="support" element={<AdminSupportPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
