import { apiClient, saveTokens, clearTokens } from './client';
import { AuthResponseDTO, UserDTO } from '@/types/api';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponseDTO> {
    const data = await apiClient<AuthResponseDTO>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.accessToken && data.refreshToken) {
      saveTokens(data.accessToken, data.refreshToken);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (err) {
      // Ignore logout errors
    } finally {
      clearTokens();
    }
  },

  async getMe(): Promise<UserDTO> {
    return apiClient<UserDTO>('/auth/me');
  },
};
