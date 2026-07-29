package com.sithum.safevoice.dto.response;

import com.sithum.safevoice.enums.CommentStatus;
import com.sithum.safevoice.enums.MediaType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Comment/reply projection returned by
 * {@code GET /api/v1/topics/{topicId}/comments}, assembled client-side (or
 * server-side by the mapper) into a nested tree via {@code replies}
 * (Spec Section 5.4). Same anonymity-masking rule as
 * {@link TopicResponseDTO} applies to {@code author}/{@code authorNickname}.
 */
public record CommentResponseDTO(

        UUID id,
        UUID topicId,
        UUID parentCommentId,

        /** Null for anonymous comments, or if the author account was deleted. */
        UserSummaryDTO author,

        /** Real nickname, or the generated "Anon #NNN" alias when isAnonymous is true. */
        String authorNickname,

        boolean isAnonymous,
        String body,
        String mediaUrl,
        MediaType mediaType,
        Integer likes,
        Integer dislikes,
        Integer depth,
        CommentStatus status,

        /** The requesting user's own reaction on this comment, if any (LIKE / DISLIKE / null). */
        String myReaction,

        Instant createdAt,
        Instant updatedAt,

        /** Nested child replies; empty list for leaf comments. */
        List<CommentResponseDTO> replies
) {
}
