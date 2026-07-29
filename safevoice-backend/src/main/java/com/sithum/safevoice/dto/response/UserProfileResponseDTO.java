package com.sithum.safevoice.dto.response;

import com.sithum.safevoice.enums.UserRole;
import com.sithum.safevoice.enums.UserStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * Detailed user profile projection returned by {@code GET /api/v1/users/{id}} and {@code PUT /api/v1/users/me}.
 */
public record UserProfileResponseDTO(

        UUID id,
        String email,
        String nickname,
        String avatarUrl,
        String bio,
        UserRole role,
        UserStatus status,
        Integer topicsCount,
        Integer commentsCount,
        Integer pollVotesCount,
        Instant createdAt
) {
}
