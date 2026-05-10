package com.lunerie.api.common;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.List;

/**
 * Single source of truth for HTTP error responses. Every public handler delegates
 * to {@link #respond} so each response carries the same shape: timestamp, status,
 * code, message, path, method and the request id from MDC for log correlation.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String MDC_REQUEST_ID = "requestId";

    /* ----- 400 — Bad request --------------------------------------------- */

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiError> badRequest(BadRequestException ex, HttpServletRequest req) {
        return respond(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage(), req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        var violations = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ApiError.FieldViolation(
                        error.getField(), error.getDefaultMessage(), maskSensitive(error.getField(), error.getRejectedValue())))
                .toList();
        return respond(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED",
                "Request validation failed", req, violations);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> constraintViolation(ConstraintViolationException ex, HttpServletRequest req) {
        var violations = ex.getConstraintViolations().stream()
                .map(v -> {
                    String field = v.getPropertyPath().toString();
                    return new ApiError.FieldViolation(field, v.getMessage(), maskSensitive(field, v.getInvalidValue()));
                })
                .toList();
        return respond(HttpStatus.BAD_REQUEST, "CONSTRAINT_VIOLATION",
                "Request constraints violated", req, violations);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> missingParam(MissingServletRequestParameterException ex, HttpServletRequest req) {
        return respond(HttpStatus.BAD_REQUEST, "MISSING_PARAMETER", ex.getMessage(), req);
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ApiError> missingHeader(MissingRequestHeaderException ex, HttpServletRequest req) {
        return respond(HttpStatus.BAD_REQUEST, "MISSING_HEADER",
                "Required header '%s' is missing".formatted(ex.getHeaderName()), req);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> typeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        var type = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "?";
        return respond(HttpStatus.BAD_REQUEST, "TYPE_MISMATCH",
                "Parameter '%s' should be of type %s".formatted(ex.getName(), type), req);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> unreadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return respond(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST", "Malformed JSON payload", req);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> illegalArgument(IllegalArgumentException ex, HttpServletRequest req) {
        // Unhandled IAEs typically indicate a bad input that wasn't caught by validation.
        log.debug("IllegalArgumentException at {} {}: {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        return respond(HttpStatus.BAD_REQUEST, "INVALID_ARGUMENT",
                ex.getMessage() == null ? "Invalid argument" : ex.getMessage(), req);
    }

    /* ----- 401 / 403 ----------------------------------------------------- */

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> badCredentials(BadCredentialsException ex, HttpServletRequest req) {
        return respond(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password", req);
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ApiError> locked(LockedException ex, HttpServletRequest req) {
        return respond(HttpStatus.FORBIDDEN, "ACCOUNT_LOCKED", "Account is locked", req);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiError> disabled(DisabledException ex, HttpServletRequest req) {
        return respond(HttpStatus.FORBIDDEN, "ACCOUNT_DISABLED", "Account is disabled", req);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> auth(AuthenticationException ex, HttpServletRequest req) {
        return respond(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Authentication required", req);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> accessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return respond(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Access denied", req);
    }

    /* ----- 404 / 405 / 415 ---------------------------------------------- */

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> notFound(NotFoundException ex, HttpServletRequest req) {
        return respond(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", ex.getMessage(), req);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiError> noHandler(NoHandlerFoundException ex, HttpServletRequest req) {
        return respond(HttpStatus.NOT_FOUND, "ROUTE_NOT_FOUND",
                "Route not found: " + ex.getRequestURL(), req);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> methodNotAllowed(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return respond(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", ex.getMessage(), req);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> mediaTypeNotSupported(HttpMediaTypeNotSupportedException ex, HttpServletRequest req) {
        return respond(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_MEDIA_TYPE",
                ex.getMessage() == null ? "Unsupported media type" : ex.getMessage(), req);
    }

    /* ----- 409 ----------------------------------------------------------- */

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> conflict(ConflictException ex, HttpServletRequest req) {
        return respond(HttpStatus.CONFLICT, "CONFLICT", ex.getMessage(), req);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> integrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.warn("Data integrity violation at {} {}: {}",
                req.getMethod(), req.getRequestURI(), ex.getMostSpecificCause().getMessage());
        return respond(HttpStatus.CONFLICT, "DATA_INTEGRITY_VIOLATION",
                "The operation conflicts with existing data", req);
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ApiError> optimisticLock(OptimisticLockingFailureException ex, HttpServletRequest req) {
        return respond(HttpStatus.CONFLICT, "CONCURRENT_MODIFICATION",
                "Resource was modified concurrently", req);
    }

    /* ----- 413 ----------------------------------------------------------- */

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> tooLarge(MaxUploadSizeExceededException ex, HttpServletRequest req) {
        return respond(HttpStatus.PAYLOAD_TOO_LARGE, "PAYLOAD_TOO_LARGE",
                "Upload payload is larger than the configured limit", req);
    }

    /* ----- 429 ----------------------------------------------------------- */

    @ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<ApiError> tooManyRequests(TooManyRequestsException ex, HttpServletRequest req) {
        ApiError body = ApiError.of(HttpStatus.TOO_MANY_REQUESTS.value(), "TOO_MANY_REQUESTS",
                        ex.getMessage(), req.getRequestURI())
                .withMethod(req.getMethod())
                .withRequestId(MDC.get(MDC_REQUEST_ID))
                .withRetryAfter(ex.getRetryAfterSeconds());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, Long.toString(ex.getRetryAfterSeconds()))
                .body(body);
    }

    /* ----- 500 (catch-all) ---------------------------------------------- */

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> unknown(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception at {} {}", req.getMethod(), req.getRequestURI(), ex);
        return respond(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected error occurred", req);
    }

    /* ----- Builders (shared) -------------------------------------------- */

    private static ResponseEntity<ApiError> respond(HttpStatus status, String code, String message,
                                                    HttpServletRequest req) {
        ApiError body = ApiError.of(status.value(), code, message, req.getRequestURI())
                .withMethod(req.getMethod())
                .withRequestId(MDC.get(MDC_REQUEST_ID));
        return ResponseEntity.status(status).body(body);
    }

    private static ResponseEntity<ApiError> respond(HttpStatus status, String code, String message,
                                                    HttpServletRequest req,
                                                    List<ApiError.FieldViolation> violations) {
        ApiError body = ApiError.of(status.value(), code, message, req.getRequestURI(), violations)
                .withMethod(req.getMethod())
                .withRequestId(MDC.get(MDC_REQUEST_ID));
        return ResponseEntity.status(status).body(body);
    }

    /**
     * Validation responses include the rejected value to help clients debug, but
     * never echo a password or token back across the wire.
     */
    private static Object maskSensitive(String field, Object value) {
        if (value == null) return null;
        String lower = field == null ? "" : field.toLowerCase();
        if (lower.contains("password") || lower.contains("secret") || lower.contains("token")) {
            return "***";
        }
        return value;
    }
}
