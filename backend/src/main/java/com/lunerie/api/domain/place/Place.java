package com.lunerie.api.domain.place;

import com.lunerie.api.common.BaseEntity;
import com.lunerie.api.domain.country.Country;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "places", indexes = {
        @Index(name = "idx_places_slug", columnList = "slug", unique = true),
        @Index(name = "idx_places_country", columnList = "country_code"),
        @Index(name = "idx_places_popularity", columnList = "popularity DESC"),
        @Index(name = "idx_places_relevance", columnList = "relevance DESC"),
        @Index(name = "idx_places_updated_at", columnList = "updated_at DESC"),
        @Index(name = "idx_places_lat_lon", columnList = "latitude, longitude"),
        @Index(name = "idx_places_has_image", columnList = "has_image")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Place extends BaseEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, unique = true, length = 200)
    private String slug;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String name;

    @NotBlank
    @Size(max = 4000)
    @Column(nullable = false, length = 4000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "country_code", nullable = false, referencedColumnName = "code")
    @org.hibernate.annotations.BatchSize(size = 64)
    private Country country;

    @NotBlank
    @Size(max = 80)
    @Column(nullable = false, length = 80)
    private String region;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String city;

    @NotNull
    @DecimalMin("-90.0")
    @DecimalMax("90.0")
    @Column(nullable = false)
    private Double latitude;

    @NotNull
    @DecimalMin("-180.0")
    @DecimalMax("180.0")
    @Column(nullable = false)
    private Double longitude;

    // categories / tags are LAZY + @BatchSize. Listing endpoints used to issue
    // 2 extra SELECTs per place (EAGER) — for a 24-row page that's ~48 round
    // trips. With @BatchSize(64) Hibernate now groups all uninitialized
    // collections in the page into a single IN-query per collection (2 total).
    // The PlaceService primes these inside the @Transactional boundary so
    // OSIV-off serialization in the controller still works.
    @Builder.Default
    @ElementCollection(fetch = FetchType.LAZY, targetClass = PlaceCategory.class)
    @org.hibernate.annotations.BatchSize(size = 64)
    @CollectionTable(name = "place_categories",
            joinColumns = @JoinColumn(name = "place_id"),
            indexes = {
                    @Index(name = "idx_place_categories_place", columnList = "place_id"),
                    @Index(name = "idx_place_categories_category", columnList = "category")
            })
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 32)
    private Set<PlaceCategory> categories = new LinkedHashSet<>();

    @Builder.Default
    @ElementCollection(fetch = FetchType.LAZY)
    @org.hibernate.annotations.BatchSize(size = 64)
    @CollectionTable(name = "place_tags",
            joinColumns = @JoinColumn(name = "place_id"),
            indexes = @Index(name = "idx_place_tags_place", columnList = "place_id"))
    @Column(name = "tag", nullable = false, length = 80)
    private Set<String> tags = new LinkedHashSet<>();

    @Column(name = "hero_image_url", length = 1024)
    private String heroImageUrl;

    @Column(name = "hero_image_alt", length = 256)
    private String heroImageAlt;

    @Column(name = "hero_image_source", length = 32)
    private String heroImageSource;

    @Column(name = "hero_image_photographer", length = 200)
    private String heroImagePhotographer;

    @Builder.Default
    @OneToMany(mappedBy = "place", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @org.hibernate.annotations.OrderBy(clause = "sort_order asc")
    @org.hibernate.annotations.BatchSize(size = 32)
    private java.util.List<PlaceImage> images = new java.util.ArrayList<>();

    @Column(name = "source_attribution", length = 400)
    private String sourceAttribution;

    @Min(0)
    @Max(100)
    @Column(nullable = false)
    private int popularity;

    @Min(0)
    @Max(100)
    @Column(nullable = false)
    private int relevance;

    @Builder.Default
    @Column(name = "has_image", nullable = false)
    private boolean hasImage = false;
}
