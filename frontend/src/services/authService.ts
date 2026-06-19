import { api } from '@/lib/axios';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types/index';

const AUTH_BASE_URL = '/auth';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const request: LoginRequest = { email, password };
    const response = await api.post<AuthResponse>(`${AUTH_BASE_URL}/login`, request);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`${AUTH_BASE_URL}/register`, data);
    return response.data;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>(`${AUTH_BASE_URL}/me`);
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post(`${AUTH_BASE_URL}/forgot-password`, { email });
  },

  async verifyCode(email: string, code: string): Promise<void> {
    await api.post(`${AUTH_BASE_URL}/verify-code`, { email, code });
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    await api.post(`${AUTH_BASE_URL}/reset-password`, { email, code, newPassword });
  },
};
