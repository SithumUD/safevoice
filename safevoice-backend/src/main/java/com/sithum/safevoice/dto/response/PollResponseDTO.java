package com.sithum.safevoice.dto.response;

import com.sithum.safevoice.enums.PollStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Full poll detail, returned by {@code GET /api/v1/polls/{id}} and
 * embedded inside {@link TopicResponseDTO} when {@code hasPoll = true}.
 */
public record PollResponseDTO(

        UUID id,
        UUID topicId,
        String question,
        boolean isMultipleChoice,
        Integer totalVotes,
        PollStatus status,
        Instant closesAt,
        List<PollOptionResponseDTO> options,

        /** Options the currently-authenticated user has already voted for; empty if none / anonymous guest. */
        List<UUID> userVotedOptionIds,

        Instant createdAt,
        Instant updatedAt
) {
}
