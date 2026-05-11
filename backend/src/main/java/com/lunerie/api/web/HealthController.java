package com.lunerie.api.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Tag(name = "Health")
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final Instant startedAt = Instant.now();

    @Value("${spring.application.name:lunerie-api}")
    private String name;

    @Value("${lunerie.api.version:1.0.0}")
    private String version;

    @Value("${LUNERIE_INSTANCE_ID:local}")
    private String instance;

    @Operation(summary = "Liveness + version snapshot with uptime and JVM stats")
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Runtime runtime = Runtime.getRuntime();
        long uptimeMillis = ManagementFactory.getRuntimeMXBean().getUptime();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", name);
        body.put("version", version);
        body.put("instance", instance);
        body.put("status", "UP");
        body.put("startedAt", startedAt.toString());
        body.put("timestamp", Instant.now().toString());
        body.put("uptime", Duration.ofMillis(uptimeMillis).toString());
        body.put("uptimeSeconds", uptimeMillis / 1000);

        Map<String, Object> jvm = new LinkedHashMap<>();
        jvm.put("availableProcessors", runtime.availableProcessors());
        jvm.put("freeMemoryMb", runtime.freeMemory() / 1024 / 1024);
        jvm.put("totalMemoryMb", runtime.totalMemory() / 1024 / 1024);
        jvm.put("maxMemoryMb", runtime.maxMemory() / 1024 / 1024);
        body.put("jvm", jvm);

        return ResponseEntity.ok()
                // Health endpoints should never be cached — every probe must hit the live instance.
                .header("Cache-Control", "no-store, no-cache, must-revalidate")
                .body(body);
    }
}
