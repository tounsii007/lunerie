package com.lunerie.api.common;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.List;

/**
 * Single source of truth for HTTP error responses. Each mapping is a tiny one-line
 * helper delegating to {@link #respond}.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /* ----- 400 — Bad request --------------------------------------------- */

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiError> badRequest(BadRequestException ex, HttpServletRequest req) {
        return respond(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage(), req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        var violations = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ApiError.FieldViolation(
                        error.getField(), error.getDefaultMessage(), error.getRejectedValue()))
                .toList();
        return respond(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED",
                "Request validation failed", req, violations);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> constraintViolation(ConstraintViolationException ex, HttpServletRequest req) {
        var violations = ex.getConstraintViolations().stream()
                .map(v -> new ApiError.FieldViolation(
                        v.getPropertyPath().toString(), v.getMessage(), v.getInvalidValue()))
                .toList();
        return respond(HttpStatus.BAD_REQUEST, "CONSTRAINT_VIOLATION",
                "Request constraints violated", req, violations);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> missingParam(MissingServletRequestParameterException ex, HttpServletRequest req) {
        return respond(HttpStatus.BAD_REQUEST, "MISSING_PARAMETER", ex.getMessage(), req);
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

    /* ----- 401 / 403 ----------------------------------------------------- */

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> badCredentials(BadCredentialsException ex, HttpServletRequest req) {
        return respond(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password", req);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> auth(AuthenticationException ex, HttpServletRequest req) {
        return respond(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Authentication required", req);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> accessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return respond(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Access denied", req);
    }

    /* ----- 404 / 405 ----------------------------------------------------- */

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

    /* ----- 409 ----------------------------------------------------------- */

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> conflict(ConflictException ex, HttpServletRequest req) {
        return respond(HttpStatus.CONFLICT, "CONFLICT", ex.getMessage(), req);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> integrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.warn("Data integrity violation: {}", ex.getMostSpecificCause().getMessage());
        return respond(HttpStatus.CONFLICT, "DATA_INTEGRITY_VIOLATION",
                "The operation conflicts with existing data", req);
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ApiError> optimisticLock(OptimisticLockingFailureException ex, HttpServletRequest req) {
        return respond(HttpStatus.CONFLICT, "CONCURRENT_MODIFICATION",
                "Resource was modified concurrently", req);
    }

    /* ----- 500 (catch-all) ---------------------------------------------- */

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> unknown(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception", ex);
        return respond(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected error occurred", req);
    }

    /* ----- Builders (shared) -------------------------------------------- */

    private static ResponseEntity<ApiError> respond(HttpStatus status, String code, String message,
                                                    HttpServletRequest req) {
        return ResponseEntity.status(status)
                .body(ApiError.of(status.value(), code, message, req.getRequestURI()));
    }

    private static ResponseEntity<ApiError> respond(HttpStatus status, String code, String message,
                                                    HttpServletRequest req,
                                                    List<ApiError.FieldViolation> violations) {
        return ResponseEntity.status(status)
                .body(ApiError.of(status.value(), code, message, req.getRequestURI(), violations));
    }
}
