// src/services/commentsService.ts
import { apiClient } from './apiClient';
import { CommentResponseDTO } from '../types/api';

export interface PostCommentPayload {
  parentCommentId?: string | null;
  body: string;
  isAnonymous?: boolean;
  mediaUrl?: string | null;
  mediaType?: 'IMAGE' | 'VIDEO' | null;
}

export const commentsService = {
  async getTopicComments(topicId: string): Promise<CommentResponseDTO[]> {
    const res = await apiClient.get<CommentResponseDTO[]>(
      `/topics/${topicId}/comments`
    );
    return res.data;
  },

  async postComment(
    topicId: string,
    payload: PostCommentPayload
  ): Promise<CommentResponseDTO> {
    const res = await apiClient.post<CommentResponseDTO>(
      `/topics/${topicId}/comments`,
      payload
    );
    return res.data;
  },

  async toggleCommentReaction(
    commentId: string,
    reactionType: 'LIKE' | 'DISLIKE'
  ): Promise<CommentResponseDTO> {
    const res = await apiClient.post<CommentResponseDTO>(
      `/comments/${commentId}/reaction`,
      { reactionType }
    );
    return res.data;
  },
};
