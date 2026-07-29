package com.sithum.safevoice.service.impl;

import com.sithum.safevoice.dto.response.NotificationResponseDTO;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.entity.Notification;
import com.sithum.safevoice.entity.Topic;
import com.sithum.safevoice.entity.User;
import com.sithum.safevoice.enums.NotificationType;
import com.sithum.safevoice.exception.ResourceNotFoundException;
import com.sithum.safevoice.mapper.NotificationMapper;
import com.sithum.safevoice.repository.NotificationRepository;
import com.sithum.safevoice.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Implementation of {@link NotificationService} handling notification persistence and real-time STOMP user queue pushes.
 */
@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {

    private static final String STOMP_USER_QUEUE_DESTINATION = "/queue/notifications";

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.sithum.safevoice.service.FCMService fcmService;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            NotificationMapper notificationMapper,
            SimpMessagingTemplate messagingTemplate,
            com.sithum.safevoice.service.FCMService fcmService) {
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
        this.messagingTemplate = messagingTemplate;
        this.fcmService = fcmService;
    }

    @Override
    @Transactional
    public NotificationResponseDTO sendNotification(User recipient, NotificationType type, String title, String body, Topic relatedTopic) {
        if (recipient == null) {
            return null;
        }

        Notification notification = new Notification();
        notification.setUser(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setIsRead(false);
        notification.setRelatedTopic(relatedTopic);

        Notification savedNotification = notificationRepository.save(notification);
        NotificationResponseDTO dto = notificationMapper.toNotificationResponseDTO(savedNotification);

        // Push live targeted notification via STOMP to /user/{userId}/queue/notifications
        try {
            messagingTemplate.convertAndSendToUser(recipient.getId().toString(), STOMP_USER_QUEUE_DESTINATION, dto);
            log.info("Dispatched STOMP notification to user ID: {} at destination: /user/{}/queue/notifications", recipient.getId(), recipient.getId());
        } catch (Exception ex) {
            log.error("Failed to push STOMP notification to user ID: {}", recipient.getId(), ex);
        }

        // Dispatch FCM Push Notification if recipient has an active FCM Token
        if (recipient.getFcmToken() != null && !recipient.getFcmToken().isBlank()) {
            try {
                java.util.Map<String, String> data = new java.util.HashMap<>();
                data.put("notificationId", savedNotification.getId().toString());
                if (relatedTopic != null) {
                    data.put("topicId", relatedTopic.getId().toString());
                }
                fcmService.sendPushNotification(recipient.getFcmToken(), title, body, data);
            } catch (Exception ex) {
                log.error("Failed to send FCM push to user ID: {}", recipient.getId(), ex);
            }
        }

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponseDTO> getUserNotifications(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        Page<NotificationResponseDTO> dtoPage = notificationPage.map(notificationMapper::toNotificationResponseDTO);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public NotificationResponseDTO markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification with ID '" + notificationId + "' not found."));

        if (!notification.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to modify this notification.");
        }

        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return notificationMapper.toNotificationResponseDTO(updatedNotification);
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
}
