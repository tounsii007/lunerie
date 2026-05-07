package com.lunerie.api.application.admin;

import com.lunerie.api.application.audit.AuditService;
import com.lunerie.api.application.place.PlaceService;
import com.lunerie.api.common.ConflictException;
import com.lunerie.api.common.NotFoundException;
import com.lunerie.api.security.CurrentUser;
import com.lunerie.api.domain.country.Country;
import com.lunerie.api.domain.country.CountryRepository;
import com.lunerie.api.domain.place.Place;
import com.lunerie.api.domain.place.PlaceRepository;
import com.lunerie.api.domain.user.RefreshTokenRepository;
import com.lunerie.api.domain.user.User;
import com.lunerie.api.domain.user.UserRepository;
import com.lunerie.api.domain.user.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;
    private final CountryRepository countryRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CacheManager cacheManager;
    private final AuditService auditService;
    private final CurrentUser currentUser;

    /* ----- Users ---------------------------------------------------------- */

    @Transactional(readOnly = true)
    public Page<User> users(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional
    public void setActive(UUID userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> NotFoundException.of("User", userId));
        user.setActive(active);
        if (!active) {
            refreshTokenRepository.revokeAllForUser(user, Instant.now());
        }
        auditService.record(active ? "admin.user.activated" : "admin.user.deactivated",
                currentUser.details().map(d -> d.user()).orElse(null), "User", userId.toString(), null);
    }

    @Transactional
    public void setAdmin(UUID userId, boolean admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> NotFoundException.of("User", userId));
        if (admin) {
            user.getRoles().add(UserRole.ADMIN);
        } else {
            user.getRoles().remove(UserRole.ADMIN);
        }
        auditService.record(admin ? "admin.user.granted" : "admin.user.revoked",
                currentUser.details().map(d -> d.user()).orElse(null), "User", userId.toString(), null);
    }

    @Transactional
    public int revokeAllRefreshTokens(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> NotFoundException.of("User", userId));
        return refreshTokenRepository.revokeAllForUser(user, Instant.now());
    }

    /* ----- Places --------------------------------------------------------- */

    @Transactional
    public Place createPlace(Place place) {
        if (placeRepository.existsBySlug(place.getSlug())) {
            throw new ConflictException("Slug already in use: " + place.getSlug());
        }
        place.setHasImage(place.getHeroImageUrl() != null && !place.getHeroImageUrl().isBlank());
        evictPlaceCaches();
        // Prime LAZY associations so the controller can map Place → PlaceDetail
        // after the transaction closes (open-in-view is disabled).
        return PlaceService.primeDetail(placeRepository.save(place));
    }

    @Transactional
    public Place updatePlace(UUID id, com.lunerie.api.application.admin.PlacePatch patch) {
        Place existing = placeRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Place", id));
        if (patch.name() != null) existing.setName(patch.name());
        if (patch.description() != null) existing.setDescription(patch.description());
        if (patch.city() != null) existing.setCity(patch.city());
        if (patch.region() != null) existing.setRegion(patch.region());
        if (patch.latitude() != null) existing.setLatitude(patch.latitude());
        if (patch.longitude() != null) existing.setLongitude(patch.longitude());
        if (patch.categories() != null && !patch.categories().isEmpty()) {
            existing.setCategories(new java.util.LinkedHashSet<>(patch.categories()));
        }
        if (patch.tags() != null) {
            existing.setTags(new java.util.LinkedHashSet<>(patch.tags()));
        }
        if (patch.heroImageUrl() != null) {
            existing.setHeroImageUrl(patch.heroImageUrl());
            existing.setHasImage(!patch.heroImageUrl().isBlank());
        }
        if (patch.heroImageAlt() != null) existing.setHeroImageAlt(patch.heroImageAlt());
        if (patch.popularity() != null) existing.setPopularity(patch.popularity());
        if (patch.relevance() != null) existing.setRelevance(patch.relevance());
        evictPlaceCaches();
        return PlaceService.primeDetail(existing);
    }

    @Transactional
    public void deletePlace(UUID id) {
        if (!placeRepository.existsById(id)) {
            throw NotFoundException.of("Place", id);
        }
        placeRepository.deleteById(id);
        evictPlaceCaches();
    }

    /* ----- Countries ------------------------------------------------------ */

    @Transactional
    public Country saveCountry(Country country) {
        boolean updating = countryRepository.existsByCodeIgnoreCase(country.getCode());
        Country saved = countryRepository.save(country);
        evictCountryCaches();
        log.info("admin.country.{} code={}", updating ? "updated" : "created", country.getCode());
        return saved;
    }

    @Transactional
    public void deleteCountry(String code) {
        if (!countryRepository.existsByCodeIgnoreCase(code)) {
            throw NotFoundException.of("Country", code);
        }
        countryRepository.deleteById(code.toUpperCase());
        evictCountryCaches();
    }

    /* ----- Cache management --------------------------------------------- */

    public void evictAllCaches() {
        cacheManager.getCacheNames().forEach(name -> {
            var cache = cacheManager.getCache(name);
            if (cache != null) cache.clear();
        });
    }

    private void evictPlaceCaches() {
        clearCache("place-categories");
        clearCache("place-stats");
        clearCache("tags-all");
    }

    private void evictCountryCaches() {
        clearCache("countries-all-dto");
        clearCache("countries-list");
    }

    private void clearCache(String name) {
        var cache = cacheManager.getCache(name);
        if (cache != null) cache.clear();
    }
}
