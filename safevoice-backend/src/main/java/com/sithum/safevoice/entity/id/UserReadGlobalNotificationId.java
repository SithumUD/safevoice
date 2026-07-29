package com.sithum.safevoice.entity.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/**
 * Composite PK for {@code user_read_global_notifications}:
 * PRIMARY KEY (user_id, global_notification_id).
 */
@Embeddable
public class UserReadGlobalNotificationId implements Serializable {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "global_notification_id", nullable = false)
    private UUID globalNotificationId;

    public UserReadGlobalNotificationId() {
    }

    public UserReadGlobalNotificationId(UUID userId, UUID globalNotificationId) {
        this.userId = userId;
        this.globalNotificationId = globalNotificationId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getGlobalNotificationId() {
        return globalNotificationId;
    }

    public void setGlobalNotificationId(UUID globalNotificationId) {
        this.globalNotificationId = globalNotificationId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserReadGlobalNotificationId that)) return false;
        return Objects.equals(userId, that.userId)
                && Objects.equals(globalNotificationId, that.globalNotificationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, globalNotificationId);
    }
}
