package com.sithum.safevoice.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Generic paginated envelope used by every listing endpoint
 * (e.g. {@code GET /api/v1/topics?page=&size=}), decoupled from Spring
 * Data's {@code Page<T>} so it stays stable on the wire regardless of
 * the underlying repository implementation.
 */
public record PageResponse<T>(

        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious()
        );
    }
}
