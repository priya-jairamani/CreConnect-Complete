/**
 * Central Axios instance.
 *
 * Request interceptor  → attaches the JWT access token.
 * Response interceptor → on 401, attempts a token refresh and retries.
 *
 * TODO: set VITE_API_BASE_URL in .env once the backend is live.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

/* ── Request interceptor – attach bearer token ───────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response interceptor – silent token refresh on 401 ──── */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('cc_refresh_token');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh });
        localStorage.setItem('cc_access_token', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
