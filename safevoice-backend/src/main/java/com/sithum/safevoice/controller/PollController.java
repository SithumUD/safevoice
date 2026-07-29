package com.sithum.safevoice.controller;

import com.sithum.safevoice.dto.request.CreatePollRequest;
import com.sithum.safevoice.dto.request.UpdatePollStatusRequest;
import com.sithum.safevoice.dto.request.VoteRequest;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.dto.response.PollResponseDTO;
import com.sithum.safevoice.security.UserPrincipal;
import com.sithum.safevoice.service.PollService;
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

import java.util.UUID;

/**
 * Spring REST Controller exposing Interactive Polls & Real-Time Voting Endpoints.
 * Spec Section 5.6 & 7.2.
 */
@RestController
@RequestMapping("/api/v1/polls")
public class PollController {

    private final PollService pollService;

    public PollController(PollService pollService) {
        this.pollService = pollService;
    }

    /**
     * GET /api/v1/polls?page=0&size=20
     * Returns paginated list of polls.
     */
    @GetMapping
    public ResponseEntity<PageResponse<PollResponseDTO>> getPolls(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        PageResponse<PollResponseDTO> response = pollService.getPolls(page, size, currentUserId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/polls/{id}
     * Public endpoint returning poll details, option vote counts, progress percentages, and user voting state.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PollResponseDTO> getPollById(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        PollResponseDTO response = pollService.getPollById(id, currentUserId);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/polls
     * Creates a new poll (Moderator / Admin required).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<PollResponseDTO> createPoll(
            @Valid @RequestBody CreatePollRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        PollResponseDTO response = pollService.createPoll(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/v1/polls/{id}/status
     * Toggles or updates poll status/closing timestamp (Moderator / Admin required).
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<PollResponseDTO> togglePollStatus(
            @PathVariable("id") UUID id,
            @RequestBody UpdatePollStatusRequest request) {
        PollResponseDTO response = pollService.togglePollStatus(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/v1/polls/{id}
     * Deletes a poll by ID (Moderator / Admin required).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<Void> deletePoll(@PathVariable("id") UUID id) {
        pollService.deletePoll(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/v1/polls/{id}/vote
     * Submits a user vote, updates option & total vote counters, and broadcasts live progress over STOMP WebSocket.
     */
    @PostMapping("/{id}/vote")
    public ResponseEntity<PollResponseDTO> submitVote(
            @PathVariable("id") UUID id,
            @Valid @RequestBody VoteRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        PollResponseDTO response = pollService.submitVote(id, request, principal.getId());
        return ResponseEntity.ok(response);
    }
}
