package com.sithum.safevoice.service.impl;

import com.sithum.safevoice.dto.request.ChangePasswordRequest;
import com.sithum.safevoice.dto.request.UpdateProfileRequest;
import com.sithum.safevoice.dto.response.UserProfileResponseDTO;
import com.sithum.safevoice.entity.User;
import com.sithum.safevoice.exception.ResourceNotFoundException;
import com.sithum.safevoice.repository.UserRepository;
import com.sithum.safevoice.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

/**
 * Implementation of {@link UserService} handling user profile details, profile updates, and password changes.
 */
@Slf4j
@Service
public class UserServiceImpl implements UserService {

    private static final String REDIS_SESSION_PREFIX = "session:";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate stringRedisTemplate;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            StringRedisTemplate stringRedisTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.stringRedisTemplate = stringRedisTemplate;
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));

        return toUserProfileResponseDTO(user);
    }

    @Override
    @Transactional
    public UserProfileResponseDTO updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));

        if (request.nickname() != null && !request.nickname().isBlank() && !request.nickname().equals(user.getNickname())) {
            if (userRepository.existsByNickname(request.nickname())) {
                throw new IllegalArgumentException("Nickname '" + request.nickname() + "' is already taken.");
            }
            user.setNickname(request.nickname());
        }

        if (request.bio() != null) {
            user.setBio(request.bio());
        }

        if (request.avatarUrl() != null && !request.avatarUrl().isBlank()) {
            user.setAvatarUrl(request.avatarUrl());
        }

        User updatedUser = userRepository.save(user);
        log.info("Successfully updated profile for user ID: {}", userId);
        return toUserProfileResponseDTO(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));

        if (!passwordEncoder.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid old password provided.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // Revoke active sessions in Redis upon password change
        revokeUserSessions(userId);
        log.info("Password successfully changed for user ID: {}", userId);
    }

    @Override
    @Transactional
    public void updateFcmToken(UUID userId, String fcmToken) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));

        user.setFcmToken(fcmToken);
        userRepository.save(user);
        log.info("FCM token updated for user ID: {}", userId);
    }

    private UserProfileResponseDTO toUserProfileResponseDTO(User user) {
        return new UserProfileResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getRole(),
                user.getStatus(),
                user.getTopicsCount(),
                user.getCommentsCount(),
                user.getPollVotesCount(),
                user.getCreatedAt()
        );
    }

    private void revokeUserSessions(UUID userId) {
        Set<String> keys = stringRedisTemplate.keys(REDIS_SESSION_PREFIX + userId + ":*");
        if (keys != null && !keys.isEmpty()) {
            stringRedisTemplate.delete(keys);
        }
    }
}
