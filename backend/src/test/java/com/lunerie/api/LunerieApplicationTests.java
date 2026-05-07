package com.lunerie.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@ActiveProfiles("test")
@SpringBootTest(properties = {
        "lunerie.security.jwt.secret=test-secret-test-secret-test-secret-test-secret",
        "lunerie.security.jwt.access-token-ttl=PT15M",
        "lunerie.security.jwt.refresh-token-ttl=P7D",
        "lunerie.security.jwt.max-refresh-tokens-per-user=4"
})
class LunerieApplicationTests {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine");

    @Test
    void contextLoads() {
        // Spring context boots, Flyway migrations apply, beans wire up.
    }
}
