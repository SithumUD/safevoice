package com.sithum.safevoice.repository;

import com.sithum.safevoice.entity.UserReadGlobalNotification;
import com.sithum.safevoice.entity.id.UserReadGlobalNotificationId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository interface for {@link UserReadGlobalNotification} entity operations.
 */
@Repository
public interface UserReadGlobalNotificationRepository extends JpaRepository<UserReadGlobalNotification, UserReadGlobalNotificationId> {

    boolean existsByIdUserIdAndIdGlobalNotificationId(UUID userId, UUID globalNotificationId);
}
