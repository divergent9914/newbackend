/**
 * Utility Functions for the API Services
 * 
 * This module provides common utility functions used across services.
 */

import { Request, Response, NextFunction } from 'express';
import config from './config';

/**
 * Custom error class with HTTP status code
 */
export class ApiError extends Error {
  status: number;
  timestamp: string;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace (for development)
    if (config.isDev) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Format error response to client
 */
export function formatErrorResponse(error: any): Record<string, any> {
  const response = {
    message: error.message || 'An unexpected error occurred',
    status: error.status || 500,
    timestamp: error.timestamp || new Date().toISOString(),
  };
  
  // Include stack trace in development mode
  if (config.isDev && error.stack) {
    response['stack'] = error.stack.split('\n').map((line: string) => line.trim());
  }
  
  return response;
}

/**
 * Async handler to catch errors in async routes
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Add pagination to query results
 */
export function paginate<T>(
  items: T[],
  page: number = 1,
  limit: number = 10
): { items: T[]; pagination: { page: number; limit: number; total: number; pages: number } } {
  const total = items.length;
  const pages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  
  return {
    items: items.slice(offset, offset + limit),
    pagination: {
      page,
      limit,
      total,
      pages,
    },
  };
}

/**
 * Validate if a value is a valid UUID
 */
export function isUUID(value: string): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(value);
}

/**
 * Calculate distance between two coordinates (in kilometers)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Generate a random string
 */
export function generateRandomString(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Get current timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Sanitize an object by removing specified fields
 */
export function sanitize<T extends Record<string, any>>(
  obj: T,
  fieldsToRemove: string[]
): Partial<T> {
  const sanitized = { ...obj };
  
  for (const field of fieldsToRemove) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }
  
  return sanitized;
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  
  return false;
}