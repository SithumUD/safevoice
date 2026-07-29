package com.sithum.safevoice.repository;

import com.sithum.safevoice.entity.PollOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for {@link PollOption} entity operations.
 */
@Repository
public interface PollOptionRepository extends JpaRepository<PollOption, UUID> {

    List<PollOption> findByPollIdOrderByOptionOrderAsc(UUID pollId);
}
