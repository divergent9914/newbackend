import { QueryClient, QueryFunction } from "@tanstack/react-query";
import api from './api';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Updated apiRequest to use axios-based API client
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    let response;
    
    switch(method.toUpperCase()) {
      case 'GET':
        response = await api.get(url);
        break;
      case 'POST':
        response = await api.post(url, data);
        break;
      case 'PUT':
        response = await api.put(url, data);
        break;
      case 'DELETE':
        response = await api.delete(url);
        break;
      case 'PATCH':
        response = await api.patch(url, data);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    // Convert axios response to fetch Response
    const fetchResponse = new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers as any)
    });
    
    await throwIfResNotOk(fetchResponse);
    return fetchResponse;
  } catch (error: any) {
    // Handle axios errors
    if (error.response) {
      // Create a fetch Response from axios error response
      const errorResponse = new Response(JSON.stringify(error.response.data), {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: new Headers(error.response.headers as any)
      });
      
      // This will throw the properly formatted error
      await throwIfResNotOk(errorResponse);
      return errorResponse; // This line won't be reached but TS needs it
    }
    
    // Network errors or other issues
    throw new Error(error.message || 'Network error');
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const response = await api.get(queryKey[0] as string);
      
      // Convert axios response to fetch Response
      const res = new Response(JSON.stringify(response.data), {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers as any)
      });
      
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }
      
      await throwIfResNotOk(res);
      return response.data; // Axios already parses JSON
    } catch (error: any) {
      if (error.response && error.response.status === 401 && unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
