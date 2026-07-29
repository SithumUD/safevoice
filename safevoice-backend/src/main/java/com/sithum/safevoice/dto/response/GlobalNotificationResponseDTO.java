package com.sithum.safevoice.dto.response;

import com.sithum.safevoice.enums.NotificationType;

import java.time.Instant;
import java.util.UUID;

/**
 * Global notification projection returned by {@code GET /api/v1/global-notifications}.
 */
public record GlobalNotificationResponseDTO(

        UUID id,
        NotificationType type,
        String title,
        String body,
        boolean isRead,
        UUID relatedTopicId,
        Instant createdAt
) {
}
