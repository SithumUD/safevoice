package com.sithum.safevoice.entity;

import com.sithum.safevoice.entity.id.UserReadGlobalNotificationId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Per-user read receipt for a broadcast global notification.
 * Maps to table {@code user_read_global_notifications} (Spec Section 4.12).
 * PRIMARY KEY (user_id, global_notification_id).
 */
@Entity
@Table(name = "user_read_global_notifications")
public class UserReadGlobalNotification {

    @EmbeddedId
    private UserReadGlobalNotificationId id = new UserReadGlobalNotificationId();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_read_global_notif_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("globalNotificationId")
    @JoinColumn(name = "global_notification_id", nullable = false, foreignKey = @ForeignKey(name = "fk_read_global_notif_notif"))
    private GlobalNotification globalNotification;

    @CreationTimestamp
    @Column(name = "read_at", nullable = false, updatable = false)
    private Instant readAt;

    public UserReadGlobalNotification() {
    }

    // ----- Getters & Setters -----

    public UserReadGlobalNotificationId getId() {
        return id;
    }

    public void setId(UserReadGlobalNotificationId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public GlobalNotification getGlobalNotification() {
        return globalNotification;
    }

    public void setGlobalNotification(GlobalNotification globalNotification) {
        this.globalNotification = globalNotification;
    }

    public Instant getReadAt() {
        return readAt;
    }

    public void setReadAt(Instant readAt) {
        this.readAt = readAt;
    }
}
