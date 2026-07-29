package com.sithum.safevoice.controller;

import com.sithum.safevoice.dto.request.CreateReportRequest;
import com.sithum.safevoice.dto.response.ReportResponseDTO;
import com.sithum.safevoice.security.UserPrincipal;
import com.sithum.safevoice.service.ModerationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Spring REST Controller for Content Flagging & Moderation Reporting.
 * Spec Section 5.7 & 7.2.
 */
@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ModerationService moderationService;

    public ReportController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    /**
     * POST /api/v1/reports
     * Flags a topic, comment, or user for moderation review.
     */
    @PostMapping
    public ResponseEntity<ReportResponseDTO> createReport(
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ReportResponseDTO response = moderationService.createReport(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
