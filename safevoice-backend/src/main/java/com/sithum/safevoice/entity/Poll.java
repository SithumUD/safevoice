package com.sithum.safevoice.entity;

import com.sithum.safevoice.enums.PollStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * Poll metadata attached one-to-one to a parent topic.
 * Maps to table {@code polls} (Spec Section 4.4).
 */
@Entity
@Table(
        name = "polls",
        indexes = {
                @Index(name = "idx_polls_topic", columnList = "topic_id")
        }
)
public class Poll {

    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "topic_id", nullable = true, unique = true, foreignKey = @ForeignKey(name = "fk_polls_topic"))
    private Topic topic;

    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "is_multiple_choice", nullable = false)
    private Boolean isMultipleChoice = false;

    /** Managed by DB trigger trg_poll_votes — do not mutate directly in app code. */
    @Column(name = "total_votes", nullable = false)
    private Integer totalVotes = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PollStatus status = PollStatus.OPEN;

    @Column(name = "closes_at")
    private Instant closesAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Poll() {
    }

    // ----- Getters & Setters -----

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Topic getTopic() {
        return topic;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public Boolean getIsMultipleChoice() {
        return isMultipleChoice;
    }

    public void setIsMultipleChoice(Boolean isMultipleChoice) {
        this.isMultipleChoice = isMultipleChoice;
    }

    public Integer getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(Integer totalVotes) {
        this.totalVotes = totalVotes;
    }

    public PollStatus getStatus() {
        return status;
    }

    public void setStatus(PollStatus status) {
        this.status = status;
    }

    public Instant getClosesAt() {
        return closesAt;
    }

    public void setClosesAt(Instant closesAt) {
        this.closesAt = closesAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
