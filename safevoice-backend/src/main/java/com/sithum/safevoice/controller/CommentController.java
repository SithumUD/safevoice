package com.sithum.safevoice.controller;

import com.sithum.safevoice.dto.request.CreateCommentRequest;
import com.sithum.safevoice.dto.request.ReactionRequest;
import com.sithum.safevoice.dto.request.UpdateCommentRequest;
import com.sithum.safevoice.dto.response.CommentResponseDTO;
import com.sithum.safevoice.security.UserPrincipal;
import com.sithum.safevoice.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Spring REST Controller exposing Comments & Hierarchical Replies Endpoints.
 * Spec Section 5.4 & 7.2.
 */
@RestController
@RequestMapping("/api/v1")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    /**
     * GET /api/v1/topics/{topicId}/comments
     * Public endpoint returning hierarchical comment tree attached to a topic.
     */
    @GetMapping("/topics/{topicId}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getCommentsByTopicId(
            @PathVariable("topicId") UUID topicId,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        List<CommentResponseDTO> response = commentService.getCommentsTreeByTopicId(topicId, currentUserId);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/topics/{topicId}/comments
     * Creates a top-level comment or nested reply attached to a topic (subject to max-depth-5 cap).
     */
    @PostMapping("/topics/{topicId}/comments")
    public ResponseEntity<CommentResponseDTO> createComment(
            @PathVariable("topicId") UUID topicId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        CommentResponseDTO response = commentService.createComment(topicId, request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/v1/comments/{commentId}
     * Edits an existing comment body (author only).
     */
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable("commentId") UUID commentId,
            @Valid @RequestBody UpdateCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        CommentResponseDTO response = commentService.updateComment(commentId, request, principal.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/v1/comments/{commentId}
     * Soft deletes a comment and updates parent topic comment counters.
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Map<String, String>> deleteComment(
            @PathVariable("commentId") UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isModOrAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MODERATOR"));

        commentService.deleteComment(commentId, principal.getId(), isModOrAdmin);
        return ResponseEntity.ok(Map.of("message", "Comment successfully deleted."));
    }

    /**
     * POST /api/v1/comments/{commentId}/reaction
     * Toggles or updates user LIKE / DISLIKE reaction on a comment node.
     */
    @PostMapping("/comments/{commentId}/reaction")
    public ResponseEntity<CommentResponseDTO> toggleCommentReaction(
            @PathVariable("commentId") UUID commentId,
            @Valid @RequestBody ReactionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        CommentResponseDTO response = commentService.toggleReaction(commentId, request, principal.getId());
        return ResponseEntity.ok(response);
    }
}
