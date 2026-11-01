import type {
  AuthSessionResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
} from '@/shared/types/auth';

import { apiRequest } from './client';

export const AuthApi = {
  register: (body: RegisterRequest) =>
    apiRequest<AuthSessionResponse>('/api/auth/register', { method: 'POST', body, auth: false }),

  login: (body: LoginRequest) =>
    apiRequest<AuthSessionResponse>('/api/auth/login', { method: 'POST', body, auth: false }),

  logout: () => apiRequest<{ success: true }>('/api/auth/logout', { method: 'POST', body: {} }),

  me: () => apiRequest<MeResponse>('/api/auth/me'),
};
