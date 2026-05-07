package com.lunerie.api.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@Tag(name = "Health")
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Value("${spring.application.name:lunerie-api}")
    private String name;

    @Value("${lunerie.api.version:1.0.0}")
    private String version;

    @Value("${LUNERIE_INSTANCE_ID:local}")
    private String instance;

    @Operation(summary = "Liveness + version snapshot")
    @GetMapping
    public Map<String, Object> health() {
        return Map.of(
                "service", name,
                "version", version,
                "instance", instance,
                "status", "UP",
                "timestamp", Instant.now().toString()
        );
    }
}
