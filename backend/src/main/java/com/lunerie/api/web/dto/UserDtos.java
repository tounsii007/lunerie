package com.lunerie.api.web.dto;

import com.lunerie.api.domain.place.PlaceCategory;
import com.lunerie.api.domain.user.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.Set;

public final class UserDtos {
    private UserDtos() {}

    public record PreferencesResponse(
            LocaleCode locale,
            ThemeMode theme,
            AccentColor accentColor,
            BackgroundStyle backgroundStyle,
            boolean rtl,
            boolean reducedMotion,
            boolean hapticFeedback,
            boolean onboardingCompleted,
            int filterRadiusKm,
            SortBy filterSortBy,
            boolean filterWithImageOnly,
            String filterCountryCode,
            Set<PlaceCategory> selectedCategories
    ) {
        public static PreferencesResponse from(UserPreferences p) {
            return new PreferencesResponse(
                    p.getLocale(), p.getTheme(),
                    p.getAccentColor(), p.getBackgroundStyle(),
                    p.isRtl(), p.isReducedMotion(), p.isHapticFeedback(), p.isOnboardingCompleted(),
                    p.getFilterRadiusKm(), p.getFilterSortBy(), p.isFilterWithImageOnly(),
                    p.getFilterCountryCode(), p.getSelectedCategories()
            );
        }
    }

    /** Full replacement (PUT). All fields required. */
    public record UpdatePreferencesRequest(
            LocaleCode locale,
            ThemeMode theme,
            AccentColor accentColor,
            BackgroundStyle backgroundStyle,
            Boolean rtl,
            Boolean reducedMotion,
            Boolean hapticFeedback,
            Boolean onboardingCompleted,
            @Min(1) @Max(200) Integer filterRadiusKm,
            SortBy filterSortBy,
            Boolean filterWithImageOnly,
            @Size(min = 2, max = 3) String filterCountryCode,
            Set<PlaceCategory> selectedCategories
    ) {}

    /** Partial update (PATCH). Same shape, all optional. */
    public record PatchPreferencesRequest(
            LocaleCode locale,
            ThemeMode theme,
            AccentColor accentColor,
            BackgroundStyle backgroundStyle,
            Boolean rtl,
            Boolean reducedMotion,
            Boolean hapticFeedback,
            Boolean onboardingCompleted,
            @Min(1) @Max(200) Integer filterRadiusKm,
            SortBy filterSortBy,
            Boolean filterWithImageOnly,
            @Size(min = 2, max = 3) String filterCountryCode,
            Set<PlaceCategory> selectedCategories
    ) {}

    public record UpdateProfileRequest(
            @Size(min = 1, max = 80) String displayName
    ) {}

    public record ChangePasswordRequest(
            @jakarta.validation.constraints.NotBlank @Size(min = 1) String currentPassword,
            @jakarta.validation.constraints.NotBlank @com.lunerie.api.common.validation.StrongPassword String newPassword
    ) {}

    public record DeleteAccountRequest(
            @jakarta.validation.constraints.NotBlank String currentPassword,
            /** Must equal the literal string {@code DELETE MY ACCOUNT}. */
            @jakarta.validation.constraints.Pattern(regexp = "^DELETE MY ACCOUNT$",
                    message = "Type 'DELETE MY ACCOUNT' to confirm") String confirmation
    ) {}

    public record FavoriteResponse(
            String id,
            String placeId,
            java.time.Instant savedAt
    ) {}

    public record RecentViewResponse(
            String id,
            String placeId,
            java.time.Instant viewedAt
    ) {}
}
