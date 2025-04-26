import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  params?: Record<string, string>
  headers?: HeadersInit
}

export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, params, headers = {} } = options

  // Add query parameters to URL if provided
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value)
    })
    url = `${url}?${searchParams.toString()}`
  }

  // Setup request options
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  // Add body if provided
  if (body) {
    requestOptions.body = JSON.stringify(body)
  }

  const response = await fetch(url, requestOptions)

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json()

    if (!response.ok) {
      const error = new Error(data.message || 'API request failed')
      throw Object.assign(error, { data, status: response.status })
    }

    return data
  } else {
    const text = await response.text()

    if (!response.ok) {
      const error = new Error(text || 'API request failed')
      throw Object.assign(error, { text, status: response.status })
    }

    return text as unknown as T
  }
}