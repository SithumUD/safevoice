package com.sithum.safevoice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Request payload for creating a new poll.
 */
public record CreatePollRequest(
        UUID topicId,

        @NotBlank(message = "Poll question cannot be blank")
        String question,

        @NotEmpty(message = "Poll must have options")
        @Size(min = 2, message = "Poll must have at least two options")
        List<String> options,

        Boolean isMultipleChoice,

        Instant closesAt,

        String mediaUrl
) {
}
