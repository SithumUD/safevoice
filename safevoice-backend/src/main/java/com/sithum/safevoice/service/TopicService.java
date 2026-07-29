package com.sithum.safevoice.service;

import com.sithum.safevoice.dto.request.CreateTopicRequest;
import com.sithum.safevoice.dto.request.ReactionRequest;
import com.sithum.safevoice.dto.request.UpdateTopicRequest;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.dto.response.TopicResponseDTO;
import com.sithum.safevoice.dto.response.TopicSummaryDTO;
import com.sithum.safevoice.enums.Category;

import java.util.UUID;

/**
 * Service interface managing community topics, public discussion feeds, reactions, and bookmarks.
 */
public interface TopicService {

    /**
     * Retrieves paginated public topics feed ordered by requested sort mode (latest, trending, most_commented, most_liked).
     */
    PageResponse<TopicSummaryDTO> getTopicsFeed(Category category, String sort, int page, int size, UUID currentUserId);

    /**
     * Fetches detailed topic object, increments view count, and populates current user's reaction & saved status.
     */
    TopicResponseDTO getTopicById(UUID id, UUID currentUserId);

    /**
     * Creates a new topic post (Admin / Moderator only). Supports optional embedded poll attachment.
     */
    TopicResponseDTO createTopic(CreateTopicRequest request, UUID currentUserId);

    /**
     * Updates an existing topic post (Admin / Moderator only).
     */
    TopicResponseDTO updateTopic(UUID id, UpdateTopicRequest request, UUID currentUserId);

    /**
     * Soft deletes a topic post by setting status to DELETED (Admin / Moderator only).
     */
    void deleteTopic(UUID id, UUID currentUserId, boolean isModeratorOrAdmin);

    /**
     * Toggles or updates user LIKE / DISLIKE reaction on a topic.
     */
    TopicResponseDTO toggleReaction(UUID id, ReactionRequest request, UUID currentUserId);

    /**
     * Toggles bookmark / saved status for a topic by the authenticated user.
     * @return true if now saved, false if removed
     */
    boolean toggleSaveTopic(UUID id, UUID currentUserId);

    /**
     * Retrieves paginated list of topics created by the authenticated user.
     */
    PageResponse<TopicSummaryDTO> getMyTopics(UUID currentUserId, int page, int size);

    /**
     * Retrieves paginated list of topics bookmarked by the authenticated user.
     */
    PageResponse<TopicSummaryDTO> getSavedTopics(UUID currentUserId, int page, int size);
}
