import { api } from './client';
import type { NotificationRecord, PaginatedResponse } from '@/types';

export const notificationsApi = {
  listMine: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<NotificationRecord>>('/notifications', { params: { page, limit } }).then((r) => r.data),

  markRead: (id: string) =>
    api.patch<NotificationRecord>(`/notifications/${id}/read`).then((r) => r.data),
};
