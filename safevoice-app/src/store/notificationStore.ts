// src/store/notificationStore.ts
import { useEffect, useState } from 'react';
import { notificationsService } from '../services/notificationsService';
import { NotificationResponseDTO } from '../types/api';

export interface NotificationState {
  unreadCount: number;
  notifications: NotificationResponseDTO[];
  isLoading: boolean;

  fetchUnreadCount: () => Promise<number>;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

let state: NotificationState = {
  unreadCount: 0,
  notifications: [],
  isLoading: false,

  fetchUnreadCount: async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      state = { ...state, unreadCount: count };
      notifyListeners();
      return count;
    } catch {
      return 0;
    }
  },

  fetchNotifications: async () => {
    state = { ...state, isLoading: true };
    notifyListeners();
    try {
      const res = await notificationsService.getNotifications(0, 20);
      const unreadCount = res.content.filter((n) => !n.isRead).length;
      state = {
        ...state,
        notifications: res.content,
        unreadCount,
        isLoading: false,
      };
    } catch {
      state = { ...state, isLoading: false };
    }
    notifyListeners();
  },

  markAsRead: async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      const newUnread = Math.max(0, state.unreadCount - 1);
      state = { ...state, notifications: updated, unreadCount: newUnread };
      notifyListeners();
    } catch {
      // Ignore
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsService.markAllAsRead();
      const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
      state = { ...state, notifications: updated, unreadCount: 0 };
      notifyListeners();
    } catch {
      // Ignore
    }
  },
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function useNotificationStore(): NotificationState {
  const [storeState, setStoreState] = useState<NotificationState>({ ...state });

  useEffect(() => {
    const listener = () => setStoreState({ ...state });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return storeState;
}

export const notificationStore = state;
