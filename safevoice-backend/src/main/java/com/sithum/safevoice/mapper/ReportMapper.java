package com.sithum.safevoice.mapper;

import com.sithum.safevoice.dto.response.ReportResponseDTO;
import com.sithum.safevoice.entity.Report;
import org.springframework.stereotype.Component;

/**
 * Mapper utility for converting {@link Report} entities into {@link ReportResponseDTO}.
 * Moderation reports reveal real reporter & reviewer identities for administrative auditing (Spec Section 3.3).
 */
@Component
public class ReportMapper {

    private final UserMapper userMapper;

    public ReportMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public ReportResponseDTO toReportResponseDTO(Report report) {
        if (report == null) {
            return null;
        }

        return new ReportResponseDTO(
                report.getId(),
                userMapper.toUserSummaryDTO(report.getReporter()),
                report.getTargetType(),
                report.getTargetTopic() != null ? report.getTargetTopic().getId() : null,
                report.getTargetComment() != null ? report.getTargetComment().getId() : null,
                report.getTargetUser() != null ? report.getTargetUser().getId() : null,
                report.getReason(),
                report.getDetails(),
                report.getStatus(),
                userMapper.toUserSummaryDTO(report.getReviewer()),
                report.getReviewerNotes(),
                report.getResolvedAt(),
                report.getCreatedAt()
        );
    }
}
