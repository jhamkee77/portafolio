import { api } from './client';
import type { Service, PaginatedResponse } from '@/types';

export const servicesApi = {
  list: (page = 1, limit = 20, category?: string) =>
    api.get<PaginatedResponse<Service>>('/services', { params: { page, limit, category } }).then((r) => r.data),

  get: (id: string) =>
    api.get<Service>(`/services/${id}`).then((r) => r.data),

  getCategories: () =>
    api.get<string[]>('/services/categories').then((r) => r.data),
};
