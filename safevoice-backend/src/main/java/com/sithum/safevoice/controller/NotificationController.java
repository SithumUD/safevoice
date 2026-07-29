package com.sithum.safevoice.controller;

import com.sithum.safevoice.dto.response.NotificationResponseDTO;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.security.UserPrincipal;
import com.sithum.safevoice.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

/**
 * Spring REST Controller exposing Notifications Endpoints.
 * Spec Section 4.10 & 7.2.
 */
@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * GET /api/v1/notifications?page=0&size=20
     * Paginated list of notifications for the active user.
     */
    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponseDTO>> getUserNotifications(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        PageResponse<NotificationResponseDTO> response = notificationService.getUserNotifications(principal.getId(), page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/notifications/unread-count
     * Returns unread notification count for active user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal principal) {
        long unreadCount = notificationService.getUnreadCount(principal.getId());
        return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
    }

    /**
     * PUT /api/v1/notifications/{id}/read
     * Marks a single notification as read.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        NotificationResponseDTO response = notificationService.markAsRead(id, principal.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/v1/notifications/read-all
     * Marks all notifications as read for the active user.
     */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read."));
    }
}
