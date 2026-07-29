package com.sithum.safevoice.controller;

import com.sithum.safevoice.dto.request.ResolveReportRequest;
import com.sithum.safevoice.dto.request.SuspendUserRequest;
import com.sithum.safevoice.dto.request.UpdateUserRoleRequest;
import com.sithum.safevoice.dto.response.AdminMetricsResponseDTO;
import com.sithum.safevoice.dto.response.AuditLogResponseDTO;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.dto.response.ReportResponseDTO;
import com.sithum.safevoice.dto.response.UserResponseDTO;
import com.sithum.safevoice.enums.ReportStatus;
import com.sithum.safevoice.security.UserPrincipal;
import com.sithum.safevoice.service.AdminService;
import com.sithum.safevoice.service.ModerationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

/**
 * Spring REST Controller exposing Moderation & Administration Endpoints.
 * Spec Section 3.1, 3.2, 5.7 & 7.2.
 */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final ModerationService moderationService;
    private final AdminService adminService;

    public AdminController(ModerationService moderationService, AdminService adminService) {
        this.moderationService = moderationService;
        this.adminService = adminService;
    }

    /**
     * GET /api/v1/admin/reports?status=PENDING&page=0&size=20
     * Moderation queue listing (Moderator / Admin required).
     */
    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<PageResponse<ReportResponseDTO>> getReportsQueue(
            @RequestParam(value = "status", required = false) ReportStatus status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        PageResponse<ReportResponseDTO> response = moderationService.getReportsQueue(status, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/v1/admin/reports/{id}/resolve
     * Executes moderation resolution action (DISMISS, DELETE_CONTENT, SUSPEND_USER).
     */
    @PutMapping("/reports/{id}/resolve")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ReportResponseDTO> resolveReport(
            @PathVariable("id") UUID id,
            @Valid @RequestBody ResolveReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        ReportResponseDTO response = moderationService.resolveReport(id, request, principal.getId(), clientIp);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/admin/metrics
     * System telemetry dashboard metrics (Admin only).
     */
    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminMetricsResponseDTO> getSystemMetrics() {
        AdminMetricsResponseDTO response = adminService.getSystemMetrics();
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/admin/users?search=&page=0&size=20
     * Paginated list of registered users (Admin only).
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<UserResponseDTO>> getUsersList(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        PageResponse<UserResponseDTO> response = adminService.getUsersList(search, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/v1/admin/users/{id}/role
     * Grant or revoke user roles (Admin only).
     */
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> updateUserRole(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        UserResponseDTO response = adminService.updateUserRole(id, request, principal.getId(), clientIp);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/admin/users/{id}/suspend
     * Issue temporary user suspension (Moderator / Admin).
     */
    @PostMapping("/users/{id}/suspend")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<UserResponseDTO> suspendUser(
            @PathVariable("id") UUID id,
            @Valid @RequestBody SuspendUserRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        UserResponseDTO response = adminService.suspendUser(id, request, principal.getId(), clientIp);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/admin/users/{id}/ban
     * Issue permanent user ban (Admin only).
     */
    @PostMapping("/users/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> banUserPermanent(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        String reason = body != null ? body.getOrDefault("reason", "Violated Terms of Service") : "Violated Terms of Service";
        String clientIp = getClientIp(httpRequest);
        UserResponseDTO response = adminService.banUserPermanent(id, reason, principal.getId(), clientIp);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/admin/audit-logs?page=0&size=20
     * Immutable security audit logs queue (Admin only).
     */
    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<AuditLogResponseDTO>> getAuditLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        PageResponse<AuditLogResponseDTO> response = adminService.getAuditLogs(page, size);
        return ResponseEntity.ok(response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
