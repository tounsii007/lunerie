package com.lunerie.api.web.dto;

import com.lunerie.api.domain.country.Country;
import com.lunerie.api.domain.place.Place;
import com.lunerie.api.domain.place.PlaceCategory;
import com.lunerie.api.domain.user.User;
import com.lunerie.api.domain.user.UserRole;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public final class AdminDtos {
    private AdminDtos() {}

    public record AdminUserResponse(
            UUID id,
            String email,
            String displayName,
            boolean active,
            Set<String> roles,
            Instant createdAt,
            Instant updatedAt
    ) {
        public static AdminUserResponse from(User u) {
            return new AdminUserResponse(
                    u.getId(), u.getEmail(), u.getDisplayName(), u.isActive(),
                    u.getRoles().stream().map(Enum::name)
                            .collect(Collectors.toCollection(java.util.LinkedHashSet::new)),
                    u.getCreatedAt(), u.getUpdatedAt()
            );
        }
    }

    public record SetActiveRequest(@NotNull Boolean active) {}
    public record SetAdminRequest(@NotNull Boolean admin) {}

    public record CreatePlaceRequest(
            @NotBlank @Size(min = 1, max = 200) String slug,
            @NotBlank @Size(min = 1, max = 200) String name,
            @NotBlank @Size(min = 1, max = 4000) String description,
            @NotBlank @Size(min = 2, max = 2) String countryCode,
            @NotBlank @Size(min = 1, max = 80) String region,
            @NotBlank @Size(min = 1, max = 120) String city,
            @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @Size(max = 1024) String heroImageUrl,
            @Size(max = 256) String heroImageAlt,
            @NotEmpty Set<PlaceCategory> categories,
            Set<String> tags,
            @NotNull @Min(0) @Max(100) Integer popularity,
            @NotNull @Min(0) @Max(100) Integer relevance
    ) {
        public Place toEntity(Country country) {
            return Place.builder()
                    .slug(slug.trim())
                    .name(name.trim())
                    .description(description.trim())
                    .country(country)
                    .region(region.trim())
                    .city(city.trim())
                    .latitude(latitude)
                    .longitude(longitude)
                    .heroImageUrl(heroImageUrl)
                    .heroImageAlt(heroImageAlt)
                    .categories(new LinkedHashSet<>(categories))
                    .tags(tags == null ? new LinkedHashSet<>() : new LinkedHashSet<>(tags))
                    .popularity(popularity)
                    .relevance(relevance)
                    .hasImage(heroImageUrl != null && !heroImageUrl.isBlank())
                    .build();
        }
    }

    public record UpdatePlaceRequest(
            @Size(min = 1, max = 200) String name,
            @Size(min = 1, max = 4000) String description,
            @Size(min = 1, max = 80) String region,
            @Size(min = 1, max = 120) String city,
            @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @Size(max = 1024) String heroImageUrl,
            @Size(max = 256) String heroImageAlt,
            Set<PlaceCategory> categories,
            Set<String> tags,
            @Min(0) @Max(100) Integer popularity,
            @Min(0) @Max(100) Integer relevance
    ) {
        public com.lunerie.api.application.admin.PlacePatch toPatch() {
            return new com.lunerie.api.application.admin.PlacePatch(
                    name, description, region, city, latitude, longitude,
                    heroImageUrl, heroImageAlt,
                    categories == null ? null : new LinkedHashSet<>(categories),
                    tags == null ? null : new LinkedHashSet<>(tags),
                    popularity, relevance
            );
        }
    }

    public record UpsertCountryRequest(
            @NotBlank @Size(min = 2, max = 2) String code,
            @NotBlank @Size(min = 3, max = 3) String code3,
            @NotBlank @Size(max = 120) String name,
            @Size(max = 200) String nativeName,
            @NotBlank @Size(max = 80) String region,
            @Size(max = 80) String subregion,
            @Size(max = 120) String capital,
            @PositiveOrZero long population,
            @Size(max = 8) String flagEmoji,
            @Size(max = 1024) String heroImageUrl,
            @Size(max = 256) String heroImageAlt,
            Set<String> languages,
            Set<String> currencies
    ) {
        public Country toEntity() {
            return Country.builder()
                    .code(code.toUpperCase()).code3(code3.toUpperCase())
                    .name(name).nativeName(nativeName).region(region).subregion(subregion)
                    .capital(capital).population(population).flagEmoji(flagEmoji)
                    .heroImageUrl(heroImageUrl).heroImageAlt(heroImageAlt)
                    .languages(languages == null ? new LinkedHashSet<>() : new LinkedHashSet<>(languages))
                    .currencies(currencies == null ? new LinkedHashSet<>() : new LinkedHashSet<>(currencies))
                    .build();
        }
    }
}
