/**
 * Axios Configuration
 *
 * Configures the HTTP client for communication with the VetFlow backend.
 * Base URL is configured via VITE_API_BASE_URL environment variable.
 */
import axios from 'axios';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vetflow-backend-1oey.onrender.com';

const axiosInstance = axios.create({
  baseURL: VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add user ID header for protected routes
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.id) {
          config.headers['X-User-ID'] = userData.id;
        }
      } catch (e) {
        // Failed to parse user data, continue without user ID
      }
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
