package com.lunerie.api.common;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TooManyRequestsExceptionTest {

    @Test
    void defaultRetryAfterIs60Seconds() {
        TooManyRequestsException ex = new TooManyRequestsException("slow down");
        assertThat(ex.getRetryAfterSeconds()).isEqualTo(60L);
        assertThat(ex.getMessage()).isEqualTo("slow down");
    }

    @Test
    void retryAfterIsNeverLessThanOneSecond() {
        TooManyRequestsException ex = new TooManyRequestsException("slow", 0);
        assertThat(ex.getRetryAfterSeconds()).isEqualTo(1L);
    }

    @Test
    void negativeRetryAfterClampsToOne() {
        TooManyRequestsException ex = new TooManyRequestsException("slow", -42);
        assertThat(ex.getRetryAfterSeconds()).isEqualTo(1L);
    }

    @Test
    void retainsExplicitRetryAfter() {
        TooManyRequestsException ex = new TooManyRequestsException("slow", 47);
        assertThat(ex.getRetryAfterSeconds()).isEqualTo(47L);
    }
}
