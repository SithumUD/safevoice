package com.sithum.safevoice.dto.request;

import com.sithum.safevoice.enums.UserRole;
import jakarta.validation.constraints.NotNull;

/**
 * Body for {@code PUT /api/v1/admin/users/{id}/role} — Admin grants or
 * revokes the MODERATOR role (Section 3.1).
 */
public record UpdateUserRoleRequest(

        @NotNull(message = "role is required")
        UserRole role
) {
}
