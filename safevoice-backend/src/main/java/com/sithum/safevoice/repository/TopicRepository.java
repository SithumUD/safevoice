package com.sithum.safevoice.repository;

import com.sithum.safevoice.entity.Topic;
import com.sithum.safevoice.enums.Category;
import com.sithum.safevoice.enums.TopicStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository interface for {@link Topic} entity operations and custom feed queries.
 */
@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID> {

    Page<Topic> findByStatus(TopicStatus status, Pageable pageable);

    Page<Topic> findByStatusAndCategory(TopicStatus status, Category category, Pageable pageable);

    Page<Topic> findByAuthorIdAndStatusNot(UUID authorId, TopicStatus status, Pageable pageable);

    @Query("SELECT st.topic FROM SavedTopic st WHERE st.user.id = :userId AND st.topic.status <> 'DELETED' ORDER BY st.createdAt DESC")
    Page<Topic> findSavedTopicsByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Modifying
    @Query("UPDATE Topic t SET t.views = t.views + 1 WHERE t.id = :id")
    void incrementViewCount(@Param("id") UUID id);

    long countByStatus(TopicStatus status);

    long countByCreatedAtAfter(java.time.Instant date);
}
