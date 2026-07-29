package com.sithum.safevoice.service.impl;

import com.sithum.safevoice.dto.request.CreateReportRequest;
import com.sithum.safevoice.dto.request.ResolveReportRequest;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.dto.response.ReportResponseDTO;
import com.sithum.safevoice.entity.AuditLog;
import com.sithum.safevoice.entity.Comment;
import com.sithum.safevoice.entity.Report;
import com.sithum.safevoice.entity.Topic;
import com.sithum.safevoice.entity.User;
import com.sithum.safevoice.enums.CommentStatus;
import com.sithum.safevoice.enums.ReportStatus;
import com.sithum.safevoice.enums.ReportTargetType;
import com.sithum.safevoice.enums.TopicStatus;
import com.sithum.safevoice.enums.UserStatus;
import com.sithum.safevoice.exception.ResourceNotFoundException;
import com.sithum.safevoice.mapper.ReportMapper;
import com.sithum.safevoice.repository.AuditLogRepository;
import com.sithum.safevoice.repository.CommentRepository;
import com.sithum.safevoice.repository.ReportRepository;
import com.sithum.safevoice.repository.TopicRepository;
import com.sithum.safevoice.repository.UserRepository;
import com.sithum.safevoice.service.ModerationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import com.sithum.safevoice.enums.NotificationType;
import com.sithum.safevoice.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Implementation of {@link ModerationService} handling report flag submissions, moderation queue resolution, and audit logs.
 */
@Slf4j
@Service
public class ModerationServiceImpl implements ModerationService {

    private static final String REDIS_SESSION_PREFIX = "session:";

    private final ReportRepository reportRepository;
    private final TopicRepository topicRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final ReportMapper reportMapper;
    private final NotificationService notificationService;

    public ModerationServiceImpl(
            ReportRepository reportRepository,
            TopicRepository topicRepository,
            CommentRepository commentRepository,
            UserRepository userRepository,
            AuditLogRepository auditLogRepository,
            StringRedisTemplate stringRedisTemplate,
            ReportMapper reportMapper,
            NotificationService notificationService) {
        this.reportRepository = reportRepository;
        this.topicRepository = topicRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.stringRedisTemplate = stringRedisTemplate;
        this.reportMapper = reportMapper;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public ReportResponseDTO createReport(CreateReportRequest request, UUID reporterId) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter user not found."));

        Topic targetTopic = null;
        Comment targetComment = null;
        User targetUser = null;

        if (request.targetType() == ReportTargetType.TOPIC) {
            if (request.targetTopicId() == null) {
                throw new IllegalArgumentException("targetTopicId is required for TOPIC report.");
            }
            targetTopic = topicRepository.findById(request.targetTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Target topic not found."));
        } else if (request.targetType() == ReportTargetType.COMMENT) {
            if (request.targetCommentId() == null) {
                throw new IllegalArgumentException("targetCommentId is required for COMMENT report.");
            }
            targetComment = commentRepository.findById(request.targetCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Target comment not found."));
        } else if (request.targetType() == ReportTargetType.USER) {
            if (request.targetUserId() == null) {
                throw new IllegalArgumentException("targetUserId is required for USER report.");
            }
            targetUser = userRepository.findById(request.targetUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Target user not found."));
        }

        Report report = new Report();
        report.setReporter(reporter);
        report.setTargetType(request.targetType());
        report.setTargetTopic(targetTopic);
        report.setTargetComment(targetComment);
        report.setTargetUser(targetUser);
        report.setReason(request.reason());
        report.setDetails(request.details());
        report.setStatus(ReportStatus.PENDING);

        Report savedReport = reportRepository.save(report);
        log.info("Report created successfully with ID: {} by reporter: {}", savedReport.getId(), reporterId);

        return reportMapper.toReportResponseDTO(savedReport);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReportResponseDTO> getReportsQueue(ReportStatus status, int page, int size) {
        ReportStatus targetStatus = status != null ? status : ReportStatus.PENDING;
        Pageable pageable = PageRequest.of(page, size);
        Page<Report> reportPage = reportRepository.findByStatusOrderByCreatedAtDesc(targetStatus, pageable);

        Page<ReportResponseDTO> dtoPage = reportPage.map(reportMapper::toReportResponseDTO);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional
    public ReportResponseDTO resolveReport(UUID reportId, ResolveReportRequest request, UUID reviewerId, String clientIp) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report with ID '" + reportId + "' not found."));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer user not found."));

        ResolveReportRequest.Action action = request.action();

        if (action == ResolveReportRequest.Action.DISMISS) {
            report.setStatus(ReportStatus.DISMISSED);
        } else if (action == ResolveReportRequest.Action.DELETE_CONTENT) {
            report.setStatus(ReportStatus.APPROVED);
            if (report.getTargetTopic() != null) {
                Topic topic = report.getTargetTopic();
                topic.setStatus(TopicStatus.DELETED);
                topicRepository.save(topic);
                createAuditLog(reviewer, "DELETE_TOPIC", "TOPIC", topic.getId(), "{\"reportId\":\"" + reportId + "\"}", clientIp);
                if (topic.getAuthor() != null) {
                    notificationService.sendNotification(topic.getAuthor(), NotificationType.REPORT_RESOLVED, "Content Removed", "Your topic has been removed for violating community guidelines.", topic);
                }
            }
            if (report.getTargetComment() != null) {
                Comment comment = report.getTargetComment();
                comment.setStatus(CommentStatus.DELETED);
                commentRepository.save(comment);
                createAuditLog(reviewer, "DELETE_COMMENT", "COMMENT", comment.getId(), "{\"reportId\":\"" + reportId + "\"}", clientIp);
                if (comment.getAuthor() != null) {
                    notificationService.sendNotification(comment.getAuthor(), NotificationType.REPORT_RESOLVED, "Content Removed", "Your comment has been removed for violating community guidelines.", comment.getTopic());
                }
            }
        } else if (action == ResolveReportRequest.Action.SUSPEND_USER) {
            report.setStatus(ReportStatus.APPROVED);
            User targetUser = resolveTargetUser(report);
            if (targetUser != null) {
                targetUser.setStatus(UserStatus.SUSPENDED);
                userRepository.save(targetUser);
                revokeUserSessions(targetUser.getId());
                createAuditLog(reviewer, "SUSPEND_USER", "USER", targetUser.getId(), "{\"reportId\":\"" + reportId + "\"}", clientIp);
                notificationService.sendNotification(targetUser, NotificationType.REPORT_RESOLVED, "Account Suspended", "Your account has been suspended for violating community guidelines.", null);
            }
        }

        report.setReviewer(reviewer);
        report.setReviewerNotes(request.notes());
        report.setResolvedAt(Instant.now());

        Report savedReport = reportRepository.save(report);
        return reportMapper.toReportResponseDTO(savedReport);
    }

    private User resolveTargetUser(Report report) {
        if (report.getTargetUser() != null) {
            return report.getTargetUser();
        }
        if (report.getTargetTopic() != null && report.getTargetTopic().getAuthor() != null) {
            return report.getTargetTopic().getAuthor();
        }
        if (report.getTargetComment() != null && report.getTargetComment().getAuthor() != null) {
            return report.getTargetComment().getAuthor();
        }
        return null;
    }

    private void revokeUserSessions(UUID userId) {
        Set<String> keys = stringRedisTemplate.keys(REDIS_SESSION_PREFIX + userId + ":*");
        if (keys != null && !keys.isEmpty()) {
            stringRedisTemplate.delete(keys);
        }
    }

    private void createAuditLog(User actor, String action, String targetType, UUID targetId, String detailsJson, String ipAddress) {
        AuditLog auditLog = new AuditLog();
        auditLog.setActor(actor);
        auditLog.setAction(action);
        auditLog.setTargetType(targetType);
        auditLog.setTargetId(targetId);
        auditLog.setDetailsJson(detailsJson);
        auditLog.setIpAddress(ipAddress);
        auditLogRepository.save(auditLog);
    }
}
