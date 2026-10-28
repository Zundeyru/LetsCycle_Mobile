import type {
  AuthSessionResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
} from '@/shared/types/auth';

import { apiRequest } from './client';

export const AuthApi = {
  register: (body: RegisterRequest) =>
    apiRequest<AuthSessionResponse>('/api/auth/register', { method: 'POST', body }),

  login: (body: LoginRequest) =>
    apiRequest<AuthSessionResponse>('/api/auth/login', { method: 'POST', body }),

  logout: (token: string | null) =>
    apiRequest<{ success: true }>('/api/auth/logout', { method: 'POST', body: {}, token }),

  me: (token: string | null) => apiRequest<MeResponse>('/api/auth/me', { token }),
};
