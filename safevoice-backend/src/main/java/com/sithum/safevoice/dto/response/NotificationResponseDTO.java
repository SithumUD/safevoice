package com.sithum.safevoice.dto.response;

import com.sithum.safevoice.enums.NotificationType;

import java.time.Instant;
import java.util.UUID;

/**
 * Personal notification projection, returned by
 * {@code GET /api/v1/notifications} and pushed live to
 * {@code /user/queue/notifications} over STOMP.
 */
public record NotificationResponseDTO(

        UUID id,
        NotificationType type,
        String title,
        String body,
        boolean isRead,
        UUID relatedTopicId,
        Instant createdAt
) {
}
