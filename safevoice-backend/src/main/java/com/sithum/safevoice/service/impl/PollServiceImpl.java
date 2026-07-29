package com.sithum.safevoice.service.impl;

import com.sithum.safevoice.dto.request.CreatePollRequest;
import com.sithum.safevoice.dto.request.UpdatePollStatusRequest;
import com.sithum.safevoice.dto.request.VoteRequest;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.dto.response.PollResponseDTO;
import com.sithum.safevoice.dto.response.PollVoteBroadcastDTO;
import com.sithum.safevoice.entity.Poll;
import com.sithum.safevoice.entity.PollOption;
import com.sithum.safevoice.entity.Topic;
import com.sithum.safevoice.entity.User;
import com.sithum.safevoice.entity.UserPollVote;
import com.sithum.safevoice.enums.PollStatus;
import com.sithum.safevoice.exception.DuplicateVoteException;
import com.sithum.safevoice.exception.PollClosedException;
import com.sithum.safevoice.exception.ResourceNotFoundException;
import com.sithum.safevoice.mapper.PollMapper;
import com.sithum.safevoice.repository.PollOptionRepository;
import com.sithum.safevoice.repository.PollRepository;
import com.sithum.safevoice.repository.TopicRepository;
import com.sithum.safevoice.repository.UserPollVoteRepository;
import com.sithum.safevoice.repository.UserRepository;
import com.sithum.safevoice.service.PollService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of {@link PollService} managing poll voting, CRUD operations, duplicate prevention, and real-time STOMP pushes.
 */
@Slf4j
@Service
public class PollServiceImpl implements PollService {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final UserPollVoteRepository userPollVoteRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final PollMapper pollMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public PollServiceImpl(
            PollRepository pollRepository,
            PollOptionRepository pollOptionRepository,
            UserPollVoteRepository userPollVoteRepository,
            UserRepository userRepository,
            TopicRepository topicRepository,
            PollMapper pollMapper,
            SimpMessagingTemplate messagingTemplate) {
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.userPollVoteRepository = userPollVoteRepository;
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
        this.pollMapper = pollMapper;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PollResponseDTO> getPolls(int page, int size, UUID currentUserId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Poll> pollPage = pollRepository.findAll(pageable);

        Page<PollResponseDTO> dtoPage = pollPage.map(poll -> {
            List<PollOption> options = pollOptionRepository.findByPollIdOrderByOptionOrderAsc(poll.getId());
            List<UUID> userVotedOptionIds = Collections.emptyList();
            if (currentUserId != null) {
                userVotedOptionIds = userPollVoteRepository.findByIdUserIdAndIdPollId(currentUserId, poll.getId()).stream()
                        .map(v -> v.getOption().getId())
                        .collect(Collectors.toList());
            }
            return pollMapper.toPollResponseDTO(poll, options, userVotedOptionIds);
        });

        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PollResponseDTO getPollById(UUID pollId, UUID currentUserId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll with ID '" + pollId + "' not found."));

        List<PollOption> options = pollOptionRepository.findByPollIdOrderByOptionOrderAsc(pollId);

        List<UUID> userVotedOptionIds = Collections.emptyList();
        if (currentUserId != null) {
            userVotedOptionIds = userPollVoteRepository.findByIdUserIdAndIdPollId(currentUserId, pollId).stream()
                    .map(v -> v.getOption().getId())
                    .collect(Collectors.toList());
        }

        return pollMapper.toPollResponseDTO(poll, options, userVotedOptionIds);
    }

    @Override
    @Transactional
    public PollResponseDTO createPoll(CreatePollRequest request, UUID currentUserId) {
        Topic topic = null;
        if (request.topicId() != null) {
            topic = topicRepository.findById(request.topicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Topic with ID '" + request.topicId() + "' not found."));
            topic.setHasPoll(true);
            topicRepository.save(topic);
        }

        Poll poll = new Poll();
        poll.setTopic(topic);
        poll.setQuestion(request.question());
        poll.setIsMultipleChoice(Boolean.TRUE.equals(request.isMultipleChoice()));
        poll.setStatus(PollStatus.OPEN);
        poll.setClosesAt(request.closesAt());
        poll.setTotalVotes(0);

        Poll savedPoll = pollRepository.save(poll);

        if (request.options() != null) {
            int order = 0;
            for (String label : request.options()) {
                if (label != null && !label.trim().isEmpty()) {
                    PollOption option = new PollOption();
                    option.setPoll(savedPoll);
                    option.setOptionOrder(order++);
                    option.setLabel(label.trim());
                    option.setVotes(0);
                    pollOptionRepository.save(option);
                }
            }
        }

        List<PollOption> options = pollOptionRepository.findByPollIdOrderByOptionOrderAsc(savedPoll.getId());
        return pollMapper.toPollResponseDTO(savedPoll, options, Collections.emptyList());
    }

    @Override
    @Transactional
    public PollResponseDTO togglePollStatus(UUID pollId, UpdatePollStatusRequest request) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll with ID '" + pollId + "' not found."));

        poll.setClosesAt(request.closesAt());
        if (request.closesAt() != null && request.closesAt().isBefore(Instant.now())) {
            poll.setStatus(PollStatus.CLOSED);
        } else {
            poll.setStatus(PollStatus.OPEN);
        }

        Poll updatedPoll = pollRepository.save(poll);
        List<PollOption> options = pollOptionRepository.findByPollIdOrderByOptionOrderAsc(pollId);
        return pollMapper.toPollResponseDTO(updatedPoll, options, Collections.emptyList());
    }

    @Override
    @Transactional
    public void deletePoll(UUID pollId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll with ID '" + pollId + "' not found."));

        if (poll.getTopic() != null) {
            Topic topic = poll.getTopic();
            topic.setHasPoll(false);
            topicRepository.save(topic);
        }

        pollRepository.delete(poll);
    }

    @Override
    @Transactional
    public PollResponseDTO submitVote(UUID pollId, VoteRequest request, UUID currentUserId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll with ID '" + pollId + "' not found."));

        if (poll.getStatus() != PollStatus.OPEN || (poll.getClosesAt() != null && poll.getClosesAt().isBefore(Instant.now()))) {
            throw new PollClosedException("This poll is closed or has expired.");
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        List<UserPollVote> existingVotes = userPollVoteRepository.findByIdUserIdAndIdPollId(currentUserId, pollId);
        if (!existingVotes.isEmpty()) {
            throw new DuplicateVoteException("You have already cast a vote on this poll.");
        }

        if (!Boolean.TRUE.equals(poll.getIsMultipleChoice()) && request.optionIds().size() > 1) {
            throw new PollClosedException("This poll is single-choice only. You may select only one option.");
        }

        for (UUID optionId : request.optionIds()) {
            PollOption option = pollOptionRepository.findById(optionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Poll option with ID '" + optionId + "' not found."));

            if (!option.getPoll().getId().equals(pollId)) {
                throw new ResourceNotFoundException("Option '" + optionId + "' does not belong to poll '" + pollId + "'.");
            }

            UserPollVote pollVote = new UserPollVote();
            pollVote.setUser(user);
            pollVote.setPoll(poll);
            pollVote.setOption(option);
            userPollVoteRepository.save(pollVote);

            option.setVotes(option.getVotes() + 1);
            pollOptionRepository.save(option);
        }

        poll.setTotalVotes(poll.getTotalVotes() + request.optionIds().size());
        Poll updatedPoll = pollRepository.save(poll);

        user.setPollVotesCount(user.getPollVotesCount() + request.optionIds().size());
        userRepository.save(user);

        List<PollOption> options = pollOptionRepository.findByPollIdOrderByOptionOrderAsc(pollId);

        // Broadcast updated poll tally via STOMP WebSocket to /topic/polls/{pollId}
        broadcastPollUpdate(updatedPoll, options);

        return pollMapper.toPollResponseDTO(updatedPoll, options, request.optionIds());
    }

    private void broadcastPollUpdate(Poll poll, List<PollOption> options) {
        try {
            int totalVotes = poll.getTotalVotes() != null ? poll.getTotalVotes() : 0;
            List<PollVoteBroadcastDTO.OptionTally> tallies = options.stream().map(opt -> {
                int votes = opt.getVotes() != null ? opt.getVotes() : 0;
                double percentage = (totalVotes > 0) ? Math.round((votes * 100.0 / totalVotes) * 100.0) / 100.0 : 0.0;
                return new PollVoteBroadcastDTO.OptionTally(opt.getId(), votes, percentage);
            }).collect(Collectors.toList());

            PollVoteBroadcastDTO broadcastPayload = new PollVoteBroadcastDTO(poll.getId(), totalVotes, tallies);
            messagingTemplate.convertAndSend("/topic/polls/" + poll.getId(), broadcastPayload);
            log.info("Successfully broadcasted live vote update over STOMP for poll ID: {}", poll.getId());
        } catch (Exception ex) {
            log.error("Failed to broadcast STOMP live vote update for poll ID: {}", poll.getId(), ex);
        }
    }
}
