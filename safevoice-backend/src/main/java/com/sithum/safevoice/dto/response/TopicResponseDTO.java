package com.sithum.safevoice.dto.response;

import com.sithum.safevoice.enums.Category;
import com.sithum.safevoice.enums.MediaType;
import com.sithum.safevoice.enums.TopicStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * Public topic detail projection returned by
 * {@code GET /api/v1/topics/{id}} and (as {@link TopicSummaryDTO}) in feed
 * listings.
 *
 * <p><b>Anonymity masking (Spec Section 3.3):</b> when {@code isAnonymous}
 * is {@code true}, the mapper MUST set {@code author = null} and populate
 * {@code authorNickname} with the generated thread-scoped alias
 * (e.g. {@code "Anon #402"}) instead of the real nickname. The real
 * {@code author_id} is retained only in the entity/DB layer for audit and
 * legal-compliance purposes and is never serialized here for non-admins.</p>
 */
public record TopicResponseDTO(

        UUID id,

        /** Null for anonymous posts, or if the author account was deleted. */
        UserSummaryDTO author,

        /** Real nickname, or the generated "Anon #NNN" alias when isAnonymous is true. */
        String authorNickname,

        boolean isAnonymous,

        Category category,
        String title,
        String description,
        String mediaUrl,
        MediaType mediaType,
        Integer views,
        Integer likes,
        Integer dislikes,
        Integer commentCount,
        boolean isTrending,
        boolean hasPoll,
        PollResponseDTO poll,
        TopicStatus status,

        /** The requesting user's own reaction on this topic, if any (LIKE / DISLIKE / null). */
        String myReaction,

        boolean isSavedByMe,

        Instant createdAt,
        Instant updatedAt
) {
}
