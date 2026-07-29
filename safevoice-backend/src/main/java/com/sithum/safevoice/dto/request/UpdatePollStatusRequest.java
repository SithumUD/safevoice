package com.sithum.safevoice.dto.request;

import java.time.Instant;

/**
 * Request payload for toggling/updating poll closesAt timestamp and status.
 */
public record UpdatePollStatusRequest(
        Instant closesAt
) {
}
