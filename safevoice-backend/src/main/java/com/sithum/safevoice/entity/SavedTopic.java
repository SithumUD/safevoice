package com.sithum.safevoice.entity;

import com.sithum.safevoice.entity.id.SavedTopicId;
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
 * User bookmark of a topic. Maps to table {@code saved_topics}
 * (Spec Section 4.9). PRIMARY KEY (user_id, topic_id).
 */
@Entity
@Table(name = "saved_topics")
public class SavedTopic {

    @EmbeddedId
    private SavedTopicId id = new SavedTopicId();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_saved_topics_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("topicId")
    @JoinColumn(name = "topic_id", nullable = false, foreignKey = @ForeignKey(name = "fk_saved_topics_topic"))
    private Topic topic;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public SavedTopic() {
    }

    // ----- Getters & Setters -----

    public SavedTopicId getId() {
        return id;
    }

    public void setId(SavedTopicId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Topic getTopic() {
        return topic;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
