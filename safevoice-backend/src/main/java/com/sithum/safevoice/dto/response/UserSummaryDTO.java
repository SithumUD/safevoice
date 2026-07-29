package com.sithum.safevoice.dto.response;

import java.util.UUID;

/**
 * Minimal user projection embedded inside other responses (e.g. an
 * author preview on a topic/comment) — deliberately excludes email and
 * counters to keep public payloads lean.
 */
public record UserSummaryDTO(

        UUID id,
        String nickname,
        String avatarUrl
) {
}
