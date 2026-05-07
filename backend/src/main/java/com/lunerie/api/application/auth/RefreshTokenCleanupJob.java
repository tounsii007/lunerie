package com.lunerie.api.application.auth;

import com.lunerie.api.domain.user.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class RefreshTokenCleanupJob {

    private final RefreshTokenRepository repository;

    /** Removes revoked + expired refresh tokens hourly. */
    @Transactional
    @Scheduled(cron = "${lunerie.security.refresh-token-cleanup-cron:0 0 * * * *}")
    public void cleanup() {
        int removed = repository.purgeExpiredAndRevoked(Instant.now());
        if (removed > 0) {
            log.info("Purged {} expired or revoked refresh tokens", removed);
        }
    }
}
