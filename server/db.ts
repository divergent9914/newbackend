import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

// Configure neon to use the ws package for WebSocket connections
neonConfig.webSocketConstructor = ws;

// Check for database URL
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Database functionality will be limited.');
}

// Create connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Function to test the database connection
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    return { connected: true, timestamp: result.rows[0].now };
  } catch (error) {
    console.error('Database connection error:', error);
    return { connected: false, error: (error as Error).message };
  }
}