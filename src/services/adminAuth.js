import axios from 'axios';

// ── Admin session (standalone, NOT Firebase) ────────────────────────────────────
// The admin logs in with an email + password checked against the backend env.
// The backend returns a signed token which we persist and send on admin API
// calls. This is entirely separate from the alumni Firebase session in
// AuthContext — an admin never registers and has no Firebase/MongoDB account.

const TOKEN_KEY = 'adminToken';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/v1`;

export const getAdminToken = () => {
  try { return window.localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

export const isAdminAuthed = () => !!getAdminToken();

// POST the credentials; on success persist the session token.
export const adminLogin = async (email, password) => {
  const { data } = await axios.post(`${API_BASE}/auth/admin/login`, { email, password });
  try {
    window.localStorage.setItem(TOKEN_KEY, data.token);
  } catch { /* storage unavailable — token just won't persist */ }
  return data;
};

export const adminLogout = () => {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore */ }
};
