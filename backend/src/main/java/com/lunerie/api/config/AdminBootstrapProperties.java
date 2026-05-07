package com.lunerie.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "lunerie.admin")
public record AdminBootstrapProperties(
        String email,
        String password,
        @DefaultValue("Lunerie Admin") String displayName
) {}
