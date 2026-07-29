package com.sithum.safevoice.mapper;

import com.sithum.safevoice.dto.response.CommentResponseDTO;
import com.sithum.safevoice.dto.response.UserSummaryDTO;
import com.sithum.safevoice.entity.Comment;
import com.sithum.safevoice.enums.CommentStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Mapper utility for converting {@link Comment} entities into hierarchical {@link CommentResponseDTO} trees.
 * Implements strict thread-scoped anonymous masking and memory-based tree assembly.
 */
@Component
public class CommentMapper {

    private static final String DELETED_COMMENT_PLACEHOLDER = "[This content has been removed for violating community guidelines]";

    private final UserMapper userMapper;

    public CommentMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public CommentResponseDTO toCommentResponseDTO(Comment comment, String myReaction, List<CommentResponseDTO> replies) {
        if (comment == null) {
            return null;
        }

        boolean isAnon = Boolean.TRUE.equals(comment.getIsAnonymous());
        UserSummaryDTO authorDTO = isAnon ? null : userMapper.toUserSummaryDTO(comment.getAuthor());
        String authorNickname = computeAuthorNickname(comment, isAnon);

        String displayBody = (comment.getStatus() == CommentStatus.DELETED)
                ? DELETED_COMMENT_PLACEHOLDER
                : comment.getBody();

        UUID parentId = comment.getParentComment() != null ? comment.getParentComment().getId() : null;

        return new CommentResponseDTO(
                comment.getId(),
                comment.getTopic() != null ? comment.getTopic().getId() : null,
                parentId,
                authorDTO,
                authorNickname,
                isAnon,
                displayBody,
                comment.getStatus() == CommentStatus.DELETED ? null : comment.getMediaUrl(),
                comment.getStatus() == CommentStatus.DELETED ? null : comment.getMediaType(),
                comment.getLikes(),
                comment.getDislikes(),
                comment.getDepth(),
                comment.getStatus(),
                myReaction,
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                replies != null ? replies : Collections.emptyList()
        );
    }

    /**
     * Builds a hierarchical tree of {@link CommentResponseDTO} from a flat list of comments ordered by creation date.
     */
    public List<CommentResponseDTO> buildCommentTree(List<Comment> flatComments, Map<UUID, String> userReactionsMap) {
        if (flatComments == null || flatComments.isEmpty()) {
            return Collections.emptyList();
        }

        Map<UUID, List<Comment>> childrenMap = new HashMap<>();
        List<Comment> roots = new ArrayList<>();

        for (Comment comment : flatComments) {
            UUID parentId = comment.getParentComment() != null ? comment.getParentComment().getId() : null;
            if (parentId == null) {
                roots.add(comment);
            } else {
                childrenMap.computeIfAbsent(parentId, k -> new ArrayList<>()).add(comment);
            }
        }

        return roots.stream()
                .map(root -> assembleTreeRecursive(root, childrenMap, userReactionsMap))
                .collect(Collectors.toList());
    }

    private CommentResponseDTO assembleTreeRecursive(
            Comment parent,
            Map<UUID, List<Comment>> childrenMap,
            Map<UUID, String> userReactionsMap) {
        List<Comment> children = childrenMap.getOrDefault(parent.getId(), Collections.emptyList());

        List<CommentResponseDTO> childDTOs = children.stream()
                .map(child -> assembleTreeRecursive(child, childrenMap, userReactionsMap))
                .collect(Collectors.toList());

        String myReaction = userReactionsMap != null ? userReactionsMap.get(parent.getId()) : null;
        return toCommentResponseDTO(parent, myReaction, childDTOs);
    }

    private String computeAuthorNickname(Comment comment, boolean isAnon) {
        if (isAnon) {
            if (comment.getAnonymousId() != null && !comment.getAnonymousId().isBlank()) {
                return comment.getAnonymousId();
            }
            UUID authorId = comment.getAuthor() != null ? comment.getAuthor().getId() : UUID.randomUUID();
            UUID topicId = comment.getTopic() != null ? comment.getTopic().getId() : UUID.randomUUID();
            int seed = Math.abs((authorId.toString() + topicId.toString()).hashCode());
            int num = (seed % 900) + 100;
            return "Anon #" + num;
        } else {
            return comment.getAuthor() != null ? comment.getAuthor().getNickname() : "Anonymous User";
        }
    }
}
