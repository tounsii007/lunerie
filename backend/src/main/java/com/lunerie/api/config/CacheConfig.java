package com.lunerie.api.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.cache.CaffeineCacheMetrics;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

/**
 * Per-cache Caffeine configuration. Each cache gets a TTL appropriate for its
 * volatility, and registers itself with the Micrometer registry so hit-rate /
 * miss-rate / eviction-count graphs land in Prometheus + Grafana automatically.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(MeterRegistry meterRegistry) {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(
                // Country catalog rarely changes — long TTL, larger pool.
                build("countries-all-dto", 256, Duration.ofMinutes(60), meterRegistry),
                build("countries-list",    512, Duration.ofMinutes(30), meterRegistry),
                // Hot read-only enums — tiny but hit-frequently.
                build("place-categories",  64,  Duration.ofMinutes(60), meterRegistry),
                build("tags-all",          128, Duration.ofMinutes(15), meterRegistry),
                // Stats can drift; keep tighter to surface admin updates quickly.
                build("place-stats",       64,  Duration.ofMinutes(5),  meterRegistry)
        ));
        return manager;
    }

    private static CaffeineCache build(String name, long maximumSize, Duration ttl, MeterRegistry meterRegistry) {
        com.github.benmanes.caffeine.cache.Cache<Object, Object> native_ = Caffeine.newBuilder()
                .maximumSize(maximumSize)
                .expireAfterWrite(ttl)
                .recordStats()
                .build();
        // Bind hit/miss/eviction metrics under cache.* with the cache name as a tag.
        CaffeineCacheMetrics.monitor(meterRegistry, native_, name);
        return new CaffeineCache(name, native_);
    }
}
