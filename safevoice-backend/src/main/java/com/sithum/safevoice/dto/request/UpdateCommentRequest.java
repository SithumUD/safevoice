package com.sithum.safevoice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Body for {@code PUT /api/v1/comments/{commentId}} — author-only edit
 * of their own comment.
 */
public record UpdateCommentRequest(

        @NotBlank(message = "Comment body is required")
        @Size(max = 5000, message = "Comment must be at most 5000 characters")
        String body
) {
}
