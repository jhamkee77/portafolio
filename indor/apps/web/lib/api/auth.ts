import { api } from './client';
import type { AuthResponse } from '@/types';

export const authApi = {
  signup: (data: { email: string; password: string; name: string; phone?: string; role?: string }) =>
    api.post<AuthResponse>('/auth/signup', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),
};
