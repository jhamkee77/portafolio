import { api } from './client';
import type { DocumentRecord, PaginatedResponse } from '@/types';

export const documentsApi = {
  requestUpload: (data: {
    fileName: string;
    type: string;
    propertyId?: string;
    orderId?: string;
    homeSystemId?: string;
    mimeType?: string;
    fileSize?: number;
    description?: string;
  }) =>
    api.post<{ document: DocumentRecord; uploadUrl: string }>('/documents/upload', data).then((r) => r.data),

  listByProperty: (propertyId: string, page = 1, limit = 20) =>
    api.get<PaginatedResponse<DocumentRecord>>(`/documents/property/${propertyId}`, { params: { page, limit } }).then((r) => r.data),

  listByOrder: (orderId: string) =>
    api.get<DocumentRecord[]>(`/documents/order/${orderId}`).then((r) => r.data),

  getDownloadUrl: (documentId: string) =>
    api.get<{ document: DocumentRecord; downloadUrl: string }>(`/documents/${documentId}/download`).then((r) => r.data),
};
