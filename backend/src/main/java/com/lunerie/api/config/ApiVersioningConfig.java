package com.lunerie.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Versions the public API non-invasively.
 *
 * <p>{@code /api/v1/anything} is rewritten to {@code /api/anything} before reaching
 * any controller. New v2 endpoints would be implemented by adding new mappings; the
 * filter only strips the {@code /v1} prefix when present, leaving controllers free of
 * version concerns.
 */
@Configuration
public class ApiVersioningConfig {

    private static final String LATEST_PREFIX = "/api/v1/";
    private static final String LATEST_TARGET = "/api/";

    @Bean
    public FilterRegistrationBean<ApiVersionRewriteFilter> apiVersionRewriteFilter() {
        FilterRegistrationBean<ApiVersionRewriteFilter> bean = new FilterRegistrationBean<>(new ApiVersionRewriteFilter());
        bean.addUrlPatterns("/api/v1/*");
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE + 5);
        return bean;
    }

    static class ApiVersionRewriteFilter extends OncePerRequestFilter {

        @Override
        protected void doFilterInternal(@NonNull HttpServletRequest request,
                                        @NonNull HttpServletResponse response,
                                        @NonNull FilterChain chain) throws ServletException, IOException {
            String uri = request.getRequestURI();
            if (uri.startsWith(LATEST_PREFIX)) {
                String rewritten = LATEST_TARGET + uri.substring(LATEST_PREFIX.length());
                chain.doFilter(new RewrittenUriRequest(request, rewritten), response);
                return;
            }
            chain.doFilter(request, response);
        }
    }

    private static class RewrittenUriRequest extends HttpServletRequestWrapper {
        private final String uri;

        RewrittenUriRequest(HttpServletRequest req, String uri) {
            super(req);
            this.uri = uri;
        }

        @Override
        public String getRequestURI() {
            return uri;
        }

        @Override
        public StringBuffer getRequestURL() {
            String base = super.getRequestURL().toString();
            int hostEnd = base.indexOf(super.getRequestURI());
            return new StringBuffer(base.substring(0, hostEnd) + uri);
        }

        @Override
        public String getServletPath() {
            return uri;
        }
    }
}
