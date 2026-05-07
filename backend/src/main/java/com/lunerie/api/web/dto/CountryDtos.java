package com.lunerie.api.web.dto;

import com.lunerie.api.domain.country.Country;

import java.util.Set;

public final class CountryDtos {
    private CountryDtos() {}

    public record CountrySummary(
            String code,
            String code3,
            String name,
            String nativeName,
            String region,
            String subregion,
            String capital,
            long population,
            String flagEmoji,
            String heroImageUrl,
            Set<String> languages,
            Set<String> currencies
    ) {
        public static CountrySummary from(Country c) {
            return new CountrySummary(
                    c.getCode(), c.getCode3(), c.getName(), c.getNativeName(),
                    c.getRegion(), c.getSubregion(), c.getCapital(), c.getPopulation(),
                    c.getFlagEmoji(), c.getHeroImageUrl(),
                    c.getLanguages(), c.getCurrencies()
            );
        }
    }

    public record RegionStats(
            String region,
            long countryCount,
            long totalPopulation
    ) {}
}
