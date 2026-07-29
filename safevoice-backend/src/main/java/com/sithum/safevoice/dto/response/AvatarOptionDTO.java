package com.sithum.safevoice.dto.response;

/**
 * Projection representing a selectable default platform avatar option.
 */
public record AvatarOptionDTO(
        String id,
        String name,
        String url,
        String category
) {
}
