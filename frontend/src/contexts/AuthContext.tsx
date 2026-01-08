'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { getUser, getToken, setAuth, clearAuth, isAuthenticated as checkAuth } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  username: string;
  nama: string;
  role: 'admin' | 'superadmin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    const initAuth = () => {
      try {
        console.log('🔄 AuthContext: Initializing auth state...');
        console.log('🌐 Current URL:', window.location.href);
        console.log('📍 Current pathname:', window.location.pathname);

        // Direct localStorage check
        const rawToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const rawUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

        console.log('📦 AuthContext: Raw localStorage data:', {
          token: rawToken ? `EXISTS (${rawToken.substring(0, 20)}...)` : 'MISSING/NULL',
          user: rawUser ? `EXISTS (length: ${rawUser.length})` : 'MISSING/NULL'
        });

        const token = getToken();
        const savedUser = getUser();

        console.log('📦 AuthContext: After getToken/getUser:', {
          token: !!token,
          user: !!savedUser,
          userData: savedUser
        });

        if (checkAuth() && savedUser) {
          console.log('✅ AuthContext: User authenticated:', savedUser.username);
          setUser(savedUser);
        } else {
          console.log('❌ AuthContext: No valid auth data');
        }
      } catch (error) {
        console.error('❌ AuthContext: Error initializing auth:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { access_token, user: userData } = response.data;

      // Store auth data securely
      setAuth(access_token, userData);
      setUser(userData);

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error: any) {
      clearAuth();
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'superadmin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
