import { apiClient } from './client';
import { TopicDTO, TopicCategory, PaginatedResponse } from '@/types/api';

export type CreateTopicPayload = {
  category: TopicCategory;
  title: string;
  description: string;
  isAnonymous?: boolean;
  mediaUrl?: string | null;
  mediaType?: 'IMAGE' | 'VIDEO' | null;
  poll?: {
    question: string;
    options: string[];
    isMultipleChoice?: boolean;
    closesAt?: string | null;
  } | null;
};

export const topicsService = {
  async getTopics(
    category?: string,
    sort: 'latest' | 'trending' | 'most_commented' | 'most_liked' = 'latest',
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<TopicDTO>> {
    const params = new URLSearchParams({ sort, page: String(page), size: String(size) });
    if (category && category !== 'ALL') {
      params.append('category', category);
    }
    return apiClient<PaginatedResponse<TopicDTO>>(`/topics?${params.toString()}`);
  },

  async getTopic(id: string): Promise<TopicDTO> {
    return apiClient<TopicDTO>(`/topics/${id}`);
  },

  async createTopic(payload: CreateTopicPayload): Promise<TopicDTO> {
    return apiClient<TopicDTO>('/topics', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateTopic(id: string, payload: Partial<CreateTopicPayload>): Promise<TopicDTO> {
    return apiClient<TopicDTO>(`/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteTopic(id: string): Promise<void> {
    return apiClient(`/topics/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleTrending(id: string, isTrending: boolean): Promise<TopicDTO> {
    return apiClient<TopicDTO>(`/admin/topics/${id}/trending`, {
      method: 'PUT',
      body: JSON.stringify({ isTrending }),
    });
  },
};
