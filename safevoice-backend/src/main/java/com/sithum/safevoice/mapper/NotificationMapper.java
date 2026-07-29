package com.sithum.safevoice.mapper;

import com.sithum.safevoice.dto.response.NotificationResponseDTO;
import com.sithum.safevoice.entity.Notification;
import org.springframework.stereotype.Component;

/**
 * Mapper utility for converting {@link Notification} entities into {@link NotificationResponseDTO}.
 */
@Component
public class NotificationMapper {

    public NotificationResponseDTO toNotificationResponseDTO(Notification notification) {
        if (notification == null) {
            return null;
        }

        return new NotificationResponseDTO(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getBody(),
                Boolean.TRUE.equals(notification.getIsRead()),
                notification.getRelatedTopic() != null ? notification.getRelatedTopic().getId() : null,
                notification.getCreatedAt()
        );
    }
}
