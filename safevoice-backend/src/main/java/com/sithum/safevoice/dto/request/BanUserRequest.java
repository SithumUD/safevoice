package com.sithum.safevoice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Body for {@code POST /api/v1/admin/users/{id}/ban}
 * (Section 3.1 — Admin-only permanent ban, sets {@code users.status = BANNED}
 * and purges the user's Redis refresh-token session per Spec Section 5.1).
 */
public record BanUserRequest(

        @NotBlank(message = "reason is required")
        @Size(max = 500)
        String reason
) {
}
