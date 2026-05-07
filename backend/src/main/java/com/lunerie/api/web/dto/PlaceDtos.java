package com.lunerie.api.web.dto;

import com.lunerie.api.domain.place.Place;
import com.lunerie.api.domain.place.PlaceCategory;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public final class PlaceDtos {
    private PlaceDtos() {}

    public record PlaceSummary(
            UUID id,
            String slug,
            String name,
            String city,
            String region,
            String countryCode,
            String countryName,
            Double latitude,
            Double longitude,
            int popularity,
            int relevance,
            boolean hasImage,
            String heroImageUrl,
            Set<PlaceCategory> categories
    ) {
        public static PlaceSummary from(Place p) {
            return new PlaceSummary(
                    p.getId(),
                    p.getSlug(),
                    p.getName(),
                    p.getCity(),
                    p.getRegion(),
                    p.getCountry().getCode(),
                    p.getCountry().getName(),
                    p.getLatitude(),
                    p.getLongitude(),
                    p.getPopularity(),
                    p.getRelevance(),
                    p.isHasImage(),
                    p.getHeroImageUrl(),
                    p.getCategories()
            );
        }
    }

    public record PlaceImage(String url, String alt, String photographer, String source,
                             Integer width, Integer height, boolean hero) {}

    public record PlaceDetail(
            UUID id,
            String slug,
            String name,
            String description,
            String city,
            String region,
            String countryCode,
            String countryName,
            Double latitude,
            Double longitude,
            int popularity,
            int relevance,
            boolean hasImage,
            String heroImageUrl,
            String heroImageAlt,
            String heroImageSource,
            String heroImagePhotographer,
            java.util.List<PlaceImage> images,
            String sourceAttribution,
            Set<PlaceCategory> categories,
            Set<String> tags,
            Instant createdAt,
            Instant updatedAt
    ) {
        public static PlaceDetail from(Place p) {
            java.util.List<PlaceImage> imageDtos = p.getImages() == null ? java.util.List.of()
                    : p.getImages().stream()
                            .map(img -> new PlaceImage(img.getUrl(), img.getAlt(),
                                    img.getPhotographer(), img.getSource(),
                                    img.getWidth(), img.getHeight(), img.isHero()))
                            .toList();
            return new PlaceDetail(
                    p.getId(), p.getSlug(), p.getName(), p.getDescription(),
                    p.getCity(), p.getRegion(),
                    p.getCountry().getCode(), p.getCountry().getName(),
                    p.getLatitude(), p.getLongitude(),
                    p.getPopularity(), p.getRelevance(), p.isHasImage(),
                    p.getHeroImageUrl(), p.getHeroImageAlt(),
                    p.getHeroImageSource(), p.getHeroImagePhotographer(),
                    imageDtos, p.getSourceAttribution(),
                    p.getCategories(), p.getTags(),
                    p.getCreatedAt(), p.getUpdatedAt()
            );
        }
    }

    public record PlaceStats(
            long totalPlaces,
            long placesWithImage,
            double averagePopularity,
            double averageRelevance,
            int categoryCount,
            int countryCount,
            List<CategoryCount> byCategory
    ) {}

    public record CategoryCount(PlaceCategory category, long count) {}
}
