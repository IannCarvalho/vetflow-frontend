/**
 * Axios Configuration
 *
 * Configures the HTTP client for communication with the VetFlow backend.
 * Automatically detects production vs development environment.
 * Production backend: https://vetflow-backend-jn55.onrender.com (Render)
 * Development backend: http://localhost:8080 (Local)
 * 
 * Auto-detection: If hostname is not 'localhost', uses production URL
 */
import axios from 'axios';

const PRODUCTION_API_URL = 'https://vetflow-backend-jn55.onrender.com';
const DEVELOPMENT_API_URL = 'http://localhost:8080';

// Resolve the backend URL in this order:
// 1. Explicit VITE_API_BASE_URL from the environment (.env)
// 2. Auto-detect: localhost hostname -> local backend, otherwise -> production
function resolveBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv) {
    return fromEnv;
  }

  const isLocalhost =
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname);

  return isLocalhost ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;
}

const resolvedBaseUrl = resolveBaseUrl();

// Helps confirm in the browser console which backend the app is talking to.
console.info('[VetFlow] API baseURL:', resolvedBaseUrl);

const axiosInstance = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include the JWT.
// The backend derives the user identity from the token itself, so no
// client-provided user id header is sent (that would be spoofable).
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
