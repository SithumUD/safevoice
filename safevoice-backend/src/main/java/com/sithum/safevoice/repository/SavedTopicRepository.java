package com.sithum.safevoice.repository;

import com.sithum.safevoice.entity.SavedTopic;
import com.sithum.safevoice.entity.id.SavedTopicId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository interface for {@link SavedTopic} entity operations.
 */
@Repository
public interface SavedTopicRepository extends JpaRepository<SavedTopic, SavedTopicId> {

    boolean existsByIdUserIdAndIdTopicId(UUID userId, UUID topicId);
}
