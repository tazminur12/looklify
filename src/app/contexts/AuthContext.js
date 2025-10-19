'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { isAdmin, isStaff, isCustomer, hasRole } from '../../lib/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
    } else if (status === 'authenticated') {
      setUser(session.user);
      setLoading(false);
    } else {
      setUser(null);
      setLoading(false);
      
      // Debug logging for production issues
      if (process.env.NODE_ENV === 'production') {
        console.log('AuthContext: User not authenticated', {
          status,
          hasSession: !!session,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [session, status]);

  const login = async (provider, credentials) => {
    try {
      if (provider === 'credentials') {
        const result = await signIn('credentials', {
          email: credentials.email,
          password: credentials.password,
          redirect: false,
        });
        return result;
      } else {
        await signIn(provider, { callbackUrl: '/' });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: isAdmin(user?.role),
    isStaff: isStaff(user?.role),
    isCustomer: isCustomer(user?.role),
    hasRole: (role) => hasRole(user?.role, role),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
