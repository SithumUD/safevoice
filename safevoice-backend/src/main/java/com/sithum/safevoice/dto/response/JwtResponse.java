package com.sithum.safevoice.dto.response;

/**
 * Response for {@code POST /api/v1/auth/login} and
 * {@code POST /api/v1/auth/register}
 * (Spec Section 7.2 — {accessToken, refreshToken, user}).
 */
public record JwtResponse(

        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInSeconds,
        UserResponseDTO user
) {
    public JwtResponse(String accessToken, String refreshToken, long expiresInSeconds, UserResponseDTO user) {
        this(accessToken, refreshToken, "Bearer", expiresInSeconds, user);
    }
}
