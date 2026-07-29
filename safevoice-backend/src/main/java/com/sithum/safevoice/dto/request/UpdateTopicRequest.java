package com.sithum.safevoice.dto.request;

import com.sithum.safevoice.enums.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Body for {@code PUT /api/v1/topics/{id}} — author-only edit of their own topic.
 * Category and poll are immutable after creation.
 */
public record UpdateTopicRequest(

        @NotBlank(message = "Title is required")
        @Size(min = 10, max = 255, message = "Title must be between 10 and 255 characters")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        String mediaUrl,

        MediaType mediaType
) {
}
