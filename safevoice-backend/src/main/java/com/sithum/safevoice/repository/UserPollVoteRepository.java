package com.sithum.safevoice.repository;

import com.sithum.safevoice.entity.UserPollVote;
import com.sithum.safevoice.entity.id.UserPollVoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for {@link UserPollVote} entity operations.
 */
@Repository
public interface UserPollVoteRepository extends JpaRepository<UserPollVote, UserPollVoteId> {

    List<UserPollVote> findByIdUserIdAndIdPollId(UUID userId, UUID pollId);
}
