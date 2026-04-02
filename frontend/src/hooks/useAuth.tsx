'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  image: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load initial data from storage
  useEffect(() => {
    const savedToken = Cookies.get('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('user');
        }
      }
      fetchProfile(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const userData = JSON.parse(text);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } else if (res.status === 401) {
        // Only logout if the token is explicitly invalid/expired
        console.warn('Session expired');
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch profile (network error)', err);
      // Don't logout on network errors, keep using the cached user data
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    Cookies.set('token', newToken, { expires: 7, path: '/' });
    setToken(newToken);
    fetchProfile(newToken);
  };

  const logout = () => {
    Cookies.remove('token', { path: '/' });
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
