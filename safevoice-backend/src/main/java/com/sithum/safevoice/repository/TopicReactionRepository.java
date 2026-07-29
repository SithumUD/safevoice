package com.sithum.safevoice.repository;

import com.sithum.safevoice.entity.TopicReaction;
import com.sithum.safevoice.entity.id.TopicReactionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for {@link TopicReaction} entity operations.
 */
@Repository
public interface TopicReactionRepository extends JpaRepository<TopicReaction, TopicReactionId> {

    Optional<TopicReaction> findByIdUserIdAndIdTopicId(UUID userId, UUID topicId);

    void deleteByIdUserIdAndIdTopicId(UUID userId, UUID topicId);
}
