/**
 * API Client for Frontend
 * 
 * This module provides functions for making API requests to the backend.
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// API request timeout in milliseconds
const REQUEST_TIMEOUT = 30000;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor for handling common response patterns
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        status: 'error',
        message: 'Network error. Please check your internet connection.',
        originalError: error,
      });
    }
    
    // Handle API errors with response
    const errorData = error.response.data as any;
    
    // Return formatted error object
    return Promise.reject({
      status: 'error',
      statusCode: error.response.status,
      message: errorData.message || 'An unexpected error occurred',
      errors: errorData.errors,
      originalError: error,
    });
  }
);

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    
    // Add token to header if available
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// API methods
export const api = {
  /**
   * Make a GET request
   */
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.get(url, config);
    return response.data;
  },
  
  /**
   * Make a POST request
   */
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.post(url, data, config);
    return response.data;
  },
  
  /**
   * Make a PUT request
   */
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.put(url, data, config);
    return response.data;
  },
  
  /**
   * Make a DELETE request
   */
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.delete(url, config);
    return response.data;
  },
  
  /**
   * Make a PATCH request
   */
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.patch(url, data, config);
    return response.data;
  },
  
  /**
   * Set the auth token for requests
   */
  setAuthToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },
  
  /**
   * Clear the auth token
   */
  clearAuthToken: (): void => {
    localStorage.removeItem('auth_token');
  },
  
  /**
   * Get the auth token
   */
  getAuthToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return localStorage.getItem('auth_token') !== null;
  },
};

// API domain-specific functions
export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    
    if (response.token) {
      api.setAuthToken(response.token);
    }
    
    return response;
  },
  
  register: async (userData: { username: string; email: string; password: string }) => {
    return api.post('/auth/register', userData);
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    api.clearAuthToken();
    return response;
  },
  
  getProfile: async () => {
    return api.get('/users/me');
  },
  
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return api.post('/auth/change-password', data);
  },
};

export const productsAPI = {
  getAll: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    return api.get('/products', { params });
  },
  
  getById: async (id: number | string) => {
    return api.get(`/products/${id}`);
  },
  
  getByCategory: async (slug: string, params?: { page?: number; limit?: number }) => {
    return api.get(`/products/category/${slug}`, { params });
  },
  
  getAllCategories: async () => {
    return api.get('/categories');
  },
  
  create: async (productData: any) => {
    return api.post('/products', productData);
  },
  
  update: async (id: number | string, productData: any) => {
    return api.put(`/products/${id}`, productData);
  },
  
  delete: async (id: number | string) => {
    return api.delete(`/products/${id}`);
  },
};

export const ordersAPI = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    return api.get('/orders', { params });
  },
  
  getById: async (id: number | string) => {
    return api.get(`/orders/${id}`);
  },
  
  create: async (orderData: any) => {
    return api.post('/orders', orderData);
  },
  
  updateStatus: async (id: number | string, status: string) => {
    return api.put(`/orders/${id}/status`, { status });
  },
  
  cancel: async (id: number | string, reason?: string) => {
    return api.post(`/orders/${id}/cancel`, { reason });
  },
  
  createPaymentIntent: async (data: { amount: number; currency?: string; metadata?: any }) => {
    return api.post('/orders/payment-intent', data);
  },
};

export const deliveryAPI = {
  getById: async (id: number | string) => {
    return api.get(`/deliveries/${id}`);
  },
  
  getStatus: async (id: number | string) => {
    return api.get(`/deliveries/${id}/status`);
  },
  
  getTracking: async (id: number | string) => {
    return api.get(`/deliveries/${id}/tracking`);
  },
  
  updateLocation: async (id: number | string, location: { latitude: number; longitude: number }) => {
    return api.post(`/deliveries/${id}/location`, location);
  },
  
  markAsComplete: async (id: number | string, data?: { feedback?: string; rating?: number }) => {
    return api.post(`/deliveries/${id}/complete`, data);
  },
};

export const ondcAPI = {
  search: async (searchData: any) => {
    return api.post('/ondc/search', searchData);
  },
  
  select: async (selectData: any) => {
    return api.post('/ondc/select', selectData);
  },
  
  init: async (initData: any) => {
    return api.post('/ondc/init', initData);
  },
  
  confirm: async (confirmData: any) => {
    return api.post('/ondc/confirm', confirmData);
  },
  
  status: async (statusData: any) => {
    return api.post('/ondc/status', statusData);
  },
  
  cancel: async (cancelData: any) => {
    return api.post('/ondc/cancel', cancelData);
  },
  
  update: async (updateData: any) => {
    return api.post('/ondc/update', updateData);
  },
};

export default api;