package com.sithum.safevoice.service;

import com.sithum.safevoice.dto.request.SuspendUserRequest;
import com.sithum.safevoice.dto.request.UpdateUserRoleRequest;
import com.sithum.safevoice.dto.response.AdminMetricsResponseDTO;
import com.sithum.safevoice.dto.response.AuditLogResponseDTO;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.dto.response.UserResponseDTO;

import java.util.UUID;

/**
 * Service interface managing administrative telemetry metrics, user roles, user bans/suspensions, and audit logs.
 */
public interface AdminService {

    /**
     * Aggregates platform-wide telemetry metrics for administrator dashboard.
     */
    AdminMetricsResponseDTO getSystemMetrics();

    /**
     * Retrieves paginated list of registered users.
     */
    PageResponse<UserResponseDTO> getUsersList(String search, int page, int size);

    /**
     * Updates target user role (USER, MODERATOR, ADMIN).
     */
    UserResponseDTO updateUserRole(UUID targetUserId, UpdateUserRoleRequest request, UUID adminId, String clientIp);

    /**
     * Temporarily suspends a user and revokes active Redis sessions.
     */
    UserResponseDTO suspendUser(UUID targetUserId, SuspendUserRequest request, UUID moderatorId, String clientIp);

    /**
     * Permanently bans a user and revokes all active Redis sessions.
     */
    UserResponseDTO banUserPermanent(UUID targetUserId, String reason, UUID adminId, String clientIp);

    /**
     * Retrieves paginated immutable security audit logs.
     */
    PageResponse<AuditLogResponseDTO> getAuditLogs(int page, int size);
}
