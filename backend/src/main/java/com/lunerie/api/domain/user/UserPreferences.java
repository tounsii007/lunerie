package com.lunerie.api.domain.user;

import com.lunerie.api.common.BaseEntity;
import com.lunerie.api.domain.place.PlaceCategory;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "user_preferences", indexes = @Index(name = "idx_user_preferences_user", columnList = "user_id", unique = true))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferences extends BaseEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private LocaleCode locale = LocaleCode.EN;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "theme_mode", nullable = false, length = 16)
    private ThemeMode theme = ThemeMode.DARK;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "accent_color", nullable = false, length = 16)
    private AccentColor accentColor = AccentColor.SUNSET;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "background_style", nullable = false, length = 16)
    private BackgroundStyle backgroundStyle = BackgroundStyle.AURORA;

    @Builder.Default
    @Column(name = "rtl", nullable = false)
    private boolean rtl = false;

    @Builder.Default
    @Column(name = "reduced_motion", nullable = false)
    private boolean reducedMotion = false;

    @Builder.Default
    @Column(name = "haptic_feedback", nullable = false)
    private boolean hapticFeedback = true;

    @Builder.Default
    @Column(name = "onboarding_completed", nullable = false)
    private boolean onboardingCompleted = false;

    /* Discovery filters */

    @NotNull
    @Builder.Default
    @Min(1) @Max(200)
    @Column(name = "filter_radius_km", nullable = false)
    private Integer filterRadiusKm = 80;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "filter_sort_by", nullable = false, length = 16)
    private SortBy filterSortBy = SortBy.RELEVANCE;

    @Builder.Default
    @Column(name = "filter_with_image_only", nullable = false)
    private boolean filterWithImageOnly = true;

    @Column(name = "filter_country_code", length = 3)
    private String filterCountryCode;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_preferences_categories",
            joinColumns = @JoinColumn(name = "preferences_id"),
            indexes = @Index(name = "idx_user_pref_categories_pref", columnList = "preferences_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 32)
    private Set<PlaceCategory> selectedCategories = new LinkedHashSet<>(Set.of(
            PlaceCategory.VIEWPOINT,
            PlaceCategory.PHOTO_SPOT,
            PlaceCategory.HIDDEN_GEM
    ));
}
