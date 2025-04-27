/**
 * CORS Configuration for API Gateway
 * 
 * This module defines CORS settings for the API Gateway service.
 */

import cors from 'cors';
import config from '../../../shared/config';

const allowedOrigins = config.service.corsOrigins;

// CORS options configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || config.isDev) {
      return callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
    'X-API-Key',
  ],
  credentials: true,
  // For preflight requests
  optionsSuccessStatus: 204,
  // How long browser should cache CORS response
  maxAge: 3600,
};

export default corsOptions;