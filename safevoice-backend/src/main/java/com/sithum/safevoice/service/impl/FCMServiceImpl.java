package com.sithum.safevoice.service.impl;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.sithum.safevoice.service.FCMService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Implementation of {@link FCMService} using Firebase Messaging SDK.
 */
@Service
public class FCMServiceImpl implements FCMService {

    private static final Logger log = LoggerFactory.getLogger(FCMServiceImpl.class);

    @Override
    public void sendPushNotification(String fcmToken, String title, String body, Map<String, String> data) {
        log.info("[FCM PUSH DEBUG] Targeted token: {} | Title: {} | Body: {}", fcmToken, title, body);

        if (fcmToken == null || fcmToken.isBlank()) {
            return;
        }

        if (FirebaseApp.getApps().isEmpty()) {
            log.debug("FirebaseApp not initialized. Skipping actual FCM push dispatch.");
            return;
        }

        try {
            Message.Builder messageBuilder = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build());

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            String response = FirebaseMessaging.getInstance().send(messageBuilder.build());
            log.info("FCM push message sent successfully. Response ID: {}", response);
        } catch (Exception e) {
            log.error("Failed to dispatch FCM push notification to token: {}", fcmToken, e);
        }
    }
}
