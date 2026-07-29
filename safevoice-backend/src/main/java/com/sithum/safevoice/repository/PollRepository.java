package com.sithum.safevoice.repository;

import com.sithum.safevoice.entity.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for {@link Poll} entity operations.
 */
@Repository
public interface PollRepository extends JpaRepository<Poll, UUID> {

    Optional<Poll> findByTopicId(UUID topicId);
}
