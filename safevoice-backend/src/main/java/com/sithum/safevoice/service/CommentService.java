package com.sithum.safevoice.service;

import com.sithum.safevoice.dto.request.CreateCommentRequest;
import com.sithum.safevoice.dto.request.ReactionRequest;
import com.sithum.safevoice.dto.request.UpdateCommentRequest;
import com.sithum.safevoice.dto.response.CommentResponseDTO;

import java.util.List;
import java.util.UUID;

/**
 * Service interface managing hierarchical comments, replies, depth-capping, and reactions.
 */
public interface CommentService {

    /**
     * Retrieves the complete hierarchical comment tree attached to a topic.
     */
    List<CommentResponseDTO> getCommentsTreeByTopicId(UUID topicId, UUID currentUserId);

    /**
     * Creates a top-level comment or nested reply subject to the max-depth-5 cap.
     */
    CommentResponseDTO createComment(UUID topicId, CreateCommentRequest request, UUID currentUserId);

    /**
     * Updates an existing comment body (author only).
     */
    CommentResponseDTO updateComment(UUID commentId, UpdateCommentRequest request, UUID currentUserId);

    /**
     * Soft deletes a comment and updates topic comment counters.
     */
    void deleteComment(UUID commentId, UUID currentUserId, boolean isModeratorOrAdmin);

    /**
     * Toggles or updates user LIKE / DISLIKE reaction on a comment node.
     */
    CommentResponseDTO toggleReaction(UUID commentId, ReactionRequest request, UUID currentUserId);
}
