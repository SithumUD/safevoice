package com.sithum.safevoice.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Body for {@code POST /api/v1/admin/topics/{id}/lock} — Moderator/Admin
 * action to prevent further comments on a topic discussion.
 */
public record LockTopicRequest(

        boolean locked,

        @Size(max = 500)
        String reason
) {
}
