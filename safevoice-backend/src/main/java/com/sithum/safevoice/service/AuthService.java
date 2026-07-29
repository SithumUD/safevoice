package com.sithum.safevoice.service;

import com.sithum.safevoice.dto.request.ConvertGuestRequest;
import com.sithum.safevoice.dto.request.LoginRequest;
import com.sithum.safevoice.dto.request.RefreshTokenRequest;
import com.sithum.safevoice.dto.request.RegisterRequest;
import com.sithum.safevoice.dto.response.AccessTokenResponse;
import com.sithum.safevoice.dto.response.JwtResponse;
import com.sithum.safevoice.dto.response.UserResponseDTO;

import java.util.UUID;

/**
 * Service interface managing user authentication, registration, JWT session tokens, and guest conversion.
 */
public interface AuthService {

    /**
     * Registers a new user account and returns JWT tokens with profile DTO.
     */
    JwtResponse register(RegisterRequest request);

    /**
     * Authenticates user credentials and returns JWT tokens with profile DTO.
     */
    JwtResponse login(LoginRequest request);

    /**
     * Validates refresh token and issues a new access token.
     */
    AccessTokenResponse refreshToken(String authHeader, RefreshTokenRequest requestBody);

    /**
     * Revokes user refresh token session in Redis upon logout.
     */
    void logout(UUID userId, String authHeader);

    /**
     * Retrieves the profile projection of the currently authenticated user.
     */
    UserResponseDTO getCurrentUser(UUID userId);

    /**
     * Transfers guest bookmarks and read notifications to an authenticated user account.
     */
    UserResponseDTO convertGuest(UUID userId, ConvertGuestRequest request);

    /**
     * Generates a 6-digit OTP for password reset, stores it in Redis, and dispatches via email.
     */
    void forgotPassword(com.sithum.safevoice.dto.request.ForgotPasswordRequest request);

    /**
     * Verifies the OTP from Redis and resets user password.
     */
    void resetPassword(com.sithum.safevoice.dto.request.ResetPasswordRequest request);
}
