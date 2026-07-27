import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

export default function ProtectedRoute({ children, role = 'user' }) {
  const { user, admin, token, loading } = useAuth();

  if (loading) {
    return <Loader label="Verifying session..." />;
  }

  if (!token) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />;
  }

  if (role === 'admin' && !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (role === 'user' && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
