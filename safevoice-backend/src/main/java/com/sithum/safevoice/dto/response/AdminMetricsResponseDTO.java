package com.sithum.safevoice.dto.response;

/**
 * System telemetry snapshot returned by {@code GET /api/v1/admin/metrics}
 * (Admin-only, Spec Section 3.2 — VIEW_SYSTEM_METRICS).
 */
public record AdminMetricsResponseDTO(

        long totalUsers,
        long activeUsers,
        long suspendedUsers,
        long bannedUsers,
        long totalTopics,
        long activeTopics,
        long totalComments,
        long totalPolls,
        long totalPollVotes,
        long pendingReports,
        long resolvedReportsLast30Days,
        long newUsersLast7Days,
        long newTopicsLast7Days
) {
}
