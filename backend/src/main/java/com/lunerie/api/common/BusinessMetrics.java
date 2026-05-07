package com.lunerie.api.common;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tag;
import io.micrometer.core.instrument.Tags;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/** Centralized counters/gauges for business events surfaced in Prometheus + Grafana. */
@Component
public class BusinessMetrics {

    private final MeterRegistry registry;
    private final Counter usersRegistered;
    private final Counter logins;
    private final Counter loginFailures;
    private final Counter favoritesAdded;
    private final Counter favoritesRemoved;
    private final Counter recentViewsRecorded;
    private final Counter searchesRecorded;
    private final ConcurrentMap<String, Counter> placeViewsByCountry = new ConcurrentHashMap<>();

    public BusinessMetrics(MeterRegistry registry) {
        this.registry = registry;
        this.usersRegistered = counter("lunerie.users.registered", "User registrations");
        this.logins = counter("lunerie.users.login.success", "Successful logins");
        this.loginFailures = counter("lunerie.users.login.failure", "Failed login attempts");
        this.favoritesAdded = counter("lunerie.favorites.added", "Places added to favorites");
        this.favoritesRemoved = counter("lunerie.favorites.removed", "Places removed from favorites");
        this.recentViewsRecorded = counter("lunerie.recent_views.recorded", "Place views recorded");
        this.searchesRecorded = counter("lunerie.searches.recorded", "Searches recorded");
    }

    public void userRegistered() { usersRegistered.increment(); }
    public void loginSuccess()   { logins.increment(); }
    public void loginFailure()   { loginFailures.increment(); }
    public void favoriteAdded()  { favoritesAdded.increment(); }
    public void favoriteRemoved(){ favoritesRemoved.increment(); }
    public void recentViewRecorded() { recentViewsRecorded.increment(); }
    public void searchRecorded() { searchesRecorded.increment(); }

    public void placeViewed(String countryCode) {
        if (countryCode == null) return;
        placeViewsByCountry.computeIfAbsent(countryCode, code ->
                Counter.builder("lunerie.places.viewed")
                        .description("Place detail views")
                        .tags(Tags.of(Tag.of("country", code)))
                        .register(registry)
        ).increment();
    }

    private Counter counter(String name, String description) {
        return Counter.builder(name).description(description).register(registry);
    }
}
