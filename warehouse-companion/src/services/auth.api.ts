import type { ApiResponse, User } from '@/types/database';
import apiClient from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenResponse;
}

export const authApi = {
  // Authentication
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post('/auth/token/', credentials);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<TokenResponse>> {
    const response = await apiClient.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  async verifyToken(token: string): Promise<ApiResponse<{ token: string }>> {
    const response = await apiClient.post('/auth/token/verify/', {
      token,
    });
    return response.data;
  },

  // User management
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get('/auth/users/');
    return response.data;
  },

  async getUserById(id: number): Promise<ApiResponse<User>> {
    const response = await apiClient.get(`/auth/users/${id}/`);
    return response.data;
  },

  async createUser(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.post('/auth/users/', data);
    return response.data;
  },

  async updateUser(id: number, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.patch(`/auth/users/${id}/`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/auth/users/${id}/`);
    return response.data;
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/auth/users/me/');
    return response.data;
  },

  // Password reset
  async requestPasswordReset(email: string): Promise<ApiResponse<{ detail: string }>> {
    const response = await apiClient.post('/auth/password-reset/', { email });
    return response.data;
  },

  async confirmPasswordReset(data: {
    token: string;
    password: string;
    password_confirm: string;
  }): Promise<ApiResponse<{ detail: string }>> {
    const response = await apiClient.post('/auth/password-reset/confirm/', data);
    return response.data;
  },
};

// Logout helper (client-side token clearing)
export const logout = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
};

// Token management helpers
export const setTokens = (tokens: TokenResponse): void => {
  localStorage.setItem('auth_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};
