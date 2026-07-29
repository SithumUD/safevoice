import { apiClient } from './client';
import { GlobalNotificationDTO, GlobalNotificationType, PaginatedResponse } from '@/types/api';

export type CreateGlobalNotificationPayload = {
  type: GlobalNotificationType;
  title: string;
  body: string;
  relatedTopicId?: string;
};

export const globalNotificationsService = {
  async createBroadcast(payload: CreateGlobalNotificationPayload): Promise<GlobalNotificationDTO> {
    return apiClient<GlobalNotificationDTO>('/admin/global-notifications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getRecentBroadcasts(page = 0, size = 20): Promise<PaginatedResponse<GlobalNotificationDTO>> {
    return apiClient<PaginatedResponse<GlobalNotificationDTO>>(`/global-notifications?page=${page}&size=${size}`);
  },
};
