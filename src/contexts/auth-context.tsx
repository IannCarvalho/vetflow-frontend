import type { ReactNode } from 'react';

import { useState, useContext, useCallback, createContext } from 'react';

import * as authApi from 'src/api/authApi';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: authApi.User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: authApi.RegisterData) => Promise<void>;
  setAuthData: (user: authApi.User, token: string) => void;
  updateUser: (user: authApi.User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  });

  const [user, setUser] = useState<authApi.User | null>(() => {
    const storedUser = localStorage.getItem('auth_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    setUser(response.user);
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(async (data: authApi.RegisterData) => {
    const response = await authApi.register(data);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    setUser(response.user);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const setAuthData = useCallback((userData: authApi.User, token: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const updateUser = useCallback((userData: authApi.User) => {
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, register, logout, setAuthData, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro do AuthProvider');
  }
  return context;
}
