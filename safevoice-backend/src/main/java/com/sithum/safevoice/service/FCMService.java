package com.sithum.safevoice.service;

import java.util.Map;

/**
 * Service interface for sending Firebase Cloud Messaging (FCM) push notifications.
 */
public interface FCMService {

    /**
     * Sends a push notification payload to a targeted FCM token.
     */
    void sendPushNotification(String fcmToken, String title, String body, Map<String, String> data);
}
