package com.lunerie.api.common;

/**
 * Thrown when a per-IP / per-user rate limit is exceeded. The optional
 * {@code retryAfterSeconds} hint surfaces in the {@code Retry-After} response
 * header so well-behaved clients can back off appropriately.
 */
public class TooManyRequestsException extends RuntimeException {

    private final long retryAfterSeconds;

    public TooManyRequestsException(String message) {
        this(message, 60L);
    }

    public TooManyRequestsException(String message, long retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = Math.max(1L, retryAfterSeconds);
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
