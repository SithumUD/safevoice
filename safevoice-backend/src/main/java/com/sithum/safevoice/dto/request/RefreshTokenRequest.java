package com.sithum.safevoice.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Optional body for {@code POST /api/v1/auth/refresh} when the refresh
 * token is supplied in the request body instead of the
 * {@code Authorization: Bearer <RefreshToken>} header.
 */
public record RefreshTokenRequest(

        @NotBlank(message = "Refresh token is required")
        String refreshToken
) {
}
