import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { lunerie, type LunerieApiError } from '@/api/lunerie/lunerieClient';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';
  errorMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = lunerie.auth.current()?.user ?? null;
  const [user, setUser] = useState<AuthUser | null>(initial);
  const [status, setStatus] = useState<AuthContextValue['status']>(initial ? 'authenticated' : 'idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return lunerie.auth.subscribe((tokens) => {
      if (tokens?.user) {
        setUser(tokens.user);
        setStatus('authenticated');
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    });
  }, []);

  const handleError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    setErrorMessage(message);
    setStatus('error');
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      await lunerie.auth.login(email, password);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      await lunerie.auth.register(email, password, displayName);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const logout = useCallback(async () => {
    try {
      await lunerie.auth.logout();
    } catch (error) {
      // Soft-fail: tokens are cleared regardless
      console.debug('logout warning', (error as LunerieApiError).message);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    await lunerie.auth.logoutAll();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    errorMessage,
    login,
    register,
    logout,
    logoutAll,
    isAdmin: user?.roles?.includes('ADMIN') ?? false,
  }), [user, status, errorMessage, login, register, logout, logoutAll]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
