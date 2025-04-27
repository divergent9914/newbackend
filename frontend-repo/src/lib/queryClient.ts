import { QueryClient } from '@tanstack/react-query'

// Get API URL from environment variables, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  params?: Record<string, string>
  headers?: HeadersInit
  credentials?: RequestCredentials
}

// Original function that automatically parses JSON responses
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, params, headers = {}, credentials = 'include' } = options

  // Ensure URL starts with API_URL if it doesn't already include http(s)://
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;

  // Add query parameters to URL if provided
  let finalUrl = fullUrl;
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value)
    })
    finalUrl = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}${searchParams.toString()}`
  }

  // Setup request options
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials, // Include credentials for cookies/session
  }

  // Add body if provided
  if (body) {
    requestOptions.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(finalUrl, requestOptions)

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()

      if (!response.ok) {
        const error = new Error(data.message || 'API request failed')
        console.error(`API Error (${response.status}):`, data);
        throw Object.assign(error, { data, status: response.status })
      }

      return data
    } else {
      const text = await response.text()

      if (!response.ok) {
        const error = new Error(text || 'API request failed')
        console.error(`API Error (${response.status}):`, text);
        throw Object.assign(error, { text, status: response.status })
      }

      return text as unknown as T
    }
  } catch (error) {
    console.error('API Request error:', error);
    throw error;
  }
}

// Method-specific convenience functions
export function get<T = any>(url: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

export function post<T = any>(url: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'POST', body });
}

export function put<T = any>(url: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'PUT', body });
}

export function del<T = any>(url: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}

// Lower-level API request that returns the raw response
export async function apiRequestRaw(
  method: string,
  url: string,
  body?: any,
  credentials: RequestCredentials = 'include'
): Promise<Response> {
  // Ensure URL starts with API_URL if it doesn't already include http(s)://
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  return fetch(fullUrl, requestOptions);
}