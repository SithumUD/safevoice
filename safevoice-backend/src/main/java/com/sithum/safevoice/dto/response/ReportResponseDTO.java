package com.sithum.safevoice.dto.response;

import com.sithum.safevoice.enums.ReportReason;
import com.sithum.safevoice.enums.ReportStatus;
import com.sithum.safevoice.enums.ReportTargetType;

import java.time.Instant;
import java.util.UUID;

/**
 * Report projection returned by the moderation queue
 * ({@code GET /api/v1/admin/reports}). Reporter/reviewer identities are
 * always visible here regardless of the underlying content's own
 * anonymity flag — moderation access is explicitly exempted from the
 * public anonymity mask per Spec Section 3.3.
 */
public record ReportResponseDTO(

        UUID id,
        UserSummaryDTO reporter,
        ReportTargetType targetType,
        UUID targetTopicId,
        UUID targetCommentId,
        UUID targetUserId,
        ReportReason reason,
        String details,
        ReportStatus status,
        UserSummaryDTO reviewer,
        String reviewerNotes,
        Instant resolvedAt,
        Instant createdAt
) {
}
