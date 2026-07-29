package com.sithum.safevoice.enums;

/**
 * Convenience enum for moderator-issued temporary suspensions
 * (Section 3.1 — 24h, 7d, 30d). Not a persisted DB column; used by the
 * moderation service/DTO layer to compute a {@code suspendedUntil} instant.
 */
public enum SuspensionDuration {
    ONE_DAY(24),
    SEVEN_DAYS(24 * 7),
    THIRTY_DAYS(24 * 30);

    private final int hours;

    SuspensionDuration(int hours) {
        this.hours = hours;
    }

    public int getHours() {
        return hours;
    }
}
