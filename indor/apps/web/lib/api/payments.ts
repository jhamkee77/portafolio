import { api } from './client';
import type { PaginatedResponse, Payment } from '@/types';

export const paymentsApi = {
  createIntent: (orderId: string, method: 'card' | 'synchrony' = 'card') =>
    api.post<{ payment: Payment; clientSecret: string }>('/payments/intent', { orderId, method }).then((r) => r.data),

  confirm: (paymentId: string) =>
    api.patch<Payment>(`/payments/${paymentId}/confirm`).then((r) => r.data),

  listMine: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<Payment>>('/payments/my', { params: { page, limit } }).then((r) => r.data),

  get: (id: string) =>
    api.get<Payment>(`/payments/${id}`).then((r) => r.data),
};
