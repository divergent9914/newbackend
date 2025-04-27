// Re-export all shared modules for easier imports
export * from './schema';
export * from './db';
export * from './storage';
export * from './utils';
export * from './service-client';
export * from './event-broker';
export * from './config';

// Default export of configuration
import config from './config';
export default config;