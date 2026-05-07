package com.lunerie.api;

import com.lunerie.api.config.AdminBootstrapProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EnableConfigurationProperties(AdminBootstrapProperties.class)
public class LunerieApplication {

    public static void main(String[] args) {
        SpringApplication.run(LunerieApplication.class, args);
    }
}
