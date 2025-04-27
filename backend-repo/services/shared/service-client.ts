/**
 * Service Client for Inter-service Communication
 * 
 * This module provides a client for making API requests between microservices.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import config from './config';

// Available microservices
export enum Service {
  API_GATEWAY = 'apiGateway',
  USER_SERVICE = 'userService',
  PRODUCT_SERVICE = 'productService',
  ORDER_SERVICE = 'orderService',
  DELIVERY_SERVICE = 'deliveryService',
  ONDC_SERVICE = 'ondcService',
}

// Type for custom options to include service
interface ServiceRequestOptions extends AxiosRequestConfig {
  service: Service;
}

// Create axios instance for service communication
const serviceAxios: AxiosInstance = axios.create({
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'X-Internal-Service': 'true',
  },
});

// Get the base URL for a service
function getServiceBaseUrl(service: Service): string {
  const serviceUrl = config.services[service];
  
  if (!serviceUrl) {
    throw new Error(`Service URL not configured for: ${service}`);
  }
  
  return serviceUrl;
}

/**
 * Generic request function for service communication
 */
async function request<T = any>(
  method: string,
  path: string,
  data?: any,
  options?: ServiceRequestOptions
): Promise<T> {
  try {
    // Build the full URL
    const serviceUrl = getServiceBaseUrl(options?.service || Service.API_GATEWAY);
    const url = `${serviceUrl}${config.service.apiPrefix}${path}`;
    
    // Make the request
    const response: AxiosResponse<T> = await serviceAxios({
      method,
      url,
      data,
      ...options,
    });
    
    return response.data;
  } catch (error) {
    console.error(`Service request failed: ${method} ${path}`, error);
    throw error;
  }
}

// Export specialized methods for convenience
export const serviceClient = {
  get: <T = any>(path: string, options?: ServiceRequestOptions) => 
    request<T>('GET', path, undefined, options),
  
  post: <T = any>(path: string, data?: any, options?: ServiceRequestOptions) => 
    request<T>('POST', path, data, options),
  
  put: <T = any>(path: string, data?: any, options?: ServiceRequestOptions) => 
    request<T>('PUT', path, data, options),
  
  patch: <T = any>(path: string, data?: any, options?: ServiceRequestOptions) => 
    request<T>('PATCH', path, data, options),
  
  delete: <T = any>(path: string, options?: ServiceRequestOptions) => 
    request<T>('DELETE', path, undefined, options),
};

// Export additional utility methods
export function callUserService<T = any>(method: string, path: string, data?: any): Promise<T> {
  return request<T>(method, path, data, { service: Service.USER_SERVICE });
}

export function callProductService<T = any>(method: string, path: string, data?: any): Promise<T> {
  return request<T>(method, path, data, { service: Service.PRODUCT_SERVICE });
}

export function callOrderService<T = any>(method: string, path: string, data?: any): Promise<T> {
  return request<T>(method, path, data, { service: Service.ORDER_SERVICE });
}

export function callDeliveryService<T = any>(method: string, path: string, data?: any): Promise<T> {
  return request<T>(method, path, data, { service: Service.DELIVERY_SERVICE });
}

export function callOndcService<T = any>(method: string, path: string, data?: any): Promise<T> {
  return request<T>(method, path, data, { service: Service.ONDC_SERVICE });
}

export default serviceClient;