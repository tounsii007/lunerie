package com.lunerie.api.web;

import com.lunerie.api.application.auth.AuthService;
import com.lunerie.api.application.auth.RateLimiter;
import com.lunerie.api.common.BadRequestException;
import com.lunerie.api.common.RequestContext;
import com.lunerie.api.security.CurrentUser;
import com.lunerie.api.security.JwtService;
import com.lunerie.api.security.RefreshCookie;
import com.lunerie.api.web.dto.AuthDtos;
import com.lunerie.api.web.dto.AuthDtos.AuthTokens;
import com.lunerie.api.web.dto.AuthDtos.UserSummary;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@Tag(name = "Auth")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CurrentUser currentUser;
    private final RateLimiter rateLimiter;
    private final RefreshCookie refreshCookie;
    private final JwtService jwtService;

    @Operation(summary = "Register a new user; refresh token returned as HttpOnly cookie")
    @PostMapping("/register")
    public ResponseEntity<AuthTokens> register(@Valid @RequestBody AuthDtos.RegisterRequest request,
                                               HttpServletRequest http,
                                               HttpServletResponse response) {
        var ip = RequestContext.clientIp(http);
        guardRate("register:" + ip);
        AuthTokens tokens = authService.register(request, RequestContext.userAgent(http), ip);
        emitRefreshCookie(response, tokens);
        return ResponseEntity.status(HttpStatus.CREATED).body(redactRefresh(tokens));
    }

    @Operation(summary = "Authenticate with email + password; refresh token in HttpOnly cookie")
    @PostMapping("/login")
    public AuthTokens login(@Valid @RequestBody AuthDtos.LoginRequest request,
                            HttpServletRequest http,
                            HttpServletResponse response) {
        var ip = RequestContext.clientIp(http);
        guardRate("login:" + ip);
        AuthTokens tokens = authService.login(request, RequestContext.userAgent(http), ip);
        emitRefreshCookie(response, tokens);
        return redactRefresh(tokens);
    }

    @Operation(summary = "Rotate refresh token. Cookie is preferred; falls back to body for legacy clients.")
    @PostMapping("/refresh")
    public AuthTokens refresh(@RequestBody(required = false) AuthDtos.RefreshRequest request,
                              HttpServletRequest http,
                              HttpServletResponse response) {
        var ip = RequestContext.clientIp(http);
        guardRate("refresh:" + ip);
        String raw = refreshCookie.read(http)
                .orElseGet(() -> request != null ? request.refreshToken() : null);
        if (raw == null || raw.isBlank()) {
            throw new BadRequestException("Refresh token is required (cookie or body)");
        }
        AuthTokens tokens = authService.refresh(raw, RequestContext.userAgent(http), ip);
        emitRefreshCookie(response, tokens);
        return redactRefresh(tokens);
    }

    @Operation(summary = "Revoke the current refresh token; clears the cookie")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) AuthDtos.LogoutRequest request,
                                       HttpServletRequest http,
                                       HttpServletResponse response) {
        String raw = refreshCookie.read(http)
                .orElseGet(() -> request != null ? request.refreshToken() : null);
        authService.logout(raw);
        refreshCookie.clear(response);
        return ResponseEntity.noContent().build();
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Revoke ALL refresh tokens for the current user")
    @PostMapping("/logout-all")
    public ResponseEntity<Void> logoutAll(HttpServletResponse response) {
        authService.logoutAll(currentUser.require());
        refreshCookie.clear(response);
        return ResponseEntity.noContent().build();
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Return the authenticated user")
    @GetMapping("/me")
    public UserSummary me() {
        return authService.describe(currentUser.require());
    }

    /* -------------------------------------------------------------------- */

    private void emitRefreshCookie(HttpServletResponse response, AuthTokens tokens) {
        Duration ttl = jwtService.properties().refreshTokenTtl();
        refreshCookie.issue(response, tokens.refreshToken(), ttl);
    }

    /** Refresh token must NEVER appear in body when cookie path is used. */
    private AuthTokens redactRefresh(AuthTokens t) {
        return new AuthTokens(
                t.tokenType(), t.accessToken(), t.accessTokenExpiresInSeconds(),
                "", // empty: clients should rely on the cookie
                t.refreshTokenExpiresInSeconds(),
                t.user()
        );
    }

    private void guardRate(String key) {
        if (!rateLimiter.tryAcquire(key)) {
            throw new BadRequestException("Too many requests, please retry shortly");
        }
    }

}
