package com.lunerie.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Annotates every response with a {@code Server-Timing} header so client
 * DevTools can inspect server-side wait time, and warns into Loki when
 * requests exceed the configured slow threshold.
 *
 * <p>The threshold escalates the log level: a request 2× over the limit
 * logs at WARN, anything 5× over logs at ERROR so it surfaces in alerting
 * dashboards. Polling endpoints (actuator, swagger assets) are excluded
 * to keep the logs signal-rich.
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class SlowRequestLogFilter extends OncePerRequestFilter {

    private final long slowThresholdMs;

    public SlowRequestLogFilter(@Value("${lunerie.observability.slow-request-threshold-ms:1500}") long slowThresholdMs) {
        this.slowThresholdMs = Math.max(50L, slowThresholdMs);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {
        long start = System.nanoTime();
        try {
            chain.doFilter(request, response);
        } finally {
            long durationMs = (System.nanoTime() - start) / 1_000_000;

            if (!response.isCommitted() && !response.containsHeader("Server-Timing")) {
                response.setHeader("Server-Timing", "app;dur=" + durationMs);
            }

            if (isSilent(request)) return;

            if (durationMs >= slowThresholdMs * 5) {
                log.error("slow_request severity=critical method={} path={} status={} duration_ms={}",
                        request.getMethod(), request.getRequestURI(), response.getStatus(), durationMs);
            } else if (durationMs >= slowThresholdMs * 2) {
                log.warn("slow_request severity=high method={} path={} status={} duration_ms={}",
                        request.getMethod(), request.getRequestURI(), response.getStatus(), durationMs);
            } else if (durationMs >= slowThresholdMs) {
                log.warn("slow_request severity=warn method={} path={} status={} duration_ms={}",
                        request.getMethod(), request.getRequestURI(), response.getStatus(), durationMs);
            }
        }
    }

    private static boolean isSilent(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/actuator/")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }
}
