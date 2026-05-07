package com.lunerie.api.application.user;

import com.lunerie.api.domain.place.PlaceCategory;
import com.lunerie.api.domain.user.AccentColor;
import com.lunerie.api.domain.user.BackgroundStyle;
import com.lunerie.api.domain.user.LocaleCode;
import com.lunerie.api.domain.user.SortBy;
import com.lunerie.api.domain.user.ThemeMode;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Typed GDPR Article 15 export. No {@code Map<String, Object>} — every field is statically known.
 * Generated DTOs make the export schema part of the API contract instead of an opaque blob.
 */
public record AccountExport(
        Instant exportedAt,
        UserBlock user,
        PreferencesBlock preferences,
        List<FavoriteEntry> favorites,
        List<RecentViewEntry> recentViews,
        List<RecentSearchEntry> recentSearches,
        List<SessionEntry> sessions,
        List<AuditEntry> auditEvents
) {
    public record UserBlock(
            String id,
            String email,
            String displayName,
            boolean active,
            Instant emailVerifiedAt,
            Set<String> roles,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record PreferencesBlock(
            LocaleCode locale,
            ThemeMode theme,
            AccentColor accentColor,
            BackgroundStyle backgroundStyle,
            boolean rtl,
            boolean reducedMotion,
            boolean hapticFeedback,
            boolean onboardingCompleted,
            FilterBlock filters
    ) {}

    public record FilterBlock(
            int radiusKm,
            SortBy sortBy,
            boolean withImageOnly,
            String countryCode,
            Set<PlaceCategory> selectedCategories
    ) {}

    public record FavoriteEntry(String placeId, String placeName, Instant savedAt) {}
    public record RecentViewEntry(String placeId, String placeName, Instant viewedAt) {}
    public record RecentSearchEntry(String query, Instant searchedAt, Integer resultCount) {}

    public record SessionEntry(
            Instant issuedAt, Instant expiresAt, boolean revoked, Instant revokedAt,
            String userAgent, String ipAddress
    ) {}

    public record AuditEntry(
            Instant createdAt, String eventType,
            String targetType, String targetId,
            String ipAddress, String userAgent,
            Map<String, Object> payload
    ) {}
}
