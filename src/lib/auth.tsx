'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'artisan' | 'admin' | 'super_admin';
  artisan?: { id: string; businessName: string; status: string } | null;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'cc_token';

/**
 * Provides authentication state and actions to the component tree.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get<{ data: User }>('/auth/profile')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const fetchProfile = useCallback(async (): Promise<User> => {
    const res = await api.get<{
      data: {
        id: string;
        email: string;
        role: string;
        firstName?: string;
        lastName?: string;
        profile?: { firstName?: string; lastName?: string; avatar?: string | null } | null;
        artisan?: { id: string; businessName: string; status: string } | null;
      };
    }>('/auth/profile');
    const d = res.data;
    return {
      id: d.id,
      email: d.email,
      role: d.role.toLowerCase() as User['role'],
      firstName: d.firstName ?? d.profile?.firstName ?? '',
      lastName: d.lastName ?? d.profile?.lastName ?? '',
      artisan: 'artisan' in d ? (d.artisan ?? null) : undefined,
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const res = await api.post<{ data: { user: User; accessToken: string } }>('/auth/login', payload);
    localStorage.setItem(TOKEN_KEY, res.data.accessToken);
    const profile = await fetchProfile().catch(() => ({
      ...res.data.user,
      role: (res.data.user.role as string).toLowerCase() as User['role'],
      firstName: res.data.user.firstName ?? '',
      lastName: res.data.user.lastName ?? '',
    }));
    setUser(profile);
    return profile;
  }, [fetchProfile]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await api.post<{ data: { user: User; accessToken: string } }>('/auth/register', payload);
    localStorage.setItem(TOKEN_KEY, res.data.accessToken);
    const profile = await fetchProfile().catch(() => ({
      ...res.data.user,
      role: 'customer' as User['role'],
      firstName: payload.firstName,
      lastName: payload.lastName,
    }));
    setUser(profile);
  }, [fetchProfile]);

  const refreshUser = useCallback(async () => {
    const profile = await fetchProfile();
    setUser(profile);
  }, [fetchProfile]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication state and actions.
 * Must be used inside an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
