package com.sithum.safevoice.entity.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/** Composite PK for {@code user_poll_votes}: PRIMARY KEY (user_id, poll_id). */
@Embeddable
public class UserPollVoteId implements Serializable {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "poll_id", nullable = false)
    private UUID pollId;

    public UserPollVoteId() {
    }

    public UserPollVoteId(UUID userId, UUID pollId) {
        this.userId = userId;
        this.pollId = pollId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getPollId() {
        return pollId;
    }

    public void setPollId(UUID pollId) {
        this.pollId = pollId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserPollVoteId that)) return false;
        return Objects.equals(userId, that.userId) && Objects.equals(pollId, that.pollId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, pollId);
    }
}
