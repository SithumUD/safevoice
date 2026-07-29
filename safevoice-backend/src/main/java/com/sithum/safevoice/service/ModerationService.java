package com.sithum.safevoice.service;

import com.sithum.safevoice.dto.request.CreateReportRequest;
import com.sithum.safevoice.dto.request.ResolveReportRequest;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.dto.response.ReportResponseDTO;
import com.sithum.safevoice.enums.ReportStatus;

import java.util.UUID;

/**
 * Service interface managing content flagging reports and moderation queue resolution workflows.
 */
public interface ModerationService {

    /**
     * Submits a new content/user flag report for moderation review.
     */
    ReportResponseDTO createReport(CreateReportRequest request, UUID reporterId);

    /**
     * Retrieves paginated moderation reports queue.
     */
    PageResponse<ReportResponseDTO> getReportsQueue(ReportStatus status, int page, int size);

    /**
     * Resolves a moderation report by executing DISMISS, DELETE_CONTENT, or SUSPEND_USER and generating audit log.
     */
    ReportResponseDTO resolveReport(UUID reportId, ResolveReportRequest request, UUID reviewerId, String clientIp);
}
