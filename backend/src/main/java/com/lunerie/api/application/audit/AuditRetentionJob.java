package com.lunerie.api.application.audit;

import com.lunerie.api.domain.audit.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditRetentionJob {

    private final AuditEventRepository repository;

    @Value("${lunerie.security.audit-retention:P180D}")
    private Duration retention;

    /** Daily cleanup of old audit events. Spring 6-field cron format: sec min hr day mon dow. */
    @Transactional
    @Scheduled(cron = "${lunerie.security.audit-retention-cron:0 30 3 * * *}")
    public void purge() {
        Instant cutoff = Instant.now().minus(retention);
        long before = repository.count();
        long deleted = repository.deleteByCreatedAtBefore(cutoff);
        log.info("audit.retention purged={} retained={} cutoff={}", deleted, before - deleted, cutoff);
    }
}
