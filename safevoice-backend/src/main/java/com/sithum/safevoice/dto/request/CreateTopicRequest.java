package com.sithum.safevoice.dto.request;

import com.sithum.safevoice.enums.Category;
import com.sithum.safevoice.enums.MediaType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Body for {@code POST /api/v1/topics}.
 */
public record CreateTopicRequest(

        @NotNull(message = "Category is required")
        Category category,

        @NotBlank(message = "Title is required")
        @Size(min = 10, max = 255, message = "Title must be between 10 and 255 characters")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        boolean isAnonymous,

        String mediaUrl,

        MediaType mediaType,

        /** Optional embedded poll — when present, {@code has_poll} is set true on the created topic. */
        @Valid
        CreatePollRequest poll
) {
}
