package com.sithum.safevoice.dto.request;

import com.sithum.safevoice.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Body for {@code POST /api/v1/admin/global-notifications} — Admin-issued civic announcement.
 */
public record CreateGlobalNotificationRequest(

        @NotNull(message = "type is required")
        NotificationType type,

        @NotBlank(message = "title is required")
        String title,

        @NotBlank(message = "body is required")
        String body,

        UUID relatedTopicId
) {
}
