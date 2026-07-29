package com.sithum.safevoice.mapper;

import com.sithum.safevoice.dto.response.GlobalNotificationResponseDTO;
import com.sithum.safevoice.entity.GlobalNotification;
import org.springframework.stereotype.Component;

/**
 * Mapper utility for converting {@link GlobalNotification} entities into {@link GlobalNotificationResponseDTO}.
 */
@Component
public class GlobalNotificationMapper {

    public GlobalNotificationResponseDTO toGlobalNotificationResponseDTO(GlobalNotification notification, boolean isRead) {
        if (notification == null) {
            return null;
        }

        return new GlobalNotificationResponseDTO(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getBody(),
                isRead,
                notification.getRelatedTopic() != null ? notification.getRelatedTopic().getId() : null,
                notification.getCreatedAt()
        );
    }
}
