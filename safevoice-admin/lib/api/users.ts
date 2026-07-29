import { apiClient } from './client';
import { UserDTO, UserRole, PaginatedResponse } from '@/types/api';

export const usersService = {
  async getUsers(page = 0, size = 20, query = ''): Promise<PaginatedResponse<UserDTO>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (query) params.append('query', query);
    return apiClient<PaginatedResponse<UserDTO>>(`/admin/users?${params.toString()}`);
  },

  async getUser(id: string): Promise<UserDTO> {
    return apiClient<UserDTO>(`/users/${id}`);
  },

  async createUser(payload: { email: string; password?: string; nickname: string }): Promise<UserDTO> {
    return apiClient<UserDTO>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateUserRole(id: string, role: UserRole): Promise<UserDTO> {
    return apiClient<UserDTO>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  async suspendUser(id: string, duration: string, reason: string): Promise<void> {
    return apiClient(`/admin/users/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ userId: id, duration, reason }),
    });
  },

  async banUser(id: string, reason: string): Promise<void> {
    return apiClient(`/admin/users/${id}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async deleteUser(id: string): Promise<void> {
    return apiClient(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};
