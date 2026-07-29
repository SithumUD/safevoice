package com.sithum.safevoice.dto.request;

import com.sithum.safevoice.enums.ReactionType;
import jakarta.validation.constraints.NotNull;

/**
 * Body for {@code POST /api/v1/topics/{id}/reaction} and
 * {@code POST /api/v1/comments/{commentId}/reaction}.
 */
public record ReactionRequest(

        @NotNull(message = "reactionType is required")
        ReactionType reactionType
) {
}
