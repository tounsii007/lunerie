package com.lunerie.api.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

/**
 * Stable error envelope returned to clients. Fields with {@code null} values are
 * omitted from the wire format thanks to {@link JsonInclude.Include#NON_NULL}.
 *
 * <p>The {@code requestId} is populated by {@link com.lunerie.api.config.RequestIdFilter}
 * so any error response can be cross-referenced against backend logs in Loki.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        Instant timestamp,
        int status,
        String code,
        String message,
        String path,
        String method,
        String requestId,
        List<FieldViolation> violations,
        Long retryAfterSeconds
) {
    public record FieldViolation(String field, String message, Object rejectedValue) {}

    public static ApiError of(int status, String code, String message, String path) {
        return new ApiError(Instant.now(), status, code, message, path, null, null, null, null);
    }

    public static ApiError of(int status, String code, String message, String path, List<FieldViolation> violations) {
        return new ApiError(Instant.now(), status, code, message, path, null, null, violations, null);
    }

    public ApiError withMethod(String httpMethod) {
        return new ApiError(timestamp, status, code, message, path, httpMethod, requestId, violations, retryAfterSeconds);
    }

    public ApiError withRequestId(String id) {
        return new ApiError(timestamp, status, code, message, path, method, id, violations, retryAfterSeconds);
    }

    public ApiError withRetryAfter(long seconds) {
        return new ApiError(timestamp, status, code, message, path, method, requestId, violations, seconds);
    }
}
