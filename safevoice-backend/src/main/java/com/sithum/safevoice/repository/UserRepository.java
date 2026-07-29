package com.sithum.safevoice.repository;

import com.sithum.safevoice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for {@link User} entity persistence operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByNickname(String nickname);

    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);

    long countByStatus(com.sithum.safevoice.enums.UserStatus status);

    long countByCreatedAtAfter(java.time.Instant date);

    org.springframework.data.domain.Page<User> findByEmailContainingIgnoreCaseOrNicknameContainingIgnoreCase(
            String email, String nickname, org.springframework.data.domain.Pageable pageable);
}
