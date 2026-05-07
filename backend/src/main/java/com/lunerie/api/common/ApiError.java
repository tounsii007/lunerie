package com.lunerie.api.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        Instant timestamp,
        int status,
        String code,
        String message,
        String path,
        List<FieldViolation> violations
) {
    public record FieldViolation(String field, String message, Object rejectedValue) {}

    public static ApiError of(int status, String code, String message, String path) {
        return new ApiError(Instant.now(), status, code, message, path, null);
    }

    public static ApiError of(int status, String code, String message, String path, List<FieldViolation> violations) {
        return new ApiError(Instant.now(), status, code, message, path, violations);
    }
}
