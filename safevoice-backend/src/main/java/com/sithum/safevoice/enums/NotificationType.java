package com.sithum.safevoice.enums;

/**
 * Union of notification kinds used by both {@code notifications.type}
 * (personal) and {@code global_notifications.type} (broadcast).
 * Personal-only: REPLY, LIKE_MILESTONE, TRENDING, REPORT_RESOLVED.
 * Shared/broadcast: NEW_POLL, NEW_TOPIC, SYSTEM_ANNOUNCEMENT.
 */
public enum NotificationType {
    REPLY,
    LIKE_MILESTONE,
    TRENDING,
    REPORT_RESOLVED,
    NEW_POLL,
    NEW_TOPIC,
    SYSTEM_ANNOUNCEMENT
}
