/**
 * Shared configuration for all microservices
 */

// Get environment variables
const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';

// Service configuration
const serviceConfig = {
  port: process.env.PORT || 3000,
  apiPrefix: '/api',
  corsOrigins: isDev 
    ? ['http://localhost:5173', 'http://localhost:3000'] 
    : [process.env.CLIENT_URL || ''],
};

// Service URLs
const serviceUrls = {
  apiGateway: process.env.API_GATEWAY_URL || 'http://localhost:3000',
  userService: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  productService: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
  orderService: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
  paymentService: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
  deliveryService: process.env.DELIVERY_SERVICE_URL || 'http://localhost:3005',
  ondcService: process.env.ONDC_SERVICE_URL || 'http://localhost:3006',
};

// Database configuration
const dbConfig = {
  url: process.env.DATABASE_URL || '',
  poolSize: 10,
};

// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'development-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};

// ONDC configuration
const ondcConfig = {
  subscriberId: process.env.ONDC_SUBSCRIBER_ID || '',
  subscriberUrl: process.env.ONDC_SUBSCRIBER_URL || '',
  registryUrl: process.env.ONDC_REGISTRY_URL || '',
  encryptionPrivateKey: process.env.ONDC_ENCRYPTION_PRIVATE_KEY || '',
  signingPrivateKey: process.env.ONDC_SIGNING_PRIVATE_KEY || '',
};

// Delivery configuration
const deliveryConfig = {
  // Default location set to AAMIS, Hakimapara, Siliguri
  defaultLatitude: parseFloat(process.env.DEFAULT_LATITUDE || '26.7271012'),
  defaultLongitude: parseFloat(process.env.DEFAULT_LONGITUDE || '88.3952861'),
  maxDeliveryDistance: parseFloat(process.env.MAX_DELIVERY_DISTANCE || '10'), // in kilometers
};

// Payment configuration
const paymentConfig = {
  stripeApiKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};

// Export the configuration
export default {
  env,
  isDev,
  version: '1.0.0',
  service: serviceConfig,
  services: serviceUrls,
  db: dbConfig,
  jwt: jwtConfig,
  ondc: ondcConfig,
  delivery: deliveryConfig,
  payment: paymentConfig,
};