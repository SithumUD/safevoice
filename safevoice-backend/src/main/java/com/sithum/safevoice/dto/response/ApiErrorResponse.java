package com.sithum.safevoice.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Uniform error envelope returned by {@code GlobalExceptionHandler} for
 * every 4xx/5xx response (e.g. 401 Unauthorized, 403 Forbidden,
 * 404 Not Found, 409 Conflict on duplicate poll vote, 422 validation
 * errors).
 */
public record ApiErrorResponse(

        Instant timestamp,
        int status,
        String error,
        String message,
        String path,

        /** Field -> message, populated only for @Valid request-body validation failures. */
        Map<String, String> validationErrors,

        List<String> details
) {
    public ApiErrorResponse(int status, String error, String message, String path) {
        this(Instant.now(), status, error, message, path, Map.of(), List.of());
    }

    public ApiErrorResponse(int status, String error, String message, String path, Map<String, String> validationErrors) {
        this(Instant.now(), status, error, message, path, validationErrors, List.of());
    }
}
