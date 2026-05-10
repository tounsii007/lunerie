package com.lunerie.api.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.lunerie.api.common.ApiError.FieldViolation;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ApiErrorTest {

    private final ObjectMapper json = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    void factoryProducesCanonicalShape() {
        ApiError err = ApiError.of(404, "RESOURCE_NOT_FOUND", "Not found", "/api/places/42");
        assertThat(err.status()).isEqualTo(404);
        assertThat(err.code()).isEqualTo("RESOURCE_NOT_FOUND");
        assertThat(err.path()).isEqualTo("/api/places/42");
        assertThat(err.timestamp()).isNotNull();
        assertThat(err.violations()).isNull();
    }

    @Test
    void enrichersAreImmutable() {
        ApiError base = ApiError.of(429, "TOO_MANY_REQUESTS", "Slow down", "/api/auth/login");
        ApiError enriched = base.withMethod("POST").withRequestId("req-1").withRetryAfter(30L);

        assertThat(base.method()).isNull();
        assertThat(base.requestId()).isNull();
        assertThat(base.retryAfterSeconds()).isNull();

        assertThat(enriched.method()).isEqualTo("POST");
        assertThat(enriched.requestId()).isEqualTo("req-1");
        assertThat(enriched.retryAfterSeconds()).isEqualTo(30L);
    }

    @Test
    void violationsAreSerializedWhenPresent() throws Exception {
        ApiError err = ApiError.of(400, "VALIDATION_FAILED", "Bad",
                "/api/auth/register",
                List.of(new FieldViolation("password", "too short", "***")));
        String body = json.writeValueAsString(err);
        assertThat(body).contains("\"violations\"");
        assertThat(body).contains("\"field\":\"password\"");
        assertThat(body).contains("\"rejectedValue\":\"***\"");
    }

    @Test
    void nullsAreOmittedFromJson() throws Exception {
        ApiError err = ApiError.of(500, "INTERNAL_ERROR", "boom", "/api/x");
        String body = json.writeValueAsString(err);
        // method, requestId, retryAfterSeconds, violations are null → JsonInclude.NON_NULL
        assertThat(body).doesNotContain("\"method\"");
        assertThat(body).doesNotContain("\"requestId\"");
        assertThat(body).doesNotContain("\"retryAfterSeconds\"");
        assertThat(body).doesNotContain("\"violations\"");
    }
}
