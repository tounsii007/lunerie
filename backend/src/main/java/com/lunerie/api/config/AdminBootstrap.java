package com.lunerie.api.config;

import com.lunerie.api.domain.user.User;
import com.lunerie.api.domain.user.UserPreferences;
import com.lunerie.api.domain.user.UserRepository;
import com.lunerie.api.domain.user.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * On startup, ensures an admin user exists when LUNERIE_ADMIN_EMAIL + LUNERIE_ADMIN_PASSWORD are set.
 * Idempotent — safe to run on every boot.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrap {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminBootstrapProperties properties;

    @Transactional
    @EventListener(ApplicationReadyEvent.class)
    public void ensureAdminUser() {
        Optional<String> email = Optional.ofNullable(properties.email()).filter(s -> !s.isBlank());
        Optional<String> password = Optional.ofNullable(properties.password()).filter(s -> !s.isBlank());

        if (email.isEmpty() || password.isEmpty()) {
            log.info("admin.bootstrap.skip reason='no LUNERIE_ADMIN_EMAIL/PASSWORD set'");
            return;
        }

        var existing = userRepository.findByEmailIgnoreCase(email.get());
        if (existing.isPresent()) {
            User user = existing.get();
            if (!user.getRoles().contains(UserRole.ADMIN)) {
                user.getRoles().add(UserRole.ADMIN);
                userRepository.save(user);
                log.info("admin.bootstrap.promoted email={}", user.getEmail());
            } else {
                log.info("admin.bootstrap.exists email={}", user.getEmail());
            }
            return;
        }

        User admin = User.builder()
                .email(email.get().toLowerCase())
                .passwordHash(passwordEncoder.encode(password.get()))
                .displayName(properties.displayName())
                .build();
        admin.getRoles().add(UserRole.USER);
        admin.getRoles().add(UserRole.ADMIN);
        UserPreferences prefs = UserPreferences.builder().user(admin).onboardingCompleted(true).build();
        admin.setPreferences(prefs);
        userRepository.save(admin);
        log.info("admin.bootstrap.created email={}", admin.getEmail());
    }
}
