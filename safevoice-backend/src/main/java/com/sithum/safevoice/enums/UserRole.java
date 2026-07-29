package com.sithum.safevoice.enums;

/**
 * Persisted platform roles stored on {@code users.role}.
 * NOTE: GUEST and SYSTEM are logical/pseudo actors used by the RBAC matrix
 * (Section 3.1 of the spec) and Spring Security authorities, but they are
 * never persisted as a value of this column — GUEST has no user row, and
 * SYSTEM acts via internal service accounts / scheduled jobs.
 */
public enum UserRole {
    USER,
    MODERATOR,
    ADMIN
}
