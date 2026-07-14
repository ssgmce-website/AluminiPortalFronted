import axios from 'axios';
import { auth } from '../firebase/firebase';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/v1`,
});

api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    // getIdToken() auto-refreshes if the cached token is within 5 min of expiry,
    // so normal expiry is handled silently here.
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend still rejects a token as expired/invalid (clock skew, edge
// cases), force-refresh once and retry the request transparently.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry && auth.currentUser) {
      original._retry = true;
      try {
        const token = await auth.currentUser.getIdToken(true); // force refresh
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        // refresh failed — fall through and reject
      }
    }
    return Promise.reject(error);
  }
);

export default api;
