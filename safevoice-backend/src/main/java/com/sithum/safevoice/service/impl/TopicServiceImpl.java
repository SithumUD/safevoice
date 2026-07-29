package com.sithum.safevoice.service.impl;

import com.sithum.safevoice.dto.request.CreateTopicRequest;
import com.sithum.safevoice.dto.request.ReactionRequest;
import com.sithum.safevoice.dto.request.UpdateTopicRequest;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.dto.response.PollResponseDTO;
import com.sithum.safevoice.dto.response.TopicResponseDTO;
import com.sithum.safevoice.dto.response.TopicSummaryDTO;
import com.sithum.safevoice.entity.Poll;
import com.sithum.safevoice.entity.PollOption;
import com.sithum.safevoice.entity.SavedTopic;
import com.sithum.safevoice.entity.Topic;
import com.sithum.safevoice.entity.TopicReaction;
import com.sithum.safevoice.entity.User;
import com.sithum.safevoice.entity.id.SavedTopicId;
import com.sithum.safevoice.enums.Category;
import com.sithum.safevoice.enums.PollStatus;
import com.sithum.safevoice.enums.ReactionType;
import com.sithum.safevoice.enums.TopicStatus;
import com.sithum.safevoice.enums.UserRole;
import com.sithum.safevoice.exception.ResourceNotFoundException;
import com.sithum.safevoice.mapper.PollMapper;
import com.sithum.safevoice.mapper.TopicMapper;
import com.sithum.safevoice.repository.PollOptionRepository;
import com.sithum.safevoice.repository.PollRepository;
import com.sithum.safevoice.repository.SavedTopicRepository;
import com.sithum.safevoice.repository.TopicReactionRepository;
import com.sithum.safevoice.repository.TopicRepository;
import com.sithum.safevoice.repository.UserPollVoteRepository;
import com.sithum.safevoice.repository.UserRepository;
import com.sithum.safevoice.service.TopicService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of {@link TopicService} managing public feeds, topic creation, reactions, and bookmarks.
 */
@Slf4j
@Service
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final TopicReactionRepository topicReactionRepository;
    private final SavedTopicRepository savedTopicRepository;
    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final UserPollVoteRepository userPollVoteRepository;
    private final TopicMapper topicMapper;
    private final PollMapper pollMapper;

    public TopicServiceImpl(
            TopicRepository topicRepository,
            UserRepository userRepository,
            TopicReactionRepository topicReactionRepository,
            SavedTopicRepository savedTopicRepository,
            PollRepository pollRepository,
            PollOptionRepository pollOptionRepository,
            UserPollVoteRepository userPollVoteRepository,
            TopicMapper topicMapper,
            PollMapper pollMapper) {
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
        this.topicReactionRepository = topicReactionRepository;
        this.savedTopicRepository = savedTopicRepository;
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.userPollVoteRepository = userPollVoteRepository;
        this.topicMapper = topicMapper;
        this.pollMapper = pollMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TopicSummaryDTO> getTopicsFeed(Category category, String sort, int page, int size, UUID currentUserId) {
        Sort sortOrder = buildSortOrder(sort);
        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Page<Topic> topicPage;
        if (category != null) {
            topicPage = topicRepository.findByStatusAndCategory(TopicStatus.ACTIVE, category, pageable);
        } else {
            topicPage = topicRepository.findByStatus(TopicStatus.ACTIVE, pageable);
        }

        Page<TopicSummaryDTO> dtoPage = topicPage.map(topicMapper::toTopicSummaryDTO);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional
    public TopicResponseDTO getTopicById(UUID id, UUID currentUserId) {
        topicRepository.incrementViewCount(id);

        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic with ID '" + id + "' not found."));

        if (topic.getStatus() == TopicStatus.DELETED) {
            throw new ResourceNotFoundException("Topic with ID '" + id + "' has been deleted.");
        }

        String myReaction = null;
        boolean isSavedByMe = false;

        if (currentUserId != null) {
            myReaction = topicReactionRepository.findByIdUserIdAndIdTopicId(currentUserId, id)
                    .map(r -> r.getReactionType().name())
                    .orElse(null);
            isSavedByMe = savedTopicRepository.existsByIdUserIdAndIdTopicId(currentUserId, id);
        }

        PollResponseDTO pollResponseDTO = null;
        if (Boolean.TRUE.equals(topic.getHasPoll())) {
            pollResponseDTO = fetchPollDTO(id, currentUserId);
        }

        return topicMapper.toTopicResponseDTO(topic, pollResponseDTO, myReaction, isSavedByMe);
    }

    @Override
    @Transactional
    public TopicResponseDTO createTopic(CreateTopicRequest request, UUID currentUserId) {
        User author = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Topic topic = new Topic();
        topic.setAuthor(author);
        topic.setCategory(request.category());
        topic.setTitle(request.title());
        topic.setDescription(request.description());
        topic.setAuthorIsAnonymous(request.isAnonymous());
        topic.setMediaUrl(request.mediaUrl());
        topic.setMediaType(request.mediaType());
        topic.setStatus(TopicStatus.ACTIVE);
        topic.setHasPoll(request.poll() != null);

        Topic savedTopic = topicRepository.save(topic);

        author.setTopicsCount(author.getTopicsCount() + 1);
        userRepository.save(author);

        PollResponseDTO pollResponseDTO = null;
        if (request.poll() != null) {
            Poll poll = new Poll();
            poll.setTopic(savedTopic);
            poll.setQuestion(request.poll().question());
            poll.setIsMultipleChoice(request.poll().isMultipleChoice());
            poll.setStatus(PollStatus.OPEN);
            poll.setClosesAt(request.poll().closesAt());
            Poll savedPoll = pollRepository.save(poll);

            if (request.poll().options() != null) {
                int order = 0;
                for (String optionLabel : request.poll().options()) {
                    PollOption option = new PollOption();
                    option.setPoll(savedPoll);
                    option.setOptionOrder(order++);
                    option.setLabel(optionLabel);
                    option.setVotes(0);
                    pollOptionRepository.save(option);
                }
            }

            List<PollOption> options = pollOptionRepository.findByPollIdOrderByOptionOrderAsc(savedPoll.getId());
            pollResponseDTO = pollMapper.toPollResponseDTO(savedPoll, options, Collections.emptyList());
        }

        return topicMapper.toTopicResponseDTO(savedTopic, pollResponseDTO, null, false);
    }

    @Override
    @Transactional
    public TopicResponseDTO updateTopic(UUID id, UpdateTopicRequest request, UUID currentUserId) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic with ID '" + id + "' not found."));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        boolean isAuthor = topic.getAuthor() != null && topic.getAuthor().getId().equals(currentUserId);
        boolean isModOrAdmin = user.getRole() == UserRole.MODERATOR || user.getRole() == UserRole.ADMIN;

        if (!isAuthor && !isModOrAdmin) {
            throw new AccessDeniedException("You do not have permission to edit this topic.");
        }

        topic.setTitle(request.title());
        topic.setDescription(request.description());
        if (request.mediaUrl() != null) {
            topic.setMediaUrl(request.mediaUrl());
            topic.setMediaType(request.mediaType());
        }

        Topic updatedTopic = topicRepository.save(topic);

        PollResponseDTO pollResponseDTO = Boolean.TRUE.equals(updatedTopic.getHasPoll()) ? fetchPollDTO(id, currentUserId) : null;
        String myReaction = topicReactionRepository.findByIdUserIdAndIdTopicId(currentUserId, id)
                .map(r -> r.getReactionType().name())
                .orElse(null);
        boolean isSavedByMe = savedTopicRepository.existsByIdUserIdAndIdTopicId(currentUserId, id);

        return topicMapper.toTopicResponseDTO(updatedTopic, pollResponseDTO, myReaction, isSavedByMe);
    }

    @Override
    @Transactional
    public void deleteTopic(UUID id, UUID currentUserId, boolean isModeratorOrAdmin) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic with ID '" + id + "' not found."));

        boolean isAuthor = topic.getAuthor() != null && topic.getAuthor().getId().equals(currentUserId);

        if (!isAuthor && !isModeratorOrAdmin) {
            throw new AccessDeniedException("You do not have permission to delete this topic.");
        }

        topic.setStatus(TopicStatus.DELETED);
        topicRepository.save(topic);
    }

    @Override
    @Transactional
    public TopicResponseDTO toggleReaction(UUID id, ReactionRequest request, UUID currentUserId) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic with ID '" + id + "' not found."));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Optional<TopicReaction> existingReactionOpt = topicReactionRepository.findByIdUserIdAndIdTopicId(currentUserId, id);

        if (existingReactionOpt.isPresent()) {
            TopicReaction existingReaction = existingReactionOpt.get();
            if (existingReaction.getReactionType() == request.reactionType()) {
                // Remove reaction if user toggles the same reaction
                topicReactionRepository.delete(existingReaction);
                if (request.reactionType() == ReactionType.LIKE) {
                    topic.setLikes(Math.max(0, topic.getLikes() - 1));
                } else if (request.reactionType() == ReactionType.DISLIKE) {
                    topic.setDislikes(Math.max(0, topic.getDislikes() - 1));
                }
            } else {
                // Switch reaction type (LIKE -> DISLIKE or DISLIKE -> LIKE)
                if (existingReaction.getReactionType() == ReactionType.LIKE && request.reactionType() == ReactionType.DISLIKE) {
                    topic.setLikes(Math.max(0, topic.getLikes() - 1));
                    topic.setDislikes(topic.getDislikes() + 1);
                } else if (existingReaction.getReactionType() == ReactionType.DISLIKE && request.reactionType() == ReactionType.LIKE) {
                    topic.setDislikes(Math.max(0, topic.getDislikes() - 1));
                    topic.setLikes(topic.getLikes() + 1);
                }
                existingReaction.setReactionType(request.reactionType());
                topicReactionRepository.save(existingReaction);
            }
        } else {
            // New reaction
            TopicReaction newReaction = new TopicReaction();
            newReaction.setUser(user);
            newReaction.setTopic(topic);
            newReaction.setReactionType(request.reactionType());
            topicReactionRepository.save(newReaction);

            if (request.reactionType() == ReactionType.LIKE) {
                topic.setLikes(topic.getLikes() + 1);
            } else if (request.reactionType() == ReactionType.DISLIKE) {
                topic.setDislikes(topic.getDislikes() + 1);
            }
        }

        Topic updatedTopic = topicRepository.save(topic);

        String myReaction = topicReactionRepository.findByIdUserIdAndIdTopicId(currentUserId, id)
                .map(r -> r.getReactionType().name())
                .orElse(null);
        boolean isSavedByMe = savedTopicRepository.existsByIdUserIdAndIdTopicId(currentUserId, id);
        PollResponseDTO pollResponseDTO = Boolean.TRUE.equals(updatedTopic.getHasPoll()) ? fetchPollDTO(id, currentUserId) : null;

        return topicMapper.toTopicResponseDTO(updatedTopic, pollResponseDTO, myReaction, isSavedByMe);
    }

    @Override
    @Transactional
    public boolean toggleSaveTopic(UUID id, UUID currentUserId) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic with ID '" + id + "' not found."));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        SavedTopicId savedTopicId = new SavedTopicId(currentUserId, id);
        Optional<SavedTopic> existingOpt = savedTopicRepository.findById(savedTopicId);

        if (existingOpt.isPresent()) {
            savedTopicRepository.delete(existingOpt.get());
            return false;
        } else {
            SavedTopic savedTopic = new SavedTopic();
            savedTopic.setUser(user);
            savedTopic.setTopic(topic);
            savedTopicRepository.save(savedTopic);
            return true;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TopicSummaryDTO> getMyTopics(UUID currentUserId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Topic> topicPage = topicRepository.findByAuthorIdAndStatusNot(currentUserId, TopicStatus.DELETED, pageable);
        Page<TopicSummaryDTO> dtoPage = topicPage.map(topicMapper::toTopicSummaryDTO);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TopicSummaryDTO> getSavedTopics(UUID currentUserId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Topic> topicPage = topicRepository.findSavedTopicsByUserId(currentUserId, pageable);
        Page<TopicSummaryDTO> dtoPage = topicPage.map(topicMapper::toTopicSummaryDTO);
        return PageResponse.from(dtoPage);
    }

    private PollResponseDTO fetchPollDTO(UUID topicId, UUID currentUserId) {
        Optional<Poll> pollOpt = pollRepository.findByTopicId(topicId);
        if (pollOpt.isEmpty()) {
            return null;
        }
        Poll poll = pollOpt.get();
        List<PollOption> options = pollOptionRepository.findByPollIdOrderByOptionOrderAsc(poll.getId());

        List<UUID> votedOptionIds = Collections.emptyList();
        if (currentUserId != null) {
            votedOptionIds = userPollVoteRepository.findByIdUserIdAndIdPollId(currentUserId, poll.getId()).stream()
                    .map(v -> v.getOption().getId())
                    .collect(Collectors.toList());
        }

        return pollMapper.toPollResponseDTO(poll, options, votedOptionIds);
    }

    private Sort buildSortOrder(String sort) {
        if ("trending".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "isTrending").and(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else if ("most_commented".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "commentCount").and(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else if ("most_liked".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "likes").and(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
    }
}
