package com.sithum.safevoice.dto.request;

import com.sithum.safevoice.enums.SuspensionDuration;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Body for {@code POST /api/v1/admin/users/{id}/suspend}
 * (Section 3.1 — Moderator permission, 24h / 7d / 30d durations).
 */
public record SuspendUserRequest(

        @NotNull(message = "userId is required")
        UUID userId,

        @NotNull(message = "duration is required")
        SuspensionDuration duration,

        @Size(max = 500)
        String reason
) {
}
