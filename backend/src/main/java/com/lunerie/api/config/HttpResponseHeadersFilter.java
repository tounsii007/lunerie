package com.lunerie.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.regex.Pattern;

/**
 * Decorates responses with caching + security headers.
 *
 * <p><b>Cache-Control</b> — public read-only catalog endpoints (countries,
 * places, tags) get a short {@code public, max-age=...} window so CDNs and
 * browsers can serve repeated requests without round-tripping. Authenticated
 * endpoints, mutating verbs and Swagger / actuator are explicitly excluded
 * to avoid leaking per-user payloads through caches.
 *
 * <p><b>Security baseline</b> — every response carries
 * {@code X-Content-Type-Options: nosniff}, {@code X-Frame-Options: DENY},
 * {@code Referrer-Policy: no-referrer}, and
 * {@code Permissions-Policy: geolocation=(self)} so misconfigured proxies
 * cannot strip them out.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class HttpResponseHeadersFilter extends OncePerRequestFilter {

    private static final Pattern PUBLIC_CATALOG = Pattern.compile(
            "^/api(?:/v1)?/(countries|places|tags|recent-searches/trending)(/.*)?$");

    /**
     * Endpoints that always return per-user data — caching them in any shared
     * proxy or even in the browser's bfcache could leak across users when
     * tokens are rotated. {@code no-store} is a hard ban, no negotiation.
     */
    private static final Pattern PRIVATE_PATHS = Pattern.compile(
            "^/api(?:/v1)?/(auth|users|favorites|recent-views|recent-searches|admin)(/.*)?$");

    private final long publicCatalogMaxAgeSeconds;

    public HttpResponseHeadersFilter(
            @Value("${lunerie.cache.public-catalog-max-age-seconds:60}") long publicCatalogMaxAgeSeconds
    ) {
        this.publicCatalogMaxAgeSeconds = Math.max(0L, publicCatalogMaxAgeSeconds);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {
        // Security headers — set before the chain runs so they survive controller writes.
        if (!response.containsHeader("X-Content-Type-Options")) {
            response.setHeader("X-Content-Type-Options", "nosniff");
        }
        if (!response.containsHeader("X-Frame-Options")) {
            response.setHeader("X-Frame-Options", "DENY");
        }
        if (!response.containsHeader("Referrer-Policy")) {
            response.setHeader("Referrer-Policy", "no-referrer");
        }
        if (!response.containsHeader("Permissions-Policy")) {
            response.setHeader("Permissions-Policy", "geolocation=(self), microphone=(), camera=()");
        }

        // Per-user / mutating routes: hard-ban any caching to avoid cross-user leaks.
        if (PRIVATE_PATHS.matcher(request.getRequestURI()).matches()) {
            if (!response.containsHeader("Cache-Control")) {
                response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
            }
            if (!response.containsHeader("Pragma")) {
                response.setHeader("Pragma", "no-cache");
            }
            chain.doFilter(request, response);
            return;
        }

        // Cache-Control — only on safe verbs against public catalog routes,
        // and only when the controller didn't already set its own policy.
        if (isCacheableRequest(request)) {
            chain.doFilter(request, new CacheControlResponse(response, publicCatalogMaxAgeSeconds));
        } else {
            chain.doFilter(request, response);
        }
    }

    private static boolean isCacheableRequest(HttpServletRequest request) {
        String method = request.getMethod();
        if (!"GET".equals(method) && !"HEAD".equals(method)) return false;
        if (request.getHeader("Authorization") != null) return false;
        return PUBLIC_CATALOG.matcher(request.getRequestURI()).matches();
    }

    /**
     * Sets a default {@code Cache-Control} on flush, but only if the controller
     * didn't already set one (e.g. {@code no-store} for sensitive payloads).
     */
    private static final class CacheControlResponse extends jakarta.servlet.http.HttpServletResponseWrapper {
        private final long maxAgeSeconds;
        private boolean policyApplied = false;

        CacheControlResponse(HttpServletResponse delegate, long maxAgeSeconds) {
            super(delegate);
            this.maxAgeSeconds = maxAgeSeconds;
        }

        private void applyPolicy() {
            if (policyApplied) return;
            if (!containsHeader("Cache-Control")) {
                setHeader("Cache-Control", "public, max-age=%d, stale-while-revalidate=%d"
                        .formatted(maxAgeSeconds, Math.max(maxAgeSeconds * 2, 60)));
            }
            if (!containsHeader("Vary")) {
                setHeader("Vary", "Accept-Encoding, Accept-Language");
            }
            policyApplied = true;
        }

        @Override
        public java.io.PrintWriter getWriter() throws IOException {
            applyPolicy();
            return super.getWriter();
        }

        @Override
        public jakarta.servlet.ServletOutputStream getOutputStream() throws IOException {
            applyPolicy();
            return super.getOutputStream();
        }
    }
}
