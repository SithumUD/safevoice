package com.sithum.safevoice.dto.request;

import com.sithum.safevoice.enums.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Body for {@code POST /api/v1/topics/{topicId}/comments}.
 * When {@code parentCommentId} is null, the comment is created as a
 * top-level comment (depth 0); otherwise it is nested under the parent,
 * subject to the max-depth-5 cap described in Spec Section 5.4.
 */
public record CreateCommentRequest(

        UUID parentCommentId,

        @NotBlank(message = "Comment body is required")
        @Size(max = 5000, message = "Comment must be at most 5000 characters")
        String body,

        boolean isAnonymous,

        String mediaUrl,

        MediaType mediaType
) {
}
