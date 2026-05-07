package com.lunerie.api.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

/**
 * Manages the HttpOnly refresh-token cookie.
 * - HttpOnly: not visible to JS (XSS mitigation)
 * - SameSite=Strict: not sent on cross-site requests (CSRF mitigation)
 * - Secure: only over HTTPS in prod
 * - Path=/api/auth: minimum scope
 */
@Component
public class RefreshCookie {

    public static final String NAME = "lunerie_refresh";
    private static final String PATH = "/api/auth";

    private final boolean secure;
    private final String sameSite;

    public RefreshCookie(
            @Value("${lunerie.security.cookie.secure:true}") boolean secure,
            @Value("${lunerie.security.cookie.same-site:Strict}") String sameSite
    ) {
        this.secure = secure;
        this.sameSite = sameSite;
    }

    public void issue(HttpServletResponse response, String token, Duration ttl) {
        ResponseCookie cookie = ResponseCookie.from(NAME, token)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(PATH)
                .maxAge(ttl)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clear(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(NAME, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(PATH)
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public Optional<String> read(HttpServletRequest request) {
        if (request.getCookies() == null) return Optional.empty();
        for (Cookie c : request.getCookies()) {
            if (NAME.equals(c.getName()) && c.getValue() != null && !c.getValue().isBlank()) {
                return Optional.of(c.getValue());
            }
        }
        return Optional.empty();
    }
}
