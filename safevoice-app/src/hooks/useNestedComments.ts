// src/hooks/useNestedComments.ts
import { useCallback, useEffect, useState } from 'react';
import { CommentResponseDTO } from '../types/api';
import { commentsService } from '../services/commentsService';

export function useNestedComments(topicId: string) {
  const [comments, setComments] = useState<CommentResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const tree = await commentsService.getTopicComments(topicId);
        setComments(tree);
      } catch (err: any) {
        setError(err.message || 'Failed to load comments');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [topicId]
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (
    body: string,
    parentCommentId: string | null = null,
    isAnonymous = false,
    mediaUrl?: string | null,
    mediaType?: 'IMAGE' | 'VIDEO' | null
  ) => {
    const newComment = await commentsService.postComment(topicId, {
      parentCommentId,
      body,
      isAnonymous,
      mediaUrl,
      mediaType,
    });
    // Refresh tree after posting
    await fetchComments(true);
    return newComment;
  };

  const toggleReaction = async (
    commentId: string,
    reactionType: 'LIKE' | 'DISLIKE'
  ) => {
    const updated = await commentsService.toggleCommentReaction(
      commentId,
      reactionType
    );
    // Recursively update comment reaction in state
    const updateInTree = (nodes: CommentResponseDTO[]): CommentResponseDTO[] => {
      return nodes.map((node) => {
        if (node.id === commentId) {
          return {
            ...node,
            likes: updated.likes,
            dislikes: updated.dislikes,
            myReaction: updated.myReaction,
          };
        }
        if (node.replies && node.replies.length > 0) {
          return { ...node, replies: updateInTree(node.replies) };
        }
        return node;
      });
    };
    setComments((prev) => updateInTree(prev));
  };

  return {
    comments,
    loading,
    refreshing,
    error,
    refresh: () => fetchComments(true),
    addComment,
    toggleReaction,
  };
}
