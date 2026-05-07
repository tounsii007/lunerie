package com.lunerie.api.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "lunerie.security.jwt")
public record JwtProperties(
        @NotBlank String secret,
        @NotBlank String issuer,
        @NotBlank String audience,
        @Positive Duration accessTokenTtl,
        @Positive Duration refreshTokenTtl,
        @Positive int maxRefreshTokensPerUser
) {}
