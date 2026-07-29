package com.sithum.safevoice.service.impl;

import com.sithum.safevoice.dto.request.CreateCommentRequest;
import com.sithum.safevoice.dto.request.ReactionRequest;
import com.sithum.safevoice.dto.request.UpdateCommentRequest;
import com.sithum.safevoice.dto.response.CommentResponseDTO;
import com.sithum.safevoice.entity.Comment;
import com.sithum.safevoice.entity.CommentReaction;
import com.sithum.safevoice.entity.Topic;
import com.sithum.safevoice.entity.User;
import com.sithum.safevoice.entity.id.CommentReactionId;
import com.sithum.safevoice.enums.CommentStatus;
import com.sithum.safevoice.enums.NotificationType;
import com.sithum.safevoice.enums.ReactionType;
import com.sithum.safevoice.enums.TopicStatus;
import com.sithum.safevoice.enums.UserRole;
import com.sithum.safevoice.exception.ResourceNotFoundException;
import com.sithum.safevoice.mapper.CommentMapper;
import com.sithum.safevoice.repository.CommentReactionRepository;
import com.sithum.safevoice.repository.CommentRepository;
import com.sithum.safevoice.repository.TopicRepository;
import com.sithum.safevoice.repository.UserRepository;
import com.sithum.safevoice.service.CommentService;
import com.sithum.safevoice.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementation of {@link CommentService} handling hierarchical reply trees, max-depth-5 capping, and reactions.
 */
@Slf4j
@Service
public class CommentServiceImpl implements CommentService {

    private static final int MAX_TREE_DEPTH = 5;

    private final CommentRepository commentRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final CommentReactionRepository commentReactionRepository;
    private final CommentMapper commentMapper;
    private final NotificationService notificationService;

    public CommentServiceImpl(
            CommentRepository commentRepository,
            TopicRepository topicRepository,
            UserRepository userRepository,
            CommentReactionRepository commentReactionRepository,
            CommentMapper commentMapper,
            NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
        this.commentReactionRepository = commentReactionRepository;
        this.commentMapper = commentMapper;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponseDTO> getCommentsTreeByTopicId(UUID topicId, UUID currentUserId) {
        if (!topicRepository.existsById(topicId)) {
            throw new ResourceNotFoundException("Topic with ID '" + topicId + "' not found.");
        }

        List<Comment> flatComments = commentRepository.findByTopicIdOrderByCreatedAtAsc(topicId);

        Map<UUID, String> userReactionsMap = new HashMap<>();
        if (currentUserId != null && !flatComments.isEmpty()) {
            for (Comment comment : flatComments) {
                commentReactionRepository.findByIdUserIdAndIdCommentId(currentUserId, comment.getId())
                        .ifPresent(r -> userReactionsMap.put(comment.getId(), r.getReactionType().name()));
            }
        }

        return commentMapper.buildCommentTree(flatComments, userReactionsMap);
    }

    @Override
    @Transactional
    public CommentResponseDTO createComment(UUID topicId, CreateCommentRequest request, UUID currentUserId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic with ID '" + topicId + "' not found."));

        if (topic.getStatus() == TopicStatus.DELETED) {
            throw new ResourceNotFoundException("Cannot comment on a deleted topic.");
        }

        User author = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Comment parentComment = null;
        int depth = 0;

        if (request.parentCommentId() != null) {
            Comment targetParent = commentRepository.findById(request.parentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment with ID '" + request.parentCommentId() + "' not found."));

            if (targetParent.getDepth() >= MAX_TREE_DEPTH) {
                // Depth cap level 5 enforcement (Spec Section 5.5): attach to parent's parent if depth >= 5
                parentComment = targetParent.getParentComment() != null ? targetParent.getParentComment() : targetParent;
                depth = MAX_TREE_DEPTH;
            } else {
                parentComment = targetParent;
                depth = targetParent.getDepth() + 1;
            }
        }

        String anonymousId = null;
        if (request.isAnonymous()) {
            int seed = Math.abs((currentUserId.toString() + topicId.toString()).hashCode());
            int num = (seed % 900) + 100;
            anonymousId = "Anon #" + num;
        }

        Comment comment = new Comment();
        comment.setTopic(topic);
        comment.setParentComment(parentComment);
        comment.setAuthor(author);
        comment.setIsAnonymous(request.isAnonymous());
        comment.setAnonymousId(anonymousId);
        comment.setBody(request.body());
        comment.setMediaUrl(request.mediaUrl());
        comment.setMediaType(request.mediaType());
        comment.setDepth(depth);
        comment.setStatus(CommentStatus.ACTIVE);
        comment.setLikes(0);
        comment.setDislikes(0);

        Comment savedComment = commentRepository.save(comment);

        // Increment engagement counters
        topic.setCommentCount(topic.getCommentCount() + 1);
        topicRepository.save(topic);

        author.setCommentsCount(author.getCommentsCount() + 1);
        userRepository.save(author);

        // Dispatch STOMP notification to topic author or parent comment author
        dispatchCommentNotification(savedComment, topic, parentComment, author);

        return commentMapper.toCommentResponseDTO(savedComment, null, Collections.emptyList());
    }

    @Override
    @Transactional
    public CommentResponseDTO updateComment(UUID commentId, UpdateCommentRequest request, UUID currentUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment with ID '" + commentId + "' not found."));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        boolean isAuthor = comment.getAuthor() != null && comment.getAuthor().getId().equals(currentUserId);
        boolean isModOrAdmin = user.getRole() == UserRole.MODERATOR || user.getRole() == UserRole.ADMIN;

        if (!isAuthor && !isModOrAdmin) {
            throw new AccessDeniedException("You do not have permission to edit this comment.");
        }

        comment.setBody(request.body());
        Comment updatedComment = commentRepository.save(comment);

        String myReaction = commentReactionRepository.findByIdUserIdAndIdCommentId(currentUserId, commentId)
                .map(r -> r.getReactionType().name())
                .orElse(null);

        return commentMapper.toCommentResponseDTO(updatedComment, myReaction, Collections.emptyList());
    }

    @Override
    @Transactional
    public void deleteComment(UUID commentId, UUID currentUserId, boolean isModeratorOrAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment with ID '" + commentId + "' not found."));

        boolean isAuthor = comment.getAuthor() != null && comment.getAuthor().getId().equals(currentUserId);

        if (!isAuthor && !isModeratorOrAdmin) {
            throw new AccessDeniedException("You do not have permission to delete this comment.");
        }

        comment.setStatus(CommentStatus.DELETED);
        commentRepository.save(comment);

        Topic topic = comment.getTopic();
        if (topic != null) {
            topic.setCommentCount(Math.max(0, topic.getCommentCount() - 1));
            topicRepository.save(topic);
        }
    }

    @Override
    @Transactional
    public CommentResponseDTO toggleReaction(UUID commentId, ReactionRequest request, UUID currentUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment with ID '" + commentId + "' not found."));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Optional<CommentReaction> existingReactionOpt = commentReactionRepository.findByIdUserIdAndIdCommentId(currentUserId, commentId);

        if (existingReactionOpt.isPresent()) {
            CommentReaction existingReaction = existingReactionOpt.get();
            if (existingReaction.getReactionType() == request.reactionType()) {
                // Remove reaction if user toggles same reaction
                commentReactionRepository.delete(existingReaction);
                if (request.reactionType() == ReactionType.LIKE) {
                    comment.setLikes(Math.max(0, comment.getLikes() - 1));
                } else if (request.reactionType() == ReactionType.DISLIKE) {
                    comment.setDislikes(Math.max(0, comment.getDislikes() - 1));
                }
            } else {
                // Switch reaction (LIKE -> DISLIKE or DISLIKE -> LIKE)
                if (existingReaction.getReactionType() == ReactionType.LIKE && request.reactionType() == ReactionType.DISLIKE) {
                    comment.setLikes(Math.max(0, comment.getLikes() - 1));
                    comment.setDislikes(comment.getDislikes() + 1);
                } else if (existingReaction.getReactionType() == ReactionType.DISLIKE && request.reactionType() == ReactionType.LIKE) {
                    comment.setDislikes(Math.max(0, comment.getDislikes() - 1));
                    comment.setLikes(comment.getLikes() + 1);
                }
                existingReaction.setReactionType(request.reactionType());
                commentReactionRepository.save(existingReaction);
            }
        } else {
            // New reaction
            CommentReaction newReaction = new CommentReaction();
            newReaction.setUser(user);
            newReaction.setComment(comment);
            newReaction.setReactionType(request.reactionType());
            commentReactionRepository.save(newReaction);

            if (request.reactionType() == ReactionType.LIKE) {
                comment.setLikes(comment.getLikes() + 1);
            } else if (request.reactionType() == ReactionType.DISLIKE) {
                comment.setDislikes(comment.getDislikes() + 1);
            }
        }

        Comment updatedComment = commentRepository.save(comment);

        String myReaction = commentReactionRepository.findByIdUserIdAndIdCommentId(currentUserId, commentId)
                .map(r -> r.getReactionType().name())
                .orElse(null);

        return commentMapper.toCommentResponseDTO(updatedComment, myReaction, Collections.emptyList());
    }

    private void dispatchCommentNotification(Comment comment, Topic topic, Comment parentComment, User commentator) {
        try {
            User recipient = null;
            String title = null;
            String body = null;

            String commentatorAlias = Boolean.TRUE.equals(comment.getIsAnonymous())
                    ? comment.getAnonymousId()
                    : commentator.getNickname();

            if (parentComment != null && parentComment.getAuthor() != null) {
                recipient = parentComment.getAuthor();
                title = "New Reply to Your Comment";
                body = commentatorAlias + " replied to your comment: \"" + truncateString(comment.getBody(), 50) + "\"";
            } else if (topic != null && topic.getAuthor() != null) {
                recipient = topic.getAuthor();
                title = "New Comment on Your Topic";
                body = commentatorAlias + " commented on your topic \"" + topic.getTitle() + "\"";
            }

            if (recipient != null && !recipient.getId().equals(commentator.getId())) {
                notificationService.sendNotification(recipient, NotificationType.REPLY, title, body, topic);
            }
        } catch (Exception ex) {
            log.error("Failed to dispatch STOMP notification for comment ID: {}", comment.getId(), ex);
        }
    }

    private String truncateString(String str, int maxLen) {
        if (str == null || str.length() <= maxLen) {
            return str;
        }
        return str.substring(0, maxLen - 3) + "...";
    }
}
