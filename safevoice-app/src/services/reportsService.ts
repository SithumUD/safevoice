// src/services/reportsService.ts
import { apiClient } from './apiClient';

export interface SubmitReportPayload {
  targetType: 'TOPIC' | 'COMMENT' | 'USER';
  targetTopicId?: string | null;
  targetCommentId?: string | null;
  targetUserId?: string | null;
  reason: 'SPAM' | 'HARASSMENT' | 'MISINFORMATION' | 'HATE_SPEECH' | 'OTHER';
  details?: string;
}

export const reportsService = {
  async submitReport(payload: SubmitReportPayload): Promise<{ id: string; message: string }> {
    const res = await apiClient.post<{ id: string; message: string }>('/reports', payload);
    return res.data;
  },
};
