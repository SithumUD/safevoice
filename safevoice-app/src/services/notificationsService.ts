// src/services/notificationsService.ts
import { apiClient } from './apiClient';
import {
  GlobalNotificationResponseDTO,
  NotificationResponseDTO,
  PageResponseDTO,
} from '../types/api';

export const notificationsService = {
  async getNotifications(page = 0, size = 20): Promise<PageResponseDTO<NotificationResponseDTO>> {
    const res = await apiClient.get<PageResponseDTO<NotificationResponseDTO>>(
      `/notifications?page=${page}&size=${size}`
    );
    return res.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<{ unreadCount: number }>('/notifications/unread-count');
    return res.data.unreadCount;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  },

  async getGlobalNotifications(
    page = 0,
    size = 20
  ): Promise<PageResponseDTO<GlobalNotificationResponseDTO>> {
    const res = await apiClient.get<PageResponseDTO<GlobalNotificationResponseDTO>>(
      `/global-notifications?page=${page}&size=${size}`
    );
    return res.data;
  },

  async markGlobalAsRead(id: string): Promise<void> {
    await apiClient.put(`/global-notifications/${id}/read`);
  },
};
