package com.sithum.safevoice.dto.response;

import com.sithum.safevoice.enums.UserRole;
import com.sithum.safevoice.enums.UserStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * Public-facing user profile projection. Never includes {@code passwordHash}.
 */
public record UserResponseDTO(

        UUID id,
        String email,
        String nickname,
        String avatarUrl,
        UserRole role,
        UserStatus status,
        Integer commentsCount,
        Integer likesReceived,
        Integer pollVotesCount,
        Instant memberSince,
        Instant lastLoginAt
) {
}
