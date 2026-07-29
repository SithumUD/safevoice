package com.sithum.safevoice.dto.response;

import com.sithum.safevoice.enums.Category;
import com.sithum.safevoice.enums.MediaType;

import java.time.Instant;
import java.util.UUID;

/**
 * Lightweight topic projection used in feed/listing endpoints
 * ({@code GET /api/v1/topics}) — omits the full poll payload and body
 * text to keep list responses compact. Same anonymity-masking rule as
 * {@link TopicResponseDTO} applies to {@code author}/{@code authorNickname}.
 */
public record TopicSummaryDTO(

        UUID id,
        UserSummaryDTO author,
        String authorNickname,
        boolean isAnonymous,
        Category category,
        String title,
        String excerpt,
        MediaType mediaType,
        String mediaUrl,
        Integer views,
        Integer likes,
        Integer dislikes,
        Integer commentCount,
        boolean isTrending,
        boolean hasPoll,
        Instant createdAt
) {
}
