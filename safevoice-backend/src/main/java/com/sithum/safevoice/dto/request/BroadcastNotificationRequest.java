package com.sithum.safevoice.dto.request;

import com.sithum.safevoice.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Body for {@code POST /api/v1/admin/notifications/broadcast} — Admin
 * broadcasts a global notification to all active mobile users
 * (Section 3.1). Persisted to {@code global_notifications} and pushed via
 * FCM + STOMP.
 */
public record BroadcastNotificationRequest(

        @NotNull(message = "type is required")
        NotificationType type,

        @NotBlank(message = "title is required")
        @Size(max = 255)
        String title,

        @NotBlank(message = "body is required")
        String body,

        UUID relatedTopicId
) {
}
