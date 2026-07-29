import { apiClient } from './client';
import { PollDTO, PaginatedResponse } from '@/types/api';

export type CreatePollPayload = {
  topicId?: string | null;
  question: string;
  options: string[];
  isMultipleChoice?: boolean;
  closesAt?: string | null;
  mediaUrl?: string | null;
};

export const pollsService = {
  async getPolls(page = 0, size = 20): Promise<PaginatedResponse<PollDTO>> {
    return apiClient<PaginatedResponse<PollDTO>>(`/polls?page=${page}&size=${size}`);
  },

  async getPoll(id: string): Promise<PollDTO> {
    return apiClient<PollDTO>(`/polls/${id}`);
  },

  async createPoll(payload: CreatePollPayload): Promise<PollDTO> {
    return apiClient<PollDTO>('/polls', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async togglePollStatus(id: string, closesAt: string | null): Promise<PollDTO> {
    return apiClient<PollDTO>(`/polls/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ closesAt }),
    });
  },

  async deletePoll(id: string): Promise<void> {
    return apiClient(`/polls/${id}`, {
      method: 'DELETE',
    });
  },
};
