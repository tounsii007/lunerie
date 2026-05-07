package com.lunerie.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI lunerieOpenApi(
            @Value("${spring.application.name:lunerie-api}") String appName,
            @Value("${lunerie.api.version:1.0.0}") String version
    ) {
        final String securityScheme = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("Lunerie API")
                        .description("Hidden places, viewpoints and photogenic escapes — backend for the Lunerie travel app.")
                        .version(version)
                        .contact(new Contact().name("Lunerie").url("https://lunerie.app"))
                        .license(new License().name("MIT")))
                .addSecurityItem(new SecurityRequirement().addList(securityScheme))
                .components(new Components().addSecuritySchemes(securityScheme,
                        new SecurityScheme()
                                .name(securityScheme)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste your access token from /api/auth/login")));
    }
}
