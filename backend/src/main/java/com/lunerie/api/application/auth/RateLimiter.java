package com.lunerie.api.application.auth;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Per-IP token-bucket limiter for sensitive auth endpoints.
 *
 * <p>This is the <b>per-instance</b> defense-in-depth layer; the primary distributed
 * limit is enforced at the nginx gateway via {@code limit_req_zone}. Both layers
 * are needed: nginx protects when traffic spreads across replicas; this protects
 * if nginx is bypassed or misconfigured.
 *
 * <p>Buckets are evicted when idle longer than {@code idleEvictionAfter} to prevent
 * unbounded growth from random IPs.
 */
@Component
public class RateLimiter {

    private final ConcurrentMap<String, Entry> buckets = new ConcurrentHashMap<>();
    private final long capacity;
    private final long refillTokens;
    private final Duration refillPeriod;
    private final Duration idleEviction;

    public RateLimiter(
            @Value("${lunerie.security.rate-limit.capacity:20}") long capacity,
            @Value("${lunerie.security.rate-limit.refill-tokens:20}") long refillTokens,
            @Value("${lunerie.security.rate-limit.refill-period:PT1M}") Duration refillPeriod,
            @Value("${lunerie.security.rate-limit.idle-eviction:PT15M}") Duration idleEviction
    ) {
        this.capacity = capacity;
        this.refillTokens = refillTokens;
        this.refillPeriod = refillPeriod;
        this.idleEviction = idleEviction;
    }

    private record Entry(Bucket bucket, long lastTouchedNanos) {}

    public boolean tryAcquire(String key) {
        long now = System.nanoTime();
        Entry entry = buckets.compute(key, (k, existing) -> {
            if (existing != null) return new Entry(existing.bucket(), now);
            Bucket bucket = Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(capacity).refillIntervally(refillTokens, refillPeriod).build())
                    .build();
            return new Entry(bucket, now);
        });
        // Opportunistic eviction (no scheduled job needed).
        if (buckets.size() > 5_000) {
            evictIdle(now);
        }
        return entry.bucket().tryConsume(1);
    }

    private void evictIdle(long now) {
        long cutoff = now - idleEviction.toNanos();
        buckets.entrySet().removeIf(e -> e.getValue().lastTouchedNanos() < cutoff);
    }
}
