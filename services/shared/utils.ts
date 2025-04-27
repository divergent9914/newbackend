import { Request, Response, NextFunction } from 'express';

/**
 * Async handler to catch errors in async routes
 * @param fn Async function to wrap
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Error handler middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);
  
  // Default error status and message
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Format the error response
  const errorResponse = {
    error: {
      message,
      status,
      timestamp: new Date().toISOString()
    }
  };
  
  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }
  
  res.status(status).json(errorResponse);
}

/**
 * Create a success response
 * @param data Response data
 * @param message Success message
 */
export function createSuccessResponse(data: any, message?: string) {
  return {
    success: true,
    data,
    message: message || 'Operation successful',
    timestamp: new Date().toISOString()
  };
}

/**
 * Create an error response
 * @param message Error message
 * @param details Error details
 * @param status HTTP status code
 */
export function createErrorResponse(message: string, details?: any, status?: number) {
  return {
    success: false,
    error: {
      message,
      details,
      status: status || 500
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Validate an ID from a request parameter
 * @param id ID to validate
 * @throws Error if ID is invalid
 */
export function validateId(id: string): number {
  const numberId = parseInt(id);
  if (isNaN(numberId)) {
    const error: any = new Error('Invalid ID format');
    error.status = 400;
    throw error;
  }
  return numberId;
}

/**
 * Return a random integer between min and max inclusive
 * @param min Minimum value
 * @param max Maximum value
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sleep for a specified number of milliseconds
 * @param ms Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
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
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * Convert degrees to radians
 * @param deg Degrees
 * @returns Radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format currency amount
 * @param amount Amount to format
 * @param currency Currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Format date
 * @param date Date to format
 * @param options Date format options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date, 
  options: Intl.DateTimeFormatOptions = { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  }
): string {
  return new Intl.DateTimeFormat('en-US', options).format(date);
}