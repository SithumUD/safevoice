import { apiClient } from './client';
import { SystemMetricsDTO } from '@/types/api';

export const metricsService = {
  async getMetrics(): Promise<SystemMetricsDTO> {
    return apiClient<SystemMetricsDTO>('/admin/metrics');
  },
};
