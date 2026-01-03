/**
 * Centralized Axios Instance for React + Vite + Django REST API Integration
 *
 * Features:
 * - Base URL from environment variables (VITE_API_BASE_URL)
 * - JSON headers (Content-Type, Accept)
 * - withCredentials for session cookies
 * - CSRF token injection from cookies
 * - Bearer token from localStorage
 * - Request/Response interceptors
 * - 401 auto-logout + redirect to /login
 * - 403 CSRF refresh + retry
 * - 500 basic error handling
 * - TypeScript support
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Configuration constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Ensure the URL ends with /api for Django backend
const FINAL_API_BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
const AUTH_TOKEN_KEY = 'auth_token';
const IS_DEV = import.meta.env.DEV;
const CSRF_COOKIE_NAME = 'csrftoken';
const CSRF_HEADER_NAME = 'X-CSRFToken';
const LOGIN_PATH = '/login';

/**
 * Get CSRF token from cookies
 * Django sets this automatically via django.middleware.csrf.get_token()
 */
function getCsrfToken(): string | undefined {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${CSRF_COOKIE_NAME}=`))
    ?.split('=')[1];

  return cookieValue;
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Clear authentication token
 */
function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Redirect to login page if not already there
 */
function redirectToLogin(): void {
  if (window.location.pathname !== LOGIN_PATH) {
    window.location.href = LOGIN_PATH;
  }
}

/**
 * Create and configure Axios instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: FINAL_API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Required for Django session cookies and CSRF tokens
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * - Inject CSRF token from cookies (Django CSRF protection)
 * - Add Bearer token from localStorage (if available)
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add CSRF token for state-changing requests (POST, PUT, PATCH, DELETE)
    const csrfToken = getCsrfToken();
    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
      config.headers[CSRF_HEADER_NAME] = csrfToken;
    }

    // Add authentication token if available
    const authToken = getAuthToken();
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handle 401 Unauthorized (auto-logout and redirect)
 * - Handle 403 Forbidden (CSRF refresh and retry)
 * - Handle 500 Server Error (basic logging)
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Authentication failed
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear invalid auth token
      clearAuthToken();

      // Redirect to login page
      redirectToLogin();

      return Promise.reject(error);
    }

    // Handle 403 Forbidden - CSRF token issues or permission denied
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh CSRF token by making a GET request to CSRF endpoint
        // This should trigger Django to set a new CSRF cookie
        await apiClient.get('/csrf-token/');

        // Retry the original request with the new CSRF token
        return apiClient.request(originalRequest);
      } catch (csrfError) {
        // CSRF refresh failed, reject the original error
        console.error('CSRF token refresh failed:', csrfError);
        return Promise.reject(error);
      }
    }

    // Handle 500 Internal Server Error - Log for debugging
    if (error.response?.status === 500) {
      console.error('Internal Server Error:', {
        url: originalRequest.url,
        method: originalRequest.method,
        status: error.response.status,
        data: error.response.data,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * Usage Examples:
 *
 * // Basic GET request
 * import apiClient from '@/services/axios';
 * const response = await apiClient.get('/products/');
 *
 * // POST request with automatic CSRF and auth token injection
 * const newProduct = await apiClient.post('/products/', {
 *   name: 'New Product',
 *   price: 29.99
 * });
 *
 * // Error handling
 * try {
 *   const data = await apiClient.get('/protected-endpoint/');
 * } catch (error) {
 *   if (error.response?.status === 401) {
 *     // User will be automatically redirected to /login
 *   } else if (error.response?.status === 403) {
 *     // CSRF token was refreshed and request retried automatically
 *   }
 * }
 */

