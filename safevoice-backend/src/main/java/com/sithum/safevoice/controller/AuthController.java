package com.sithum.safevoice.controller;

import com.sithum.safevoice.dto.request.ConvertGuestRequest;
import com.sithum.safevoice.dto.request.LoginRequest;
import com.sithum.safevoice.dto.request.RefreshTokenRequest;
import com.sithum.safevoice.dto.request.RegisterRequest;
import com.sithum.safevoice.dto.response.AccessTokenResponse;
import com.sithum.safevoice.dto.response.JwtResponse;
import com.sithum.safevoice.dto.response.UserResponseDTO;
import com.sithum.safevoice.security.UserPrincipal;
import com.sithum.safevoice.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Spring REST Controller exposing platform Authentication & Identity endpoints.
 * Spec Section 5.1 & 7.2.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/v1/auth/register
     * Creates a new registered user account and issues JWT tokens.
     */
    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@Valid @RequestBody RegisterRequest request) {
        JwtResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/v1/auth/login
     * Authenticates user credentials and issues JWT tokens.
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/auth/refresh
     * Validates refresh token and returns a new access token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<AccessTokenResponse> refreshToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) RefreshTokenRequest requestBody) {
        AccessTokenResponse response = authService.refreshToken(authHeader, requestBody);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/auth/logout
     * Revokes active refresh token session in Redis.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (principal != null) {
            authService.logout(principal.getId(), authHeader);
        }
        return ResponseEntity.ok(Map.of("message", "Successfully logged out."));
    }

    /**
     * GET /api/v1/auth/me
     * Returns profile projection of the currently authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserResponseDTO userResponse = authService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(userResponse);
    }

    /**
     * POST /api/v1/auth/convert-guest
     * Transfers guest bookmarks and read notifications to authenticated user account.
     */
    @PostMapping("/convert-guest")
    public ResponseEntity<UserResponseDTO> convertGuest(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ConvertGuestRequest request) {
        UserResponseDTO updatedUser = authService.convertGuest(principal.getId(), request);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * POST /api/v1/auth/forgot-password
     * Dispatches password reset OTP code via email.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody com.sithum.safevoice.dto.request.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a password reset code has been sent."));
    }

    /**
     * POST /api/v1/auth/reset-password
     * Verifies OTP code and resets user password.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody com.sithum.safevoice.dto.request.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password successfully reset. Please log in with your new password."));
    }
}
