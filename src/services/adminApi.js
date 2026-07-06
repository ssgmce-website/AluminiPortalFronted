import axios from 'axios';
import { getAdminToken, adminLogout } from './adminAuth';

// Axios instance for the admin portal. Unlike services/api.js (which attaches a
// Firebase ID token), this attaches the standalone admin session token.
const adminApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/v1`,
});

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the admin token is missing/expired/invalid, clear it and bounce to login.
adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      adminLogout();
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.assign('/admin/login');
      }
    }
    return Promise.reject(error);
  }
);

export default adminApi;
