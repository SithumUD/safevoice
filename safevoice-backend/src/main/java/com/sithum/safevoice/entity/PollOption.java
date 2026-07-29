package com.sithum.safevoice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * Individual voting option belonging to a poll.
 * Maps to table {@code poll_options} (Spec Section 4.5).
 */
@Entity
@Table(
        name = "poll_options",
        indexes = {
                @Index(name = "idx_poll_options_poll_id", columnList = "poll_id, option_order ASC")
        }
)
public class PollOption {

    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "poll_id", nullable = false, foreignKey = @ForeignKey(name = "fk_poll_options_poll"))
    private Poll poll;

    @Column(name = "option_order", nullable = false)
    private Integer optionOrder = 0;

    @Column(name = "label", nullable = false, length = 255)
    private String label;

    /** Managed by DB trigger trg_poll_votes — do not mutate directly in app code. */
    @Column(name = "votes", nullable = false)
    private Integer votes = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public PollOption() {
    }

    // ----- Getters & Setters -----

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Poll getPoll() {
        return poll;
    }

    public void setPoll(Poll poll) {
        this.poll = poll;
    }

    public Integer getOptionOrder() {
        return optionOrder;
    }

    public void setOptionOrder(Integer optionOrder) {
        this.optionOrder = optionOrder;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Integer getVotes() {
        return votes;
    }

    public void setVotes(Integer votes) {
        this.votes = votes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
