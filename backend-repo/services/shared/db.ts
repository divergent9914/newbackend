/**
 * Database Connection Module
 * 
 * This module provides database connection and utility functions.
 * It supports both Postgres and Supabase connections.
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { createClient } from '@supabase/supabase-js';
import config from './config';

// PostgreSQL connection pool
let pool: Pool | null = null;

// Supabase client
let supabaseClient: any = null;

/**
 * Get or create the database connection pool
 */
function getPool(): Pool {
  if (!pool) {
    if (!config.db.url) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    pool = new Pool({
      connectionString: config.db.url,
      ssl: config.isProd ? { rejectUnauthorized: true } : false,
      max: 20,
      idleTimeoutMillis: 30000,
    });
    
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  
  return pool;
}

/**
 * Get or create the Supabase client
 */
function getSupabaseClient() {
  if (!supabaseClient) {
    if (!config.supabase.url || !config.supabase.apiKey) {
      throw new Error('SUPABASE_URL and SUPABASE_API_KEY environment variables are required');
    }
    
    supabaseClient = createClient(config.supabase.url, config.supabase.apiKey);
  }
  
  return supabaseClient;
}

/**
 * Execute a database query with parameters
 */
async function execute<T = any>(
  query: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query<T>(query, params);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Get a database client for transaction support
 */
async function getClient(): Promise<PoolClient> {
  return getPool().connect();
}

/**
 * Close all database connections
 */
async function close(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Test database connection
 */
async function testConnection(): Promise<boolean> {
  try {
    const result = await execute('SELECT NOW()');
    return result && result.rowCount > 0;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Test Supabase connection
 */
async function testSupabase(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}

// Export the database interface
export const db = {
  execute,
  getClient,
  close,
  testConnection,
  getPool,
  getSupabaseClient,
  testSupabase,
};