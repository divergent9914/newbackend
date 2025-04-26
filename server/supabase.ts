import { createClient } from '@supabase/supabase-js';
import { log } from './vite';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  log('Supabase URL or API key not found in environment variables', 'supabase');
}

// Create a Supabase client
const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      persistSession: false,
    }
  }
);

// Test connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      log(`Supabase connection error: ${error.message}`, 'supabase');
      return false;
    }
    
    log('Supabase connection successful', 'supabase');
    return true;
  } catch (err) {
    log(`Supabase connection error: ${err instanceof Error ? err.message : String(err)}`, 'supabase');
    return false;
  }
}

export { supabase };