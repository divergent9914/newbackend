import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function syncSupabaseUserToBackend(user: any) {
  try {
    // Create or update user in our backend
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAccessToken()}`
      },
      body: JSON.stringify({
        email: user.email,
        username: user.user_metadata?.username || user.email.split('@')[0],
        password: '', // Password is handled by Supabase
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        supabase_id: user.id
      })
    });

    if (!response.ok) {
      console.error('Failed to sync user to backend');
    }
  } catch (error) {
    console.error('Error syncing user to backend:', error);
  }
}

export async function getAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

export async function getUserId(): Promise<number | null> {
  try {
    const token = await getAccessToken();
    if (!token) return null;

    const response = await fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) return null;
    
    const { user } = await response.json();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}
