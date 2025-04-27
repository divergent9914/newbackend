/**
 * Configuration Module
 * 
 * This module centralizes configuration loading from environment variables.
 * It provides a single source of truth for all configuration settings.
 */

import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file if present
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Environment
const ENV = process.env.NODE_ENV || 'development';
const isDev = ENV === 'development';
const isProd = ENV === 'production';
const isTest = ENV === 'test';

// Set application version from package.json
const version = process.env.npm_package_version || '1.0.0';

// Service configuration
const port = process.env.PORT || 3000;
const apiPrefix = process.env.API_PREFIX || '/api';
const logLevel = process.env.LOG_LEVEL || 'info';
const corsOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');

// Service URLs (for inter-service communication)
const services = {
  apiGateway: process.env.API_GATEWAY_URL || 'http://localhost:3000',
  userService: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  productService: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
  orderService: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
  deliveryService: process.env.DELIVERY_SERVICE_URL || 'http://localhost:3004',
  ondcService: process.env.ONDC_SERVICE_URL || 'http://localhost:3005',
};

// Database
const db = {
  url: process.env.DATABASE_URL,
};

// Authentication
const auth = {
  jwtSecret: process.env.JWT_SECRET || 'default-development-jwt-secret',
  jwtExpiry: parseInt(process.env.JWT_EXPIRY || '86400', 10),
};

// Supabase
const supabase = {
  url: process.env.SUPABASE_URL,
  apiKey: process.env.SUPABASE_API_KEY,
};

// Stripe
const stripe = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
};

// ONDC
const ondc = {
  subscriberId: process.env.ONDC_SUBSCRIBER_ID,
  subscriberUrl: process.env.ONDC_SUBSCRIBER_URL,
  registryUrl: process.env.ONDC_REGISTRY_URL,
  encryptionPrivateKey: process.env.ONDC_ENCRYPTION_PRIVATE_KEY,
  signingPrivateKey: process.env.ONDC_SIGNING_PRIVATE_KEY,
};

// Delivery
const delivery = {
  defaultLatitude: parseFloat(process.env.DEFAULT_LATITUDE || '26.7271012'),
  defaultLongitude: parseFloat(process.env.DEFAULT_LONGITUDE || '88.3952861'),
  maxDistance: parseFloat(process.env.MAX_DELIVERY_DISTANCE || '10'),
};

// Exported configuration object
const config = {
  env: ENV,
  isDev,
  isProd,
  isTest,
  version,
  service: {
    port,
    apiPrefix,
    logLevel,
    corsOrigins,
  },
  services,
  db,
  auth,
  supabase,
  stripe,
  ondc,
  delivery,
};

// Validate critical config items in production
if (isProd) {
  // Database URL is required in production
  if (!config.db.url) {
    throw new Error('DATABASE_URL is required in production');
  }
  
  // JWT secret should not be the default in production
  if (config.auth.jwtSecret === 'default-development-jwt-secret') {
    throw new Error('JWT_SECRET is required in production');
  }
  
  // Validate CORS origins in production
  if (config.service.corsOrigins.length === 0) {
    throw new Error('FRONTEND_URL is required in production');
  }
}

export default config;