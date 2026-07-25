import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor - Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('self_checkin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Global Error & Auth Expiry Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let title = 'API Error';
    let message = 'An unexpected error occurred while communicating with the server.';

    if (error.code === 'ECONNABORTED') {
      title = 'Request Timeout';
      message = 'The server took too long to respond (timeout after 15 seconds).';
    } else if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        localStorage.removeItem('self_checkin_token');
        localStorage.removeItem('self_checkin_user');
        
        if (!window.location.pathname.includes('/login')) {
          Swal.fire({
            icon: 'warning',
            title: 'Session Expired',
            text: 'Your authentication session has expired. Please sign in again.',
            confirmButtonColor: '#212227'
          }).then(() => {
            window.location.href = '/login';
          });
        }
        return Promise.reject(error);
      }

      if (status === 403) {
        title = 'Access Denied (403)';
        message = 'You do not have permission to perform this action.';
      } else if (status === 409) {
        title = 'Duplicate Conflict (409)';
        message = data?.message || 'A record with this email or registration number already exists.';
      } else if (status === 404) {
        title = 'Resource Not Found (404)';
        message = data?.message || 'The requested resource was not found on the server.';
      } else if (status === 400 && data?.errors) {
        title = 'Validation Error (400)';
        message = Object.entries(data.errors)
          .map(([field, msg]) => `• ${field}: ${msg}`)
          .join('\n');
      } else if (typeof data === 'string') {
        message = data;
      } else if (data && data.message) {
        message = data.message;
      }
    } else if (error.request) {
      title = 'Connection Refused';
      message = 'Unable to connect to the backend server at http://localhost:8080. Please verify Spring Boot is running.';
    }

    console.error(`[API Error ${error.response?.status || ''}] ${title}:`, message);

    if (!error.config?.suppressErrorAlert && error.response?.status !== 401) {
      Swal.fire({
        icon: error.response?.status === 409 ? 'warning' : 'error',
        title: title,
        text: message,
        confirmButtonColor: '#212227',
      });
    }

    return Promise.reject(error);
  }
);

export default api;
