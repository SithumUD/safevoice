package com.sithum.safevoice.repository;

import com.sithum.safevoice.entity.CommentReaction;
import com.sithum.safevoice.entity.id.CommentReactionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for {@link CommentReaction} entity operations.
 */
@Repository
public interface CommentReactionRepository extends JpaRepository<CommentReaction, CommentReactionId> {

    Optional<CommentReaction> findByIdUserIdAndIdCommentId(UUID userId, UUID commentId);
}
