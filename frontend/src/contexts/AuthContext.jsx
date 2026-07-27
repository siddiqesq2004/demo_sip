import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('credora_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('credora_admin');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('credora_admin_token') || localStorage.getItem('credora_user_token') || null;
  });
  const [loading, setLoading] = useState(false);

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('credora_user_token', res.data.token);
        localStorage.setItem('credora_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { email, password });
      if (res.success && res.data) {
        setToken(res.data.token);
        setAdmin(res.data.admin);
        localStorage.setItem('credora_admin_token', res.data.token);
        localStorage.setItem('credora_admin', JSON.stringify(res.data.admin));
        if (res.data.admin?.email && res.data.admin?.status) {
          localStorage.setItem(`subadmin_status_${res.data.admin.email.toLowerCase()}`, res.data.admin.status.toUpperCase());
        }
        return { success: true, admin: res.data.admin };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateAdminStatus = (newStatus) => {
    if (admin) {
      const updated = { ...admin, status: newStatus };
      setAdmin(updated);
      localStorage.setItem('credora_admin', JSON.stringify(updated));
      if (admin.email) {
        localStorage.setItem(`subadmin_status_${admin.email.toLowerCase()}`, newStatus);
      }
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('credora_user_token');
    localStorage.removeItem('credora_user');
    if (!localStorage.getItem('credora_admin_token')) {
      setToken(null);
    }
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem('credora_admin_token');
    localStorage.removeItem('credora_admin');
    if (!localStorage.getItem('credora_user_token')) {
      setToken(null);
    }
  };

  const logout = () => {
    logoutUser();
    logoutAdmin();
  };

  return (
    <AuthContext.Provider value={{ user, admin, token, loginUser, loginAdmin, updateAdminStatus, logout, logoutUser, logoutAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
