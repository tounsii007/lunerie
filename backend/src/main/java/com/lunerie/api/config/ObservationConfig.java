package com.lunerie.api.config;

import io.micrometer.observation.ObservationRegistry;
import io.micrometer.observation.aop.ObservedAspect;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Enables the {@code @Observed} annotation across the codebase. Spring Boot
 * already auto-applies observations to the web layer, JDBC, scheduled tasks,
 * RestClient, and Kafka; the aspect bean turns on annotation-driven custom
 * spans on top of that.
 *
 * <p>Usage in service code:
 * <pre>{@code
 *   @Observed(name = "auth.register",
 *             contextualName = "register",
 *             lowCardinalityKeyValues = {"flow", "register"})
 *   public AuthTokens register(...) { ... }
 * }</pre>
 *
 * <p>Each invocation produces a span whose name and tags land in the OTLP
 * exporter and a Micrometer timer of the same name lands in Prometheus —
 * "trace once, observe everywhere".
 */
@Configuration
public class ObservationConfig {

    @Bean
    public ObservedAspect observedAspect(ObservationRegistry registry) {
        return new ObservedAspect(registry);
    }
}
