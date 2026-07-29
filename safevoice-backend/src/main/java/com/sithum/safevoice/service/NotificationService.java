package com.sithum.safevoice.service;

import com.sithum.safevoice.dto.response.NotificationResponseDTO;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.entity.Topic;
import com.sithum.safevoice.entity.User;
import com.sithum.safevoice.enums.NotificationType;

import java.util.UUID;

/**
 * Service interface managing targeted user notifications and STOMP WebSocket pushes to {@code /user/queue/notifications}.
 */
public interface NotificationService {

    /**
     * Creates a notification record and dispatches a real-time STOMP push to the recipient user.
     */
    NotificationResponseDTO sendNotification(User recipient, NotificationType type, String title, String body, Topic relatedTopic);

    /**
     * Retrieves paginated notification list for a specific user.
     */
    PageResponse<NotificationResponseDTO> getUserNotifications(UUID userId, int page, int size);

    /**
     * Returns unread notification count for badge rendering.
     */
    long getUnreadCount(UUID userId);

    /**
     * Marks a single notification as read.
     */
    NotificationResponseDTO markAsRead(UUID notificationId, UUID userId);

    /**
     * Marks all notifications as read for a specific user.
     */
    void markAllAsRead(UUID userId);
}
