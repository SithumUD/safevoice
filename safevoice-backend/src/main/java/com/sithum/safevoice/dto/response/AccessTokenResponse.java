package com.sithum.safevoice.dto.response;

/**
 * Response for {@code POST /api/v1/auth/refresh} — returns only a new
 * access token; the refresh token is unchanged and remains in Redis.
 */
public record AccessTokenResponse(

        String accessToken,
        String tokenType,
        long expiresInSeconds
) {
    public AccessTokenResponse(String accessToken, long expiresInSeconds) {
        this(accessToken, "Bearer", expiresInSeconds);
    }
}
