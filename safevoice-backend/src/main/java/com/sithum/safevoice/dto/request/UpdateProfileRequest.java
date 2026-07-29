package com.sithum.safevoice.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Body for {@code PUT /api/v1/users/me} — active user profile update.
 */
public record UpdateProfileRequest(

        @Size(max = 50, message = "Nickname must be at most 50 characters")
        String nickname,

        @Size(max = 500, message = "Bio must be at most 500 characters")
        String bio,

        String avatarUrl
) {
}
