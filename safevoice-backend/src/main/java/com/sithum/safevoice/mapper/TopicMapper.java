package com.sithum.safevoice.mapper;

import com.sithum.safevoice.dto.response.PollResponseDTO;
import com.sithum.safevoice.dto.response.TopicResponseDTO;
import com.sithum.safevoice.dto.response.TopicSummaryDTO;
import com.sithum.safevoice.dto.response.UserSummaryDTO;
import com.sithum.safevoice.entity.Topic;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Mapper utility for converting {@link Topic} entities into {@link TopicResponseDTO} and {@link TopicSummaryDTO}.
 * Implements strict thread-scoped anonymous author masking (Spec Section 3.3).
 */
@Component
public class TopicMapper {

    private final UserMapper userMapper;

    public TopicMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public TopicResponseDTO toTopicResponseDTO(
            Topic topic,
            PollResponseDTO pollResponseDTO,
            String myReaction,
            boolean isSavedByMe) {
        if (topic == null) {
            return null;
        }

        boolean isAnon = Boolean.TRUE.equals(topic.getAuthorIsAnonymous());
        UserSummaryDTO authorDTO = isAnon ? null : userMapper.toUserSummaryDTO(topic.getAuthor());
        String authorNickname = computeAuthorNickname(topic, isAnon);

        return new TopicResponseDTO(
                topic.getId(),
                authorDTO,
                authorNickname,
                isAnon,
                topic.getCategory(),
                topic.getTitle(),
                topic.getDescription(),
                topic.getMediaUrl(),
                topic.getMediaType(),
                topic.getViews(),
                topic.getLikes(),
                topic.getDislikes(),
                topic.getCommentCount(),
                Boolean.TRUE.equals(topic.getIsTrending()),
                Boolean.TRUE.equals(topic.getHasPoll()),
                pollResponseDTO,
                topic.getStatus(),
                myReaction,
                isSavedByMe,
                topic.getCreatedAt(),
                topic.getUpdatedAt()
        );
    }

    public TopicSummaryDTO toTopicSummaryDTO(Topic topic) {
        if (topic == null) {
            return null;
        }

        boolean isAnon = Boolean.TRUE.equals(topic.getAuthorIsAnonymous());
        UserSummaryDTO authorDTO = isAnon ? null : userMapper.toUserSummaryDTO(topic.getAuthor());
        String authorNickname = computeAuthorNickname(topic, isAnon);

        String excerpt = topic.getDescription();
        if (excerpt != null && excerpt.length() > 150) {
            excerpt = excerpt.substring(0, 147) + "...";
        }

        return new TopicSummaryDTO(
                topic.getId(),
                authorDTO,
                authorNickname,
                isAnon,
                topic.getCategory(),
                topic.getTitle(),
                excerpt,
                topic.getMediaType(),
                topic.getMediaUrl(),
                topic.getViews(),
                topic.getLikes(),
                topic.getDislikes(),
                topic.getCommentCount(),
                Boolean.TRUE.equals(topic.getIsTrending()),
                Boolean.TRUE.equals(topic.getHasPoll()),
                topic.getCreatedAt()
        );
    }

    private String computeAuthorNickname(Topic topic, boolean isAnon) {
        if (isAnon) {
            UUID authorId = topic.getAuthor() != null ? topic.getAuthor().getId() : UUID.randomUUID();
            UUID topicId = topic.getId() != null ? topic.getId() : UUID.randomUUID();
            int seed = Math.abs((authorId.toString() + topicId.toString()).hashCode());
            int num = (seed % 900) + 100;
            return "Anon #" + num;
        } else {
            return topic.getAuthor() != null ? topic.getAuthor().getNickname() : "Anonymous User";
        }
    }
}
