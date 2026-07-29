import { apiClient } from './client';
import { AuditLogDTO, PaginatedResponse } from '@/types/api';

export const auditService = {
  async getAuditLogs(page = 0, size = 20): Promise<PaginatedResponse<AuditLogDTO>> {
    return apiClient<PaginatedResponse<AuditLogDTO>>(`/admin/audit-logs?page=${page}&size=${size}`);
  },
};
