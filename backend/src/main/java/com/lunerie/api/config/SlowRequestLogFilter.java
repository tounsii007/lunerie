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

/** Logs requests that exceed the slow-threshold so they are easy to spot in Loki. */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class SlowRequestLogFilter extends OncePerRequestFilter {

    private final long slowThresholdMs;

    public SlowRequestLogFilter(@Value("${lunerie.observability.slow-request-threshold-ms:1500}") long slowThresholdMs) {
        this.slowThresholdMs = slowThresholdMs;
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
            if (durationMs >= slowThresholdMs) {
                log.warn("slow_request method={} path={} status={} duration_ms={}",
                        request.getMethod(), request.getRequestURI(), response.getStatus(), durationMs);
            }
        }
    }
}
