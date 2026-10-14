import api from './axios';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  /** Required only in production (closed signup). Ignored by the demo backend. */
  invite_code?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// API Calls
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
}
