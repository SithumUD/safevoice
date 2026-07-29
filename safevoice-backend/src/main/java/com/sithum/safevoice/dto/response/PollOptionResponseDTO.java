package com.sithum.safevoice.dto.response;

import java.util.UUID;

/**
 * Single option within a {@link PollResponseDTO}, including the
 * server-computed vote percentage for progress-bar rendering.
 */
public record PollOptionResponseDTO(

        UUID id,
        Integer optionOrder,
        String label,
        Integer votes,
        double percentage
) {
}
