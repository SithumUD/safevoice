package com.sithum.safevoice.repository;

import com.sithum.safevoice.entity.GlobalNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository interface for {@link GlobalNotification} entity operations.
 */
@Repository
public interface GlobalNotificationRepository extends JpaRepository<GlobalNotification, UUID> {

    Page<GlobalNotification> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
