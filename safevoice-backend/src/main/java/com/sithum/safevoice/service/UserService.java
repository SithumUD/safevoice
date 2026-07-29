package com.sithum.safevoice.service;

import com.sithum.safevoice.dto.request.ChangePasswordRequest;
import com.sithum.safevoice.dto.request.UpdateProfileRequest;
import com.sithum.safevoice.dto.response.UserProfileResponseDTO;

import java.util.UUID;

/**
 * Service interface managing user profiles and security password updates.
 */
public interface UserService {

    /**
     * Retrieves public/private profile details for a given user.
     */
    UserProfileResponseDTO getUserProfile(UUID userId);

    /**
     * Updates active user profile fields (nickname, bio, avatarUrl).
     */
    UserProfileResponseDTO updateProfile(UUID userId, UpdateProfileRequest request);

    /**
     * Changes active user password with BCrypt re-hashing and invalidates active Redis sessions.
     */
    void changePassword(UUID userId, ChangePasswordRequest request);

    /**
     * Updates active user's FCM registration token for push notifications.
     */
    void updateFcmToken(UUID userId, String fcmToken);
}
