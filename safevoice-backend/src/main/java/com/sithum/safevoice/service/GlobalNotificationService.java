package com.sithum.safevoice.service;

import com.sithum.safevoice.dto.request.CreateGlobalNotificationRequest;
import com.sithum.safevoice.dto.response.GlobalNotificationResponseDTO;
import com.sithum.safevoice.dto.response.PageResponse;

import java.util.UUID;

/**
 * Service interface managing system-wide civic broadcast announcements and user read tracking.
 */
public interface GlobalNotificationService {

    /**
     * Issues an admin broadcast civic announcement and dispatches live STOMP push over {@code /topic/announcements}.
     */
    GlobalNotificationResponseDTO createGlobalNotification(CreateGlobalNotificationRequest request, UUID adminId);

    /**
     * Retrieves paginated list of global broadcast announcements for a user, including user read state.
     */
    PageResponse<GlobalNotificationResponseDTO> getGlobalNotifications(UUID userId, int page, int size);

    /**
     * Marks a global broadcast announcement as read for the active user.
     */
    void markAsRead(UUID globalNotificationId, UUID userId);
}
