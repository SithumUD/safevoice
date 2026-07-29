package com.sithum.safevoice.service.impl;

import com.sithum.safevoice.dto.request.SuspendUserRequest;
import com.sithum.safevoice.dto.request.UpdateUserRoleRequest;
import com.sithum.safevoice.dto.response.AdminMetricsResponseDTO;
import com.sithum.safevoice.dto.response.AuditLogResponseDTO;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.dto.response.UserResponseDTO;
import com.sithum.safevoice.entity.AuditLog;
import com.sithum.safevoice.entity.User;
import com.sithum.safevoice.enums.ReportStatus;
import com.sithum.safevoice.enums.TopicStatus;
import com.sithum.safevoice.enums.UserStatus;
import com.sithum.safevoice.exception.ResourceNotFoundException;
import com.sithum.safevoice.mapper.AuditLogMapper;
import com.sithum.safevoice.mapper.UserMapper;
import com.sithum.safevoice.repository.AuditLogRepository;
import com.sithum.safevoice.repository.CommentRepository;
import com.sithum.safevoice.repository.PollRepository;
import com.sithum.safevoice.repository.ReportRepository;
import com.sithum.safevoice.repository.TopicRepository;
import com.sithum.safevoice.repository.UserPollVoteRepository;
import com.sithum.safevoice.repository.UserRepository;
import com.sithum.safevoice.service.AdminService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;

/**
 * Implementation of {@link AdminService} managing system metrics, user roles, user suspensions/bans, and audit logging.
 */
@Slf4j
@Service
public class AdminServiceImpl implements AdminService {

    private static final String REDIS_SESSION_PREFIX = "session:";

    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final CommentRepository commentRepository;
    private final PollRepository pollRepository;
    private final UserPollVoteRepository userPollVoteRepository;
    private final ReportRepository reportRepository;
    private final AuditLogRepository auditLogRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final UserMapper userMapper;
    private final AuditLogMapper auditLogMapper;

    public AdminServiceImpl(
            UserRepository userRepository,
            TopicRepository topicRepository,
            CommentRepository commentRepository,
            PollRepository pollRepository,
            UserPollVoteRepository userPollVoteRepository,
            ReportRepository reportRepository,
            AuditLogRepository auditLogRepository,
            StringRedisTemplate stringRedisTemplate,
            UserMapper userMapper,
            AuditLogMapper auditLogMapper) {
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
        this.commentRepository = commentRepository;
        this.pollRepository = pollRepository;
        this.userPollVoteRepository = userPollVoteRepository;
        this.reportRepository = reportRepository;
        this.auditLogRepository = auditLogRepository;
        this.stringRedisTemplate = stringRedisTemplate;
        this.userMapper = userMapper;
        this.auditLogMapper = auditLogMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminMetricsResponseDTO getSystemMetrics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        long suspendedUsers = userRepository.countByStatus(UserStatus.SUSPENDED);
        long bannedUsers = userRepository.countByStatus(UserStatus.BANNED);

        long totalTopics = topicRepository.count();
        long activeTopics = topicRepository.countByStatus(TopicStatus.ACTIVE);
        long totalComments = commentRepository.count();
        long totalPolls = pollRepository.count();
        long totalPollVotes = userPollVoteRepository.count();

        long pendingReports = reportRepository.countByStatus(ReportStatus.PENDING);
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        long resolvedReportsLast30Days = reportRepository.countByStatusAndResolvedAtAfter(ReportStatus.APPROVED, thirtyDaysAgo)
                + reportRepository.countByStatusAndResolvedAtAfter(ReportStatus.DISMISSED, thirtyDaysAgo);

        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        long newUsersLast7Days = userRepository.countByCreatedAtAfter(sevenDaysAgo);
        long newTopicsLast7Days = topicRepository.countByCreatedAtAfter(sevenDaysAgo);

        return new AdminMetricsResponseDTO(
                totalUsers,
                activeUsers,
                suspendedUsers,
                bannedUsers,
                totalTopics,
                activeTopics,
                totalComments,
                totalPolls,
                totalPollVotes,
                pendingReports,
                resolvedReportsLast30Days,
                newUsersLast7Days,
                newTopicsLast7Days
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponseDTO> getUsersList(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage;

        if (search != null && !search.isBlank()) {
            userPage = userRepository.findByEmailContainingIgnoreCaseOrNicknameContainingIgnoreCase(search, search, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        Page<UserResponseDTO> dtoPage = userPage.map(userMapper::toUserResponseDTO);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional
    public UserResponseDTO updateUserRole(UUID targetUserId, UpdateUserRoleRequest request, UUID adminId, String clientIp) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user with ID '" + targetUserId + "' not found."));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found."));

        targetUser.setRole(request.role());
        User updatedUser = userRepository.save(targetUser);

        createAuditLog(admin, "UPDATE_ROLE", "USER", targetUserId, "{\"newRole\":\"" + request.role() + "\"}", clientIp);
        log.info("Admin {} updated role for user {} to {}", adminId, targetUserId, request.role());

        return userMapper.toUserResponseDTO(updatedUser);
    }

    @Override
    @Transactional
    public UserResponseDTO suspendUser(UUID targetUserId, SuspendUserRequest request, UUID moderatorId, String clientIp) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user with ID '" + targetUserId + "' not found."));

        User moderator = userRepository.findById(moderatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Moderator user not found."));

        targetUser.setStatus(UserStatus.SUSPENDED);
        User updatedUser = userRepository.save(targetUser);

        revokeUserSessions(targetUserId);
        createAuditLog(moderator, "SUSPEND_USER", "USER", targetUserId, "{\"duration\":\"" + request.duration() + "\",\"reason\":\"" + request.reason() + "\"}", clientIp);
        log.info("User {} suspended by moderator {}", targetUserId, moderatorId);

        return userMapper.toUserResponseDTO(updatedUser);
    }

    @Override
    @Transactional
    public UserResponseDTO banUserPermanent(UUID targetUserId, String reason, UUID adminId, String clientIp) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user with ID '" + targetUserId + "' not found."));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found."));

        targetUser.setStatus(UserStatus.BANNED);
        User updatedUser = userRepository.save(targetUser);

        revokeUserSessions(targetUserId);
        createAuditLog(admin, "BAN_USER", "USER", targetUserId, "{\"reason\":\"" + reason + "\"}", clientIp);
        log.info("User {} permanently banned by admin {}", targetUserId, adminId);

        return userMapper.toUserResponseDTO(updatedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponseDTO> getAuditLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> auditLogPage = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        Page<AuditLogResponseDTO> dtoPage = auditLogPage.map(auditLogMapper::toAuditLogResponseDTO);
        return PageResponse.from(dtoPage);
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
