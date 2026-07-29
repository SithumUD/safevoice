package com.sithum.safevoice.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Body for {@code PUT /api/v1/admin/reports/{id}/resolve}
 * (Spec Section 7.2 — Moderation & Admin Endpoints).
 */
public record ResolveReportRequest(

        @NotNull(message = "action is required")
        Action action,

        @Size(max = 2000)
        String notes
) {
    /** Resolution action a Moderator/Admin can take on a pending report. */
    public enum Action {
        DISMISS,
        DELETE_CONTENT,
        SUSPEND_USER
    }
}
