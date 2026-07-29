package com.sithum.safevoice.entity;

import com.sithum.safevoice.entity.id.TopicReactionId;
import com.sithum.safevoice.enums.ReactionType;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Tracks a user's LIKE/DISLIKE reaction on a topic (one reaction per user
 * per topic). Maps to table {@code topic_reactions} (Spec Section 4.7).
 * PRIMARY KEY (user_id, topic_id). Counter columns on {@code topics} are
 * maintained by DB trigger {@code trg_topic_reactions}.
 */
@Entity
@Table(name = "topic_reactions")
public class TopicReaction {

    @EmbeddedId
    private TopicReactionId id = new TopicReactionId();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_topic_reactions_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("topicId")
    @JoinColumn(name = "topic_id", nullable = false, foreignKey = @ForeignKey(name = "fk_topic_reactions_topic"))
    private Topic topic;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false, length = 10)
    private ReactionType reactionType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public TopicReaction() {
    }

    // ----- Getters & Setters -----

    public TopicReactionId getId() {
        return id;
    }

    public void setId(TopicReactionId id) {
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

    public ReactionType getReactionType() {
        return reactionType;
    }

    public void setReactionType(ReactionType reactionType) {
        this.reactionType = reactionType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
