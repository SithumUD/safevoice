package com.sithum.safevoice.dto.response;

import java.time.Instant;
import java.util.UUID;

/**
 * Immutable audit trail entry projection, returned by
 * {@code GET /api/v1/admin/audit-logs} (Admin-only).
 */
public record AuditLogResponseDTO(

        UUID id,
        UserSummaryDTO actor,
        String action,
        String targetType,
        UUID targetId,
        String detailsJson,
        String ipAddress,
        Instant createdAt
) {
}
