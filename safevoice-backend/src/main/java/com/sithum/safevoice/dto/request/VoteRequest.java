package com.sithum.safevoice.dto.request;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

/**
 * Body for {@code POST /api/v1/polls/{id}/vote}.
 * Single-choice polls expect exactly one entry in {@code optionIds};
 * multiple-choice polls ({@code polls.is_multiple_choice = true}) may
 * submit more than one. The service layer enforces the single-vote
 * constraint per Spec Section 5.5.
 */
public record VoteRequest(

        @NotEmpty(message = "At least one optionId is required")
        List<UUID> optionIds
) {
}
