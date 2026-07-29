import { apiClient } from './client';
import { ReportDTO, ReportStatus, PaginatedResponse } from '@/types/api';

export type ResolveReportAction = 'DISMISS' | 'DELETE_CONTENT' | 'SUSPEND_USER';

export const reportsService = {
  async getReports(status: ReportStatus = 'PENDING', page = 0, size = 20): Promise<PaginatedResponse<ReportDTO>> {
    return apiClient<PaginatedResponse<ReportDTO>>(`/admin/reports?status=${status}&page=${page}&size=${size}`);
  },

  async resolveReport(id: string, action: ResolveReportAction, notes: string): Promise<ReportDTO> {
    return apiClient<ReportDTO>(`/admin/reports/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ action, notes }),
    });
  },
};
