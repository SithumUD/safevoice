package com.sithum.safevoice.dto.response;

import java.util.List;
import java.util.UUID;

/**
 * Live vote-update payload pushed over STOMP to
 * {@code /topic/polls/{pollId}} after every successful vote
 * (Spec Section 5.5).
 */
public record PollVoteBroadcastDTO(

        UUID pollId,
        Integer totalVotes,
        List<OptionTally> options
) {
    /** Per-option tally nested in the broadcast payload. */
    public record OptionTally(
            UUID id,
            Integer votes,
            double percentage
    ) {
    }
}
