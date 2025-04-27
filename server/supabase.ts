import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

// Check for Supabase credentials
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials are not set. Supabase functionality will be limited.');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

// Function to test the Supabase connection
export async function testSupabaseConnection() {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return { connected: false, error: 'Supabase credentials not configured' };
    }
    
    // Just check if we can connect to Supabase without querying a specific table
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    return { connected: true };
  } catch (error) {
    console.error('Supabase connection error:', error);
    return { connected: false, error: (error as Error).message };
  }
}