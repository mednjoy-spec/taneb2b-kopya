import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthUser extends User {
  profile?: Profile;
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('Auth initialization timeout, setting loading to false');
            setLoading(false);
          }
        }, 2000);

        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
          console.log('Supabase not configured, using demo mode');
          if (mounted) {
            clearTimeout(timeoutId);
            setLoading(false);
          }
          return;
        }

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (error.message && error.message.includes('Refresh Token Not Found')) {
            console.warn('Session expired, user will be logged out locally:', error.message);
          } else {
            console.error('Error getting session:', error);
          }
          if (mounted) {
            clearTimeout(timeoutId);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          clearTimeout(timeoutId);
          setSession(session);
          if (session?.user) {
            await fetchUserProfile(session.user);
          } else {
            setLoading(false);
          }
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          
          setSession(session);
          if (session?.user) {
            await fetchUserProfile(session.user);
          } else {
            setUser(null);
            setLoading(false);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (timeoutId) {
        console.log('Auth state change:', event, session?.user?.id);
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    let timeoutId: NodeJS.Timeout;
    
    try {
      // Set timeout for profile fetch
      timeoutId = setTimeout(() => {
        console.log('⚠️ Profile fetch timeout, using auth user without profile');
        setUser({
          ...authUser,
          profile: undefined,
        });
        setLoading(false);
      }, 3000); // Increased timeout

      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        // Use auth user without profile for demo mode
        clearTimeout(timeoutId);
        console.log('🔧 Supabase not configured, using demo mode');
        setUser({
          ...authUser,
          profile: undefined,
        });
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching profile for user:', authUser.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      clearTimeout(timeoutId);

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching profile:', error);
      } else {
        console.log('✅ Profile fetched successfully:', profile);
      }


      setUser({
        ...authUser,
        profile: profile || undefined,
      });
    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error);
      if (timeoutId) clearTimeout(timeoutId);
      setUser({
        ...authUser,
        profile: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
      throw new Error('Supabase yapılandırması tamamlanmamış. Lütfen veritabanı bağlantısını kurun.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signUp = async (email: string, password: string, userData: {
    name: string;
    role: 'admin' | 'manager' | 'supplier' | 'customer';
    company?: string;
    phone?: string;
    address?: string;
    city?: string;
  }) => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
      throw new Error('Supabase yapılandırması tamamlanmamış. Lütfen veritabanı bağlantısını kurun.');
    }

    console.log('Starting user registration for:', email);

    // Include user metadata in signup with proper structure
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
          company: userData.company,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          email: email // Ensure email is in metadata
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      throw authError;
    }

    console.log('Auth signup successful:', authData);

    // Wait longer for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (authData.user) {
      try {
        // Check if profile was created by trigger
        console.log('Checking if profile was created by trigger');
        
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking profile:', checkError);
        }

        if (existingProfile) {
          console.log('Profile exists, updating with additional data:', existingProfile);
          
          // Update the profile with additional data
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              company: userData.company || null,
              phone: userData.phone || null,
              address: userData.address || null,
              city: userData.city || null,
            })
            .eq('id', authData.user.id);

          if (updateError) {
            console.error('Profile update error:', updateError);
          } else {
            console.log('Profile updated successfully');
          }
        } else {
          console.log('Profile not found, creating manually');
          
          // Create profile manually if trigger failed
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: email,
              name: userData.name,
              role: userData.role,
              company: userData.company || null,
              phone: userData.phone || null,
              address: userData.address || null,
              city: userData.city || null,
            });

          if (insertError) {
            console.error('Manual profile creation error:', insertError);
            throw new Error(`Profile oluşturulamadı: ${insertError.message}`);
          } else {
            console.log('Profile created manually');
          }
        }
        
      } catch (error) {
        console.error('Profile handling failed:', error);
        throw error;
      }
    }

    return authData;
  };

  const signOut = async () => {
    try {
      // Clear local session first
      setUser(null);
      setSession(null);
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Sign out error (non-critical):', error);
      }
    } catch (error) {
      console.warn('Sign out failed (non-critical):', error);
      // Don't throw error for logout failures - user is logged out locally
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    setUser({
      ...user,
      profile: data,
    });

    return data;
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
}