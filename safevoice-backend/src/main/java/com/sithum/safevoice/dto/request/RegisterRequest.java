package com.sithum.safevoice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Body for {@code POST /api/v1/auth/register}.
 */
public record RegisterRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid address")
        @Size(max = 255)
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
        String password,

        @NotBlank(message = "Nickname is required")
        @Size(min = 3, max = 50, message = "Nickname must be between 3 and 50 characters")
        @Pattern(regexp = "^[a-zA-Z0-9_.]+$", message = "Nickname may only contain letters, numbers, underscores and dots")
        String nickname
) {
}
