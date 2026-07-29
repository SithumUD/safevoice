package com.sithum.safevoice.mapper;

import com.sithum.safevoice.dto.response.AuditLogResponseDTO;
import com.sithum.safevoice.entity.AuditLog;
import org.springframework.stereotype.Component;

/**
 * Mapper utility for converting {@link AuditLog} entities into {@link AuditLogResponseDTO}.
 */
@Component
public class AuditLogMapper {

    private final UserMapper userMapper;

    public AuditLogMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public AuditLogResponseDTO toAuditLogResponseDTO(AuditLog auditLog) {
        if (auditLog == null) {
            return null;
        }

        return new AuditLogResponseDTO(
                auditLog.getId(),
                userMapper.toUserSummaryDTO(auditLog.getActor()),
                auditLog.getAction(),
                auditLog.getTargetType(),
                auditLog.getTargetId(),
                auditLog.getDetailsJson(),
                auditLog.getIpAddress(),
                auditLog.getCreatedAt()
        );
    }
}
