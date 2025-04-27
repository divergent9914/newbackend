import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import config from './config';

/**
 * Enum of service names for type safety
 */
export enum ServiceName {
  API_GATEWAY = 'apiGateway',
  USER = 'userService',
  PRODUCT = 'productService',
  ORDER = 'orderService',
  PAYMENT = 'paymentService',
  DELIVERY = 'deliveryService',
  ONDC = 'ondcService'
}

/**
 * Client for making requests to other microservices
 */
export class ServiceClient {
  /**
   * Get the base URL for a service
   * @param serviceName Service name
   * @returns Base URL for the service
   */
  getServiceUrl(serviceName: ServiceName): string {
    const url = config.services[serviceName];
    if (!url) {
      throw new Error(`Service URL not configured for ${serviceName}`);
    }
    return url;
  }
  
  /**
   * Make a GET request to a service
   * @param serviceName Target service
   * @param path API path (e.g., '/users/1')
   * @param config Axios request config
   * @returns Promise with response
   */
  async get<T = any>(
    serviceName: ServiceName,
    path: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const baseUrl = this.getServiceUrl(serviceName);
    const url = `${baseUrl}${config?.apiPrefix || config.service.apiPrefix}${path}`;
    
    return axios.get<T>(url, config);
  }
  
  /**
   * Make a POST request to a service
   * @param serviceName Target service
   * @param path API path (e.g., '/users')
   * @param data Request body
   * @param config Axios request config
   * @returns Promise with response
   */
  async post<T = any, D = any>(
    serviceName: ServiceName,
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const baseUrl = this.getServiceUrl(serviceName);
    const url = `${baseUrl}${config?.apiPrefix || config.service.apiPrefix}${path}`;
    
    return axios.post<T>(url, data, config);
  }
  
  /**
   * Make a PUT request to a service
   * @param serviceName Target service
   * @param path API path (e.g., '/users/1')
   * @param data Request body
   * @param config Axios request config
   * @returns Promise with response
   */
  async put<T = any, D = any>(
    serviceName: ServiceName,
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const baseUrl = this.getServiceUrl(serviceName);
    const url = `${baseUrl}${config?.apiPrefix || config.service.apiPrefix}${path}`;
    
    return axios.put<T>(url, data, config);
  }
  
  /**
   * Make a PATCH request to a service
   * @param serviceName Target service
   * @param path API path (e.g., '/users/1')
   * @param data Request body
   * @param config Axios request config
   * @returns Promise with response
   */
  async patch<T = any, D = any>(
    serviceName: ServiceName,
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const baseUrl = this.getServiceUrl(serviceName);
    const url = `${baseUrl}${config?.apiPrefix || config.service.apiPrefix}${path}`;
    
    return axios.patch<T>(url, data, config);
  }
  
  /**
   * Make a DELETE request to a service
   * @param serviceName Target service
   * @param path API path (e.g., '/users/1')
   * @param config Axios request config
   * @returns Promise with response
   */
  async delete<T = any>(
    serviceName: ServiceName,
    path: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const baseUrl = this.getServiceUrl(serviceName);
    const url = `${baseUrl}${config?.apiPrefix || config.service.apiPrefix}${path}`;
    
    return axios.delete<T>(url, config);
  }
}