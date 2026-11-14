import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    // Attempt to pull token if stored in localStorage by redux-persist or standalone
    try {
      const persistedAuth = localStorage.getItem('persist:root');
      if (persistedAuth) {
        const parsed = JSON.parse(persistedAuth);
        const auth = JSON.parse(parsed.auth);
        if (auth?.token) {
          config.headers.Authorization = `Bearer ${auth.token}`;
        }
      }
    } catch {
      // ignore parsing error
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
