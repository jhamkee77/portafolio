import { api } from './client';
import type { Order, PaginatedResponse } from '@/types';

export const ordersApi = {
  create: (data: { propertyId: string; serviceId: string; scheduledDate?: string; notes?: string; totalAmount?: number }) =>
    api.post<Order>('/orders', data).then((r) => r.data),

  listMine: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<Order>>('/orders/my', { params: { page, limit } }).then((r) => r.data),

  listAll: (page = 1, limit = 20, status?: string) =>
    api.get<PaginatedResponse<Order>>('/orders', { params: { page, limit, status } }).then((r) => r.data),

  get: (id: string) =>
    api.get<Order>(`/orders/${id}`).then((r) => r.data),

  transition: (id: string, status: string, notes?: string) =>
    api.patch<Order>(`/orders/${id}/status`, { status, notes }).then((r) => r.data),

  assignProvider: (id: string, providerId: string) =>
    api.patch(`/orders/${id}/assign-provider`, { providerId }).then((r) => r.data),

  listByProperty: (propertyId: string, page = 1, limit = 20) =>
    api.get<PaginatedResponse<Order>>(`/orders/property/${propertyId}`, { params: { page, limit } }).then((r) => r.data),
};
