package com.sithum.safevoice.controller;

import com.sithum.safevoice.dto.request.CreateGlobalNotificationRequest;
import com.sithum.safevoice.dto.response.GlobalNotificationResponseDTO;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.security.UserPrincipal;
import com.sithum.safevoice.service.GlobalNotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
 * Spring REST Controller exposing Global Broadcast Announcements Endpoints.
 * Spec Section 4.11 & 7.2.
 */
@RestController
@RequestMapping("/api/v1")
public class GlobalNotificationController {

    private final GlobalNotificationService globalNotificationService;

    public GlobalNotificationController(GlobalNotificationService globalNotificationService) {
        this.globalNotificationService = globalNotificationService;
    }

    /**
     * POST /api/v1/admin/global-notifications
     * Issues a system-wide civic announcement or broadcast alert (Admin only).
     */
    @PostMapping("/admin/global-notifications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GlobalNotificationResponseDTO> createGlobalNotification(
            @Valid @RequestBody CreateGlobalNotificationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        GlobalNotificationResponseDTO response = globalNotificationService.createGlobalNotification(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/v1/global-notifications?page=0&size=20
     * Returns paginated broadcast announcements with user read state.
     */
    @GetMapping("/global-notifications")
    public ResponseEntity<PageResponse<GlobalNotificationResponseDTO>> getGlobalNotifications(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal != null ? principal.getId() : null;
        PageResponse<GlobalNotificationResponseDTO> response = globalNotificationService.getGlobalNotifications(userId, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/v1/global-notifications/{id}/read
     * Marks a broadcast announcement as read for the active user.
     */
    @PutMapping("/global-notifications/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        globalNotificationService.markAsRead(id, principal.getId());
        return ResponseEntity.ok(Map.of("message", "Global notification marked as read."));
    }
}
