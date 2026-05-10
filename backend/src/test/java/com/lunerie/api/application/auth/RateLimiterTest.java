package com.lunerie.api.application.auth;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimiterTest {

    private RateLimiter newLimiter(long capacity) {
        return new RateLimiter(capacity, capacity, Duration.ofMinutes(1), Duration.ofMinutes(15));
    }

    @Test
    void allowsTokensWithinCapacity() {
        RateLimiter limiter = newLimiter(3);
        assertThat(limiter.tryAcquire("ip:1.2.3.4")).isTrue();
        assertThat(limiter.tryAcquire("ip:1.2.3.4")).isTrue();
        assertThat(limiter.tryAcquire("ip:1.2.3.4")).isTrue();
    }

    @Test
    void deniesAfterCapacityExhausted() {
        RateLimiter limiter = newLimiter(2);
        limiter.tryAcquire("ip:1.2.3.4");
        limiter.tryAcquire("ip:1.2.3.4");
        assertThat(limiter.tryAcquire("ip:1.2.3.4")).isFalse();
    }

    @Test
    void probeReportsRemainingTokensWhenAllowed() {
        RateLimiter limiter = newLimiter(5);
        RateLimiter.Outcome first = limiter.probe("ip:1.2.3.4");
        assertThat(first.allowed()).isTrue();
        assertThat(first.remainingTokens()).isEqualTo(4L);
        assertThat(first.retryAfterSeconds()).isZero();
    }

    @Test
    void probeReportsRetryAfterWhenDenied() {
        RateLimiter limiter = newLimiter(1);
        limiter.probe("ip:1.2.3.4");
        RateLimiter.Outcome denied = limiter.probe("ip:1.2.3.4");
        assertThat(denied.allowed()).isFalse();
        assertThat(denied.retryAfterSeconds()).isGreaterThanOrEqualTo(1L);
        assertThat(denied.remainingTokens()).isZero();
    }

    @Test
    void perKeyBucketsAreIndependent() {
        RateLimiter limiter = newLimiter(1);
        assertThat(limiter.tryAcquire("ip:1.2.3.4")).isTrue();
        assertThat(limiter.tryAcquire("ip:1.2.3.4")).isFalse();
        assertThat(limiter.tryAcquire("ip:5.6.7.8")).isTrue();
    }
}
