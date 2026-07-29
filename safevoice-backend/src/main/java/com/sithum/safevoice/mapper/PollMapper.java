package com.sithum.safevoice.mapper;

import com.sithum.safevoice.dto.response.PollOptionResponseDTO;
import com.sithum.safevoice.dto.response.PollResponseDTO;
import com.sithum.safevoice.entity.Poll;
import com.sithum.safevoice.entity.PollOption;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Mapper utility for converting {@link Poll} and {@link PollOption} entities into public DTOs.
 */
@Component
public class PollMapper {

    public PollResponseDTO toPollResponseDTO(Poll poll, List<PollOption> options, List<UUID> userVotedOptionIds) {
        if (poll == null) {
            return null;
        }

        int totalVotes = poll.getTotalVotes() != null ? poll.getTotalVotes() : 0;

        List<PollOptionResponseDTO> optionDTOs = (options != null)
                ? options.stream().map(opt -> {
            int votes = opt.getVotes() != null ? opt.getVotes() : 0;
            double percentage = (totalVotes > 0) ? Math.round((votes * 100.0 / totalVotes) * 100.0) / 100.0 : 0.0;
            return new PollOptionResponseDTO(
                    opt.getId(),
                    opt.getOptionOrder(),
                    opt.getLabel(),
                    votes,
                    percentage
            );
        }).collect(Collectors.toList())
                : Collections.emptyList();

        return new PollResponseDTO(
                poll.getId(),
                poll.getTopic() != null ? poll.getTopic().getId() : null,
                poll.getQuestion(),
                Boolean.TRUE.equals(poll.getIsMultipleChoice()),
                totalVotes,
                poll.getStatus(),
                poll.getClosesAt(),
                optionDTOs,
                userVotedOptionIds != null ? userVotedOptionIds : Collections.emptyList(),
                poll.getCreatedAt(),
                poll.getUpdatedAt()
        );
    }
}
