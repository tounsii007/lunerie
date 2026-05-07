package com.lunerie.api.domain.country;

import com.lunerie.api.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "countries", indexes = {
        @Index(name = "idx_countries_code", columnList = "code", unique = true),
        @Index(name = "idx_countries_code3", columnList = "code3", unique = true),
        @Index(name = "idx_countries_region", columnList = "region")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Country extends BaseEntity {

    @Id
    @Size(min = 2, max = 2)
    @Column(length = 2, nullable = false, unique = true)
    private String code;

    @NotBlank
    @Size(min = 3, max = 3)
    @Column(length = 3, nullable = false, unique = true)
    private String code3;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "native_name", length = 200)
    private String nativeName;

    @NotBlank
    @Size(max = 80)
    @Column(nullable = false, length = 80)
    private String region;

    @Column(length = 80)
    private String subregion;

    @Column(length = 120)
    private String capital;

    @PositiveOrZero
    @Column(nullable = false)
    private long population;

    @Size(max = 8)
    @Column(name = "flag_emoji", length = 8)
    private String flagEmoji;

    @Column(name = "hero_image_url", length = 1024)
    private String heroImageUrl;

    @Column(name = "hero_image_alt", length = 256)
    private String heroImageAlt;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "country_languages",
            joinColumns = @JoinColumn(name = "country_code"),
            indexes = @Index(name = "idx_country_languages_country", columnList = "country_code"))
    @Column(name = "language", length = 80, nullable = false)
    private Set<String> languages = new LinkedHashSet<>();

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "country_currencies",
            joinColumns = @JoinColumn(name = "country_code"),
            indexes = @Index(name = "idx_country_currencies_country", columnList = "country_code"))
    @Column(name = "currency", length = 8, nullable = false)
    private Set<String> currencies = new LinkedHashSet<>();
}
