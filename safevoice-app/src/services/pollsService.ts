// src/services/pollsService.ts
import { apiClient } from './apiClient';
import { PageResponseDTO, PollDTO } from '../types/api';

export const pollsService = {
  async getPolls(page = 0, size = 20): Promise<PageResponseDTO<PollDTO>> {
    const res = await apiClient.get<PageResponseDTO<PollDTO>>(
      `/polls?page=${page}&size=${size}`
    );
    return res.data;
  },

  async getPoll(id: string): Promise<PollDTO> {
    const res = await apiClient.get<PollDTO>(`/polls/${id}`);
    return res.data;
  },

  async submitVote(pollId: string, optionIds: string[]): Promise<PollDTO> {
    const res = await apiClient.post<PollDTO>(`/polls/${pollId}/vote`, {
      optionIds,
    });
    return res.data;
  },
};
