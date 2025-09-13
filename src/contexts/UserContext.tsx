import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseAuth, type AuthUser } from '../hooks/useSupabaseAuth';

export type User = AuthUser;

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading, signIn, signOut } = useSupabaseAuth();

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const result = await signIn(email, password);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    signOut().catch((error) => {
      console.warn('Logout error (non-critical):', error);
      // Force local logout even if Supabase logout fails
    });
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}