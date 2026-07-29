package com.sithum.safevoice.entity;

import com.sithum.safevoice.entity.id.UserPollVoteId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Tracks a user's voting choice, enforcing exactly one vote per user per
 * poll at the database level. Maps to table {@code user_poll_votes}
 * (Spec Section 4.6). PRIMARY KEY (user_id, poll_id).
 */
@Entity
@Table(name = "user_poll_votes")
public class UserPollVote {

    @EmbeddedId
    private UserPollVoteId id = new UserPollVoteId();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_poll_votes_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("pollId")
    @JoinColumn(name = "poll_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_poll_votes_poll"))
    private Poll poll;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "option_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_poll_votes_option"))
    private PollOption option;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public UserPollVote() {
    }

    // ----- Getters & Setters -----

    public UserPollVoteId getId() {
        return id;
    }

    public void setId(UserPollVoteId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Poll getPoll() {
        return poll;
    }

    public void setPoll(Poll poll) {
        this.poll = poll;
    }

    public PollOption getOption() {
        return option;
    }

    public void setOption(PollOption option) {
        this.option = option;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
