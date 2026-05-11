package com.lunerie.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.time.Duration;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter(
            @Value("${lunerie.cors.allowed-origins:http://localhost:5173}") List<String> allowedOrigins,
            @Value("${lunerie.cors.allowed-methods:GET,POST,PUT,PATCH,DELETE,OPTIONS}") List<String> allowedMethods,
            @Value("${lunerie.cors.allow-credentials:true}") boolean allowCredentials,
            @Value("${lunerie.cors.max-age-seconds:3600}") long maxAgeSeconds
    ) {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(allowedOrigins);
        cfg.setAllowedMethods(allowedMethods);
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(List.of(
                "Location",
                "Content-Disposition",
                "X-Total-Count",
                // Frontend reads these for telemetry / 429 backoff / log correlation.
                "X-Request-Id",
                "Server-Timing",
                "Retry-After"
        ));
        cfg.setAllowCredentials(allowCredentials);
        cfg.setMaxAge(Duration.ofSeconds(maxAgeSeconds));
        source.registerCorsConfiguration("/**", cfg);
        return new CorsFilter(source);
    }
}
