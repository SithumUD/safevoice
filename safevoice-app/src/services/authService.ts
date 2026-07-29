// src/services/authService.ts
import { apiClient } from './apiClient';
import { storage } from './storage';
import { AuthResponseDTO, UserResponseDTO } from '../types/api';

export const authService = {
  async register(payload: {
    email: string;
    password: string;
    nickname: string;
  }): Promise<AuthResponseDTO> {
    const res = await apiClient.post<AuthResponseDTO>('/auth/register', payload);
    const data = res.data;
    await storage.saveTokens(data.accessToken, data.refreshToken);
    await storage.setUser(data.user);
    return data;
  },

  async login(payload: {
    email: string;
    password: string;
  }): Promise<AuthResponseDTO> {
    const res = await apiClient.post<AuthResponseDTO>('/auth/login', payload);
    const data = res.data;
    await storage.saveTokens(data.accessToken, data.refreshToken);
    await storage.setUser(data.user);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      await storage.clearAll();
    }
  },

  async getMe(): Promise<UserResponseDTO> {
    const res = await apiClient.get<UserResponseDTO>('/auth/me');
    await storage.setUser(res.data);
    return res.data;
  },

  async convertGuest(guestId: string): Promise<UserResponseDTO> {
    const res = await apiClient.post<UserResponseDTO>(
      `/auth/convert-guest?guestId=${encodeURIComponent(guestId)}`
    );
    await storage.setUser(res.data);
    return res.data;
  },

  async updateProfile(payload: {
    nickname?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<UserResponseDTO> {
    const res = await apiClient.put<UserResponseDTO>('/users/me', payload);
    await storage.setUser(res.data);
    return res.data;
  },

  async changePassword(payload: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> {
    await apiClient.put('/users/me/password', payload);
    // Changing password revokes sessions; clear local tokens to force re-login
    await storage.clearAll();
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(payload: { email: string; otp: string; newPassword: string }): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/auth/reset-password', payload);
    return res.data;
  },

  async updateFcmToken(fcmToken: string): Promise<{ message: string }> {
    const res = await apiClient.put<{ message: string }>('/users/me/fcm-token', { fcmToken });
    return res.data;
  },
};
