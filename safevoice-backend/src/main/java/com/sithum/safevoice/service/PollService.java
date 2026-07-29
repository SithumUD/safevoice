package com.sithum.safevoice.service;

import com.sithum.safevoice.dto.request.CreatePollRequest;
import com.sithum.safevoice.dto.request.UpdatePollStatusRequest;
import com.sithum.safevoice.dto.request.VoteRequest;
import com.sithum.safevoice.dto.response.PageResponse;
import com.sithum.safevoice.dto.response.PollResponseDTO;

import java.util.UUID;

/**
 * Service interface managing poll detail queries, CRUD operations, atomic voting logic, single-vote constraints, and STOMP live pushes.
 */
public interface PollService {

    /**
     * Retrieves paginated list of polls.
     */
    PageResponse<PollResponseDTO> getPolls(int page, int size, UUID currentUserId);

    /**
     * Retrieves full poll details, option progress bar percentages, and requesting user's voting state.
     */
    PollResponseDTO getPollById(UUID pollId, UUID currentUserId);

    /**
     * Creates a new poll with options.
     */
    PollResponseDTO createPoll(CreatePollRequest request, UUID currentUserId);

    /**
     * Toggles or updates poll status/closesAt timestamp.
     */
    PollResponseDTO togglePollStatus(UUID pollId, UpdatePollStatusRequest request);

    /**
     * Deletes a poll by ID.
     */
    void deletePoll(UUID pollId);

    /**
     * Submits a user vote, updates option & total vote counters, and broadcasts live progress over STOMP WebSocket.
     */
    PollResponseDTO submitVote(UUID pollId, VoteRequest request, UUID currentUserId);
}
