package com.lunerie.api.test;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@AutoConfigureMockMvc
@ActiveProfiles("test")
@SpringBootTest(properties = {
        "lunerie.security.jwt.secret=test-secret-test-secret-test-secret-test-secret",
        "lunerie.security.jwt.access-token-ttl=PT15M",
        "lunerie.security.jwt.refresh-token-ttl=P7D",
        "lunerie.security.jwt.max-refresh-tokens-per-user=4",
        "lunerie.security.rate-limit.capacity=200",
        "lunerie.security.rate-limit.refill-tokens=200"
})
public abstract class AbstractIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17-alpine");

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;
}
