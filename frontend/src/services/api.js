import axios from 'axios';

// Self-migrating old localStorage key to split keys to prevent session collisions
try {
  const oldToken = window.localStorage.getItem('credora_token');
  if (oldToken) {
    if (window.localStorage.getItem('credora_user')) {
      window.localStorage.setItem('credora_user_token', oldToken);
    }
    if (window.localStorage.getItem('credora_admin')) {
      window.localStorage.setItem('credora_admin_token', oldToken);
    }
    window.localStorage.removeItem('credora_token');
  }
} catch (e) {
  console.error('Session migration failed:', e);
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const isAdminRequest = config.url.startsWith('/admin');
  let token = isAdminRequest 
    ? localStorage.getItem('credora_admin_token') 
    : localStorage.getItem('credora_user_token');
  
  if (!token) {
    token = localStorage.getItem('credora_token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('credora_token');
      localStorage.removeItem('credora_user');
      localStorage.removeItem('credora_admin');
      localStorage.removeItem('credora_user_token');
      localStorage.removeItem('credora_admin_token');
    }
    const errorMsg = error.response?.data?.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

export default api;
