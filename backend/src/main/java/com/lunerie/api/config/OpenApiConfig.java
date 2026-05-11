package com.lunerie.api.config;

import com.lunerie.api.common.ApiError;
import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.examples.Example;
import io.swagger.v3.oas.models.headers.Header;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI lunerieOpenApi(
            @Value("${spring.application.name:lunerie-api}") String appName,
            @Value("${lunerie.api.version:1.0.0}") String version
    ) {
        final String securityScheme = "bearerAuth";

        // Resolve the ApiError class into a JSON Schema and register it under #/components/schemas
        // so $ref'd responses pick it up across every endpoint.
        Map<String, Schema> apiErrorSchemas =
                ModelConverters.getInstance().readAll(ApiError.class);

        Components components = new Components()
                .addSecuritySchemes(securityScheme,
                        new SecurityScheme()
                                .name(securityScheme)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste your access token from /api/auth/login"));
        apiErrorSchemas.forEach(components::addSchemas);

        // Reusable response definitions documenting the standard error envelope shape +
        // headers that GlobalExceptionHandler sets (X-Request-Id, Retry-After, Server-Timing).
        components
                .addResponses("ValidationFailed", buildErrorResponse(
                        "Request validation failed (400). Body includes per-field violations.",
                        validationExample()))
                .addResponses("Unauthenticated", buildErrorResponse(
                        "Missing or invalid bearer token (401). Carries WWW-Authenticate.",
                        unauthenticatedExample())
                        .addHeaderObject("WWW-Authenticate", new Header()
                                .description("Bearer realm=\"lunerie\"")
                                .schema(new StringSchema())))
                .addResponses("AccessDenied", buildErrorResponse(
                        "Authenticated but lacks the required role (403).",
                        accessDeniedExample()))
                .addResponses("ResourceNotFound", buildErrorResponse(
                        "The requested resource does not exist (404).",
                        notFoundExample()))
                .addResponses("Conflict", buildErrorResponse(
                        "Request conflicts with current state (409).",
                        conflictExample()))
                .addResponses("TooManyRequests", buildErrorResponse(
                        "Rate limit exceeded (429). Honor the Retry-After header.",
                        tooManyExample())
                        .addHeaderObject("Retry-After", new Header()
                                .description("Seconds the client should wait before retrying.")
                                .schema(new StringSchema())))
                .addResponses("InternalError", buildErrorResponse(
                        "Unexpected server error (500). Quote requestId in support tickets.",
                        internalErrorExample()));

        // Common response headers documented once and reused.
        components
                .addHeaders("X-Request-Id", new Header()
                        .description("Per-request UUID also written into the structured logs.")
                        .schema(new StringSchema()))
                .addHeaders("Server-Timing", new Header()
                        .description("`app;dur=<ms>` — server-side latency for this request.")
                        .schema(new StringSchema()));

        return new OpenAPI()
                .info(new Info()
                        .title("Lunerie API")
                        .description("""
                                Hidden places, viewpoints and photogenic escapes — backend for the Lunerie travel app.

                                **Error envelope** — every non-2xx response uses the `ApiError` schema and
                                carries `X-Request-Id` for log correlation. 429s additionally include
                                `Retry-After` (seconds). See the reusable `*` responses under components.
                                """)
                        .version(version)
                        .contact(new Contact().name("Lunerie").url("https://lunerie.app"))
                        .license(new License().name("MIT")))
                .addSecurityItem(new SecurityRequirement().addList(securityScheme))
                .components(components);
    }

    private static ApiResponse buildErrorResponse(String description, Example example) {
        Schema<?> ref = new Schema<>().$ref("#/components/schemas/ApiError");
        return new ApiResponse()
                .description(description)
                .content(new Content().addMediaType("application/json",
                        new MediaType().schema(ref).addExamples("default", example)))
                .addHeaderObject("X-Request-Id", new Header()
                        .description("Per-request UUID; correlate with logs in Loki/Tempo.")
                        .schema(new StringSchema()));
    }

    private static Example validationExample() {
        return new Example().value("""
                {
                  "timestamp": "2026-05-10T12:34:56Z",
                  "status": 400,
                  "code": "VALIDATION_FAILED",
                  "message": "Request validation failed",
                  "path": "/api/auth/register",
                  "method": "POST",
                  "requestId": "8b1f4d2a-…",
                  "violations": [
                    { "field": "password", "message": "must contain a digit", "rejectedValue": "***" }
                  ]
                }""");
    }

    private static Example unauthenticatedExample() {
        return new Example().value("""
                {
                  "timestamp": "2026-05-10T12:34:56Z",
                  "status": 401,
                  "code": "UNAUTHENTICATED",
                  "message": "Authentication required",
                  "path": "/api/users/me",
                  "method": "GET",
                  "requestId": "8b1f4d2a-…"
                }""");
    }

    private static Example accessDeniedExample() {
        return new Example().value("""
                {
                  "timestamp": "2026-05-10T12:34:56Z",
                  "status": 403,
                  "code": "ACCESS_DENIED",
                  "message": "Access denied",
                  "path": "/api/admin/users",
                  "method": "GET",
                  "requestId": "8b1f4d2a-…"
                }""");
    }

    private static Example notFoundExample() {
        return new Example().value("""
                {
                  "timestamp": "2026-05-10T12:34:56Z",
                  "status": 404,
                  "code": "RESOURCE_NOT_FOUND",
                  "message": "Place not found: 42",
                  "path": "/api/places/42",
                  "method": "GET",
                  "requestId": "8b1f4d2a-…"
                }""");
    }

    private static Example conflictExample() {
        return new Example().value("""
                {
                  "timestamp": "2026-05-10T12:34:56Z",
                  "status": 409,
                  "code": "CONFLICT",
                  "message": "Email already registered",
                  "path": "/api/auth/register",
                  "method": "POST",
                  "requestId": "8b1f4d2a-…"
                }""");
    }

    private static Example tooManyExample() {
        return new Example().value("""
                {
                  "timestamp": "2026-05-10T12:34:56Z",
                  "status": 429,
                  "code": "TOO_MANY_REQUESTS",
                  "message": "Too many requests, please retry shortly",
                  "path": "/api/auth/login",
                  "method": "POST",
                  "requestId": "8b1f4d2a-…",
                  "retryAfterSeconds": 47
                }""");
    }

    private static Example internalErrorExample() {
        return new Example().value("""
                {
                  "timestamp": "2026-05-10T12:34:56Z",
                  "status": 500,
                  "code": "INTERNAL_ERROR",
                  "message": "An unexpected error occurred",
                  "path": "/api/places",
                  "method": "GET",
                  "requestId": "8b1f4d2a-…"
                }""");
    }
}
