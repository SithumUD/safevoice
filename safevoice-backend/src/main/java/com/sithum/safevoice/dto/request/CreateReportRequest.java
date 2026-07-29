package com.sithum.safevoice.dto.request;

import com.sithum.safevoice.enums.ReportReason;
import com.sithum.safevoice.enums.ReportTargetType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Body for {@code POST /api/v1/reports}. Exactly one of
 * {@code targetTopicId} / {@code targetCommentId} / {@code targetUserId}
 * must be set, consistent with {@code targetType}.
 */
public record CreateReportRequest(

        @NotNull(message = "targetType is required")
        ReportTargetType targetType,

        UUID targetTopicId,

        UUID targetCommentId,

        UUID targetUserId,

        @NotNull(message = "reason is required")
        ReportReason reason,

        @Size(max = 2000)
        String details
) {
}
