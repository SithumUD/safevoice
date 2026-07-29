package com.sithum.safevoice.controller;

import com.sithum.safevoice.dto.request.CreateTopicRequest;
import com.sithum.safevoice.dto.request.ReactionRequest;
import com.sithum.safevoice.dto.request.UpdateTopicRequest;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.dto.response.TopicResponseDTO;
import com.sithum.safevoice.dto.response.TopicSummaryDTO;
import com.sithum.safevoice.enums.Category;
import com.sithum.safevoice.enums.UserRole;
import com.sithum.safevoice.security.UserPrincipal;
import com.sithum.safevoice.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

/**
 * Spring REST Controller exposing Topics & Discussion Endpoints.
 * Spec Section 5.3 & 7.2.
 */
@RestController
@RequestMapping("/api/v1/topics")
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    /**
     * GET /api/v1/topics
     * Public feed query supporting category filtering, sorting (latest, trending, most_commented, most_liked), and pagination.
     */
    @GetMapping
    public ResponseEntity<PageResponse<TopicSummaryDTO>> getTopicsFeed(
            @RequestParam(value = "category", required = false) Category category,
            @RequestParam(value = "sort", required = false, defaultValue = "latest") String sort,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        PageResponse<TopicSummaryDTO> response = topicService.getTopicsFeed(category, sort, page, size, currentUserId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/topics/my
     * Retrieves paginated topics created by the active authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<PageResponse<TopicSummaryDTO>> getMyTopics(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "20") int size) {
        PageResponse<TopicSummaryDTO> response = topicService.getMyTopics(principal.getId(), page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/topics/saved
     * Retrieves paginated topics bookmarked by the active authenticated user.
     */
    @GetMapping("/saved")
    public ResponseEntity<PageResponse<TopicSummaryDTO>> getSavedTopics(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "20") int size) {
        PageResponse<TopicSummaryDTO> response = topicService.getSavedTopics(principal.getId(), page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/topics/{id}
     * Public topic details endpoint. Increments view counter and masks anonymous author.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TopicResponseDTO> getTopicById(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        TopicResponseDTO response = topicService.getTopicById(id, currentUserId);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/topics
     * Creates a new topic post with optional embedded poll. Restricted to Admin / Moderator users.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<TopicResponseDTO> createTopic(
            @Valid @RequestBody CreateTopicRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        TopicResponseDTO response = topicService.createTopic(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/v1/topics/{id}
     * Updates an existing topic post. Restricted to Admin / Moderator users.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<TopicResponseDTO> updateTopic(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateTopicRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        TopicResponseDTO response = topicService.updateTopic(id, request, principal.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/v1/topics/{id}
     * Soft deletes a topic post. Restricted to Admin / Moderator users.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Map<String, String>> deleteTopic(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isModOrAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MODERATOR"));

        topicService.deleteTopic(id, principal.getId(), isModOrAdmin);
        return ResponseEntity.ok(Map.of("message", "Topic successfully deleted."));
    }

    /**
     * POST /api/v1/topics/{id}/reaction
     * Toggles or updates user LIKE / DISLIKE reaction on a topic post.
     */
    @PostMapping("/{id}/reaction")
    public ResponseEntity<TopicResponseDTO> toggleReaction(
            @PathVariable("id") UUID id,
            @Valid @RequestBody ReactionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        TopicResponseDTO response = topicService.toggleReaction(id, request, principal.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/topics/{id}/save
     * Toggles bookmark / saved status for a topic by the active user.
     */
    @PostMapping("/{id}/save")
    public ResponseEntity<Map<String, Object>> toggleSaveTopic(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isSaved = topicService.toggleSaveTopic(id, principal.getId());
        return ResponseEntity.ok(Map.of("topicId", id, "isSaved", isSaved));
    }
}
