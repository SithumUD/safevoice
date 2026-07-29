package com.sithum.safevoice.repository;

import com.sithum.safevoice.entity.Comment;
import com.sithum.safevoice.enums.CommentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for {@link Comment} entity operations.
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    List<Comment> findByTopicIdOrderByCreatedAtAsc(UUID topicId);

    List<Comment> findByTopicIdAndStatusNotOrderByCreatedAtAsc(UUID topicId, CommentStatus status);
}
