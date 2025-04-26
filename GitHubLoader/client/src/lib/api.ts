import axios from 'axios';

// Base URL for the API
const apiBaseUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api' 
  : 'https://api.yourdomain.com/api';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 (Unauthorized) errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Export the API instance
export default api;