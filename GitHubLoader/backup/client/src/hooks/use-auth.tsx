import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, syncSupabaseUserToBackend } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // Check if user is already logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        try {
          // Fetch user data from our backend
          const response = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          
          if (response.ok) {
            const { user: userData } = await response.json();
            setUser(userData);
          } else {
            // If user doesn't exist in our backend but exists in Supabase,
            // create the user in our backend
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();
            if (supabaseUser) {
              await syncSupabaseUserToBackend(supabaseUser);
              // Fetch user data again
              const retryResponse = await fetch('/api/users/me', {
                headers: {
                  'Authorization': `Bearer ${session.access_token}`
                }
              });
              
              if (retryResponse.ok) {
                const { user: userData } = await retryResponse.json();
                setUser(userData);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      
      setIsLoading(false);
      
      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            // User signed in, fetch user data from our backend
            try {
              const response = await fetch('/api/users/me', {
                headers: {
                  'Authorization': `Bearer ${session.access_token}`
                }
              });
              
              if (response.ok) {
                const { user: userData } = await response.json();
                setUser(userData);
              } else {
                // If user doesn't exist in our backend, create the user
                const { data: { user: supabaseUser } } = await supabase.auth.getUser();
                if (supabaseUser) {
                  await syncSupabaseUserToBackend(supabaseUser);
                  // Fetch user data again
                  const retryResponse = await fetch('/api/users/me', {
                    headers: {
                      'Authorization': `Bearer ${session.access_token}`
                    }
                  });
                  
                  if (retryResponse.ok) {
                    const { user: userData } = await retryResponse.json();
                    setUser(userData);
                  }
                }
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          } else if (event === 'SIGNED_OUT') {
            // User signed out
            setUser(null);
            
            // Clear all queries when user logs out
            queryClient.clear();
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw new Error(error.message);
    }
  };

  // Register function
  const register = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Sync to our backend
    if (data.user) {
      try {
        await syncSupabaseUserToBackend({
          ...data.user,
          email,
          user_metadata: { username }
        });
      } catch (error) {
        console.error("Error syncing user to backend:", error);
      }
    }
  };

  // Logout function
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
    
    setUser(null);
    
    // Clear all queries when user logs out
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
