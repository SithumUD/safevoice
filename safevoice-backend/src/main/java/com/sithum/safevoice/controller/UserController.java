package com.sithum.safevoice.controller;

import com.sithum.safevoice.dto.request.ChangePasswordRequest;
import com.sithum.safevoice.dto.request.UpdateProfileRequest;
import com.sithum.safevoice.dto.response.UserProfileResponseDTO;
import com.sithum.safevoice.security.UserPrincipal;
import com.sithum.safevoice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

/**
 * Spring REST Controller exposing User Profile Management Endpoints.
 * Spec Section 5.2 & 7.2.
 */
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/v1/users/{id}
     * Public endpoint returning public profile stats and details for a given user ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponseDTO> getUserProfile(@PathVariable("id") UUID id) {
        UserProfileResponseDTO response = userService.getUserProfile(id);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/v1/users/me
     * Updates active user profile details (nickname, bio, avatarUrl).
     */
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        UserProfileResponseDTO response = userService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/v1/users/me/password
     * Changes active user password and revokes active Redis refresh tokens across sessions.
     */
    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        userService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password successfully changed. Please log in again."));
    }

    /**
     * PUT /api/v1/users/me/fcm-token
     * Updates active user's FCM registration token for push notifications.
     */
    @PutMapping("/me/fcm-token")
    public ResponseEntity<Map<String, String>> updateFcmToken(
            @Valid @RequestBody com.sithum.safevoice.dto.request.UpdateFcmTokenRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        userService.updateFcmToken(principal.getId(), request.getFcmToken());
        return ResponseEntity.ok(Map.of("message", "FCM token updated successfully."));
    }
}
