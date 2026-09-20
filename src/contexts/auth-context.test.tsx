import type { ReactNode } from 'react';

import { act, renderHook } from '@testing-library/react';
import { vi, expect, describe, beforeEach, afterEach } from 'vitest';

import * as authApi from 'src/api/authApi';

import { useAuth, AuthProvider } from './auth-context';

// Mock the API module so no real HTTP requests are made.
vi.mock('src/api/authApi');

const mockedAuthApi = vi.mocked(authApi);

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

const USER: authApi.User = {
  id: 'u1',
  name: 'Ana Vet',
  email: 'ana@vetflow.dev',
};

const AUTH_RESPONSE: authApi.AuthResponse = {
  user: USER,
  token: 'jwt-token-123',
};

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('throws when used outside AuthProvider', () => {
    // Suppress the expected React error boundary console noise.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth deve ser usado dentro do AuthProvider'
    );
    spy.mockRestore();
  });

  it('starts unauthenticated when localStorage is empty', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('hydrates state from localStorage on init', () => {
    localStorage.setItem('auth_token', 'existing-token');
    localStorage.setItem('auth_user', JSON.stringify(USER));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(USER);
  });

  it('login sets state and persists to localStorage', async () => {
    mockedAuthApi.login.mockResolvedValue(AUTH_RESPONSE);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('ana@vetflow.dev', 'secret');
    });

    expect(mockedAuthApi.login).toHaveBeenCalledWith({
      email: 'ana@vetflow.dev',
      password: 'secret',
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(USER);
    expect(localStorage.getItem('auth_token')).toBe('jwt-token-123');
    expect(JSON.parse(localStorage.getItem('auth_user') as string)).toEqual(USER);
  });

  it('register sets state and persists to localStorage', async () => {
    mockedAuthApi.register.mockResolvedValue(AUTH_RESPONSE);

    const { result } = renderHook(() => useAuth(), { wrapper });

    const registerData: authApi.RegisterData = {
      name: 'Ana Vet',
      email: 'ana@vetflow.dev',
      password: 'secret',
      confirm_password: 'secret',
    };

    await act(async () => {
      await result.current.register(registerData);
    });

    expect(mockedAuthApi.register).toHaveBeenCalledWith(registerData);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(USER);
    expect(localStorage.getItem('auth_token')).toBe('jwt-token-123');
  });

  it('setAuthData sets state and persists without calling the API', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setAuthData(USER, 'manual-token');
    });

    expect(mockedAuthApi.login).not.toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(USER);
    expect(localStorage.getItem('auth_token')).toBe('manual-token');
  });

  it('updateUser updates the user and persists without touching the token', () => {
    localStorage.setItem('auth_token', 'existing-token');
    localStorage.setItem('auth_user', JSON.stringify(USER));

    const { result } = renderHook(() => useAuth(), { wrapper });

    const updated: authApi.User = { ...USER, name: 'Ana Updated' };

    act(() => {
      result.current.updateUser(updated);
    });

    expect(result.current.user).toEqual(updated);
    expect(JSON.parse(localStorage.getItem('auth_user') as string)).toEqual(updated);
    // Token untouched by updateUser.
    expect(localStorage.getItem('auth_token')).toBe('existing-token');
  });

  it('logout clears state and localStorage', () => {
    localStorage.setItem('auth_token', 'existing-token');
    localStorage.setItem('auth_user', JSON.stringify(USER));

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
