package com.lunerie.api.config;

import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.time.Instant;

/**
 * Emits a single, grep-friendly log line at boot ({@code lunerie.boot.ready})
 * and at shutdown ({@code lunerie.boot.stopping}) so deploys are easy to trace
 * in Loki without joining against actuator metrics.
 *
 * <p>The boot line includes resolved port, active profiles, version, and
 * total startup time — useful for spotting regressions and confirming the
 * right config was picked up by a given replica.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LifecycleLogger {

    private final Environment environment;

    @Value("${spring.application.name:lunerie-api}")
    private String name;

    @Value("${lunerie.api.version:1.0.0}")
    private String version;

    @Value("${LUNERIE_INSTANCE_ID:local}")
    private String instance;

    private final Instant createdAt = Instant.now();

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        long jvmUptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        String profiles = String.join(",", environment.getActiveProfiles());
        if (profiles.isBlank()) profiles = "default";
        String port = environment.getProperty("server.port", "8080");

        log.info(
                "lunerie.boot.ready service={} version={} instance={} port={} profiles={} startup_ms={} jvm_uptime_ms={}",
                name, version, instance, port, profiles,
                Duration.between(createdAt, Instant.now()).toMillis(),
                jvmUptimeMs
        );
    }

    @PreDestroy
    public void onShutdown() {
        long jvmUptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        log.info("lunerie.boot.stopping service={} version={} instance={} jvm_uptime_ms={}",
                name, version, instance, jvmUptimeMs);
    }
}
