package com.sithum.safevoice.repository;

import com.sithum.safevoice.entity.Report;
import com.sithum.safevoice.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

/**
 * Repository interface for {@link Report} entity operations.
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {

    Page<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);

    long countByStatus(ReportStatus status);

    long countByStatusAndResolvedAtAfter(ReportStatus status, Instant date);
}
