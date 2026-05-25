import { api } from './client';
import type { Property, PaginatedResponse } from '@/types';

export const propertiesApi = {
  list: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<Property>>('/properties', { params: { page, limit } }).then((r) => r.data),

  get: (id: string) =>
    api.get<Property>(`/properties/${id}`).then((r) => r.data),

  create: (data: Partial<Property>) =>
    api.post<Property>('/properties', data).then((r) => r.data),

  update: (id: string, data: Partial<Property>) =>
    api.patch<Property>(`/properties/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/properties/${id}`).then((r) => r.data),

  addHomeSystem: (propertyId: string, data: any) =>
    api.post(`/properties/${propertyId}/home-systems`, data).then((r) => r.data),

  getHomeSystems: (propertyId: string) =>
    api.get(`/properties/${propertyId}/home-systems`).then((r) => r.data),
};
