import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';
import config from './config';
import ws from 'ws';

// Configure NeonDB to use WebSockets in serverless environments
neonConfig.webSocketConstructor = ws;

// Get database connection string from environment or config
const connectionString = config.db.url;

if (!connectionString) {
  throw new Error('Database connection string not found in configuration');
}

// Create connection pool
export const pool = new Pool({ 
  connectionString,
  max: config.db.poolSize
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });

/**
 * Test the database connection
 * @returns True if connection is successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    console.log('Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Close the database connection pool
 */
export async function closeDatabase(): Promise<void> {
  try {
    await pool.end();
    console.log('Database connection pool closed');
  } catch (error) {
    console.error('Error closing database connection pool:', error);
  }
}