package com.sithum.safevoice.service.impl;

import com.sithum.safevoice.dto.request.CreateGlobalNotificationRequest;
import com.sithum.safevoice.dto.response.GlobalNotificationResponseDTO;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.entity.GlobalNotification;
import com.sithum.safevoice.entity.Topic;
import com.sithum.safevoice.entity.User;
import com.sithum.safevoice.entity.UserReadGlobalNotification;
import com.sithum.safevoice.exception.ResourceNotFoundException;
import com.sithum.safevoice.mapper.GlobalNotificationMapper;
import com.sithum.safevoice.repository.GlobalNotificationRepository;
import com.sithum.safevoice.repository.TopicRepository;
import com.sithum.safevoice.repository.UserReadGlobalNotificationRepository;
import com.sithum.safevoice.repository.UserRepository;
import com.sithum.safevoice.service.GlobalNotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Implementation of {@link GlobalNotificationService} managing broadcast announcements and STOMP live pushes to {@code /topic/announcements}.
 */
@Slf4j
@Service
public class GlobalNotificationServiceImpl implements GlobalNotificationService {

    private static final String STOMP_ANNOUNCEMENTS_TOPIC = "/topic/announcements";

    private final GlobalNotificationRepository globalNotificationRepository;
    private final UserReadGlobalNotificationRepository userReadGlobalNotificationRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final GlobalNotificationMapper globalNotificationMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public GlobalNotificationServiceImpl(
            GlobalNotificationRepository globalNotificationRepository,
            UserReadGlobalNotificationRepository userReadGlobalNotificationRepository,
            TopicRepository topicRepository,
            UserRepository userRepository,
            GlobalNotificationMapper globalNotificationMapper,
            SimpMessagingTemplate messagingTemplate) {
        this.globalNotificationRepository = globalNotificationRepository;
        this.userReadGlobalNotificationRepository = userReadGlobalNotificationRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
        this.globalNotificationMapper = globalNotificationMapper;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    @Transactional
    public GlobalNotificationResponseDTO createGlobalNotification(CreateGlobalNotificationRequest request, UUID adminId) {
        Topic relatedTopic = null;
        if (request.relatedTopicId() != null) {
            relatedTopic = topicRepository.findById(request.relatedTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Related topic with ID '" + request.relatedTopicId() + "' not found."));
        }

        GlobalNotification notification = new GlobalNotification();
        notification.setType(request.type());
        notification.setTitle(request.title());
        notification.setBody(request.body());
        notification.setRelatedTopic(relatedTopic);

        GlobalNotification savedNotification = globalNotificationRepository.save(notification);
        GlobalNotificationResponseDTO responseDTO = globalNotificationMapper.toGlobalNotificationResponseDTO(savedNotification, false);

        // Dispatch STOMP broadcast alert over /topic/announcements
        try {
            messagingTemplate.convertAndSend(STOMP_ANNOUNCEMENTS_TOPIC, responseDTO);
            log.info("Broadcasted global civic announcement ID: {} over STOMP to {}", savedNotification.getId(), STOMP_ANNOUNCEMENTS_TOPIC);
        } catch (Exception ex) {
            log.error("Failed to broadcast global announcement over STOMP: {}", savedNotification.getId(), ex);
        }

        return responseDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<GlobalNotificationResponseDTO> getGlobalNotifications(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GlobalNotification> notificationPage = globalNotificationRepository.findAllByOrderByCreatedAtDesc(pageable);

        Page<GlobalNotificationResponseDTO> dtoPage = notificationPage.map(gn -> {
            boolean isRead = userId != null && userReadGlobalNotificationRepository.existsByIdUserIdAndIdGlobalNotificationId(userId, gn.getId());
            return globalNotificationMapper.toGlobalNotificationResponseDTO(gn, isRead);
        });

        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional
    public void markAsRead(UUID globalNotificationId, UUID userId) {
        GlobalNotification notification = globalNotificationRepository.findById(globalNotificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Global notification with ID '" + globalNotificationId + "' not found."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        boolean alreadyRead = userReadGlobalNotificationRepository.existsByIdUserIdAndIdGlobalNotificationId(userId, globalNotificationId);
        if (!alreadyRead) {
            UserReadGlobalNotification userRead = new UserReadGlobalNotification();
            userRead.setUser(user);
            userRead.setGlobalNotification(notification);
            userReadGlobalNotificationRepository.save(userRead);
        }
    }
}
