// src/services/topicsService.ts
import { apiClient } from './apiClient';
import { PageResponseDTO, TopicCategory, TopicResponseDTO } from '../types/api';

export interface GetTopicsParams {
  category?: string;
  sort?: 'latest' | 'trending' | 'most_commented' | 'most_liked' | 'newest';
  page?: number;
  size?: number;
}

export interface CreateTopicPayload {
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
    closesAt?: string;
  } | null;
}

export interface UpdateTopicPayload {
  title?: string;
  description?: string;
  mediaUrl?: string | null;
  mediaType?: 'IMAGE' | 'VIDEO' | null;
}

export const topicsService = {
  async getTopics(params: GetTopicsParams = {}): Promise<PageResponseDTO<TopicResponseDTO>> {
    const queryParams = new URLSearchParams();
    if (params.category && params.category !== 'All') {
      queryParams.append('category', params.category);
    }
    if (params.sort) {
      const sortValue = params.sort === 'newest' ? 'latest' : params.sort;
      queryParams.append('sort', sortValue);
    }
    queryParams.append('page', String(params.page ?? 0));
    queryParams.append('size', String(params.size ?? 20));

    const res = await apiClient.get<PageResponseDTO<TopicResponseDTO>>(
      `/topics?${queryParams.toString()}`
    );
    return res.data;
  },

  async getTopicDetail(id: string): Promise<TopicResponseDTO> {
    const res = await apiClient.get<TopicResponseDTO>(`/topics/${id}`);
    return res.data;
  },

  async createTopic(payload: CreateTopicPayload): Promise<TopicResponseDTO> {
    const res = await apiClient.post<TopicResponseDTO>('/topics', payload);
    return res.data;
  },

  async toggleReaction(
    id: string,
    reactionType: 'LIKE' | 'DISLIKE'
  ): Promise<TopicResponseDTO> {
    const res = await apiClient.post<TopicResponseDTO>(`/topics/${id}/reaction`, {
      reactionType,
    });
    return res.data;
  },

  async toggleSaveTopic(id: string): Promise<{ saved: boolean; message: string }> {
    const res = await apiClient.post<{ saved: boolean; message: string }>(
      `/topics/${id}/save`
    );
    return res.data;
  },

  async editTopic(id: string, payload: UpdateTopicPayload): Promise<TopicResponseDTO> {
    const res = await apiClient.put<TopicResponseDTO>(`/topics/${id}`, payload);
    return res.data;
  },

  async deleteTopic(id: string): Promise<void> {
    await apiClient.delete(`/topics/${id}`);
  },

  async getSavedTopics(page = 0, size = 20): Promise<PageResponseDTO<TopicResponseDTO>> {
    const res = await apiClient.get<PageResponseDTO<TopicResponseDTO>>(
      `/topics/saved?page=${page}&size=${size}`
    );
    return res.data;
  },
};
