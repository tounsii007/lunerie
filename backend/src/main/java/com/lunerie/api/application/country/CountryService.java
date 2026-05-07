package com.lunerie.api.application.country;

import com.lunerie.api.common.NotFoundException;
import com.lunerie.api.domain.country.Country;
import com.lunerie.api.domain.country.CountryRepository;
import com.lunerie.api.domain.place.PlaceRepository;
import com.lunerie.api.web.dto.CountryDtos.CountrySummary;
import com.lunerie.api.web.dto.CountryDtos.RegionStats;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CountryService {

    private final CountryRepository countryRepository;
    private final PlaceRepository placeRepository;

    public Page<Country> list(Pageable pageable) {
        return countryRepository.findAll(pageable);
    }

    public List<Country> listAll() {
        return countryRepository.findAll(org.springframework.data.domain.Sort.by("name").ascending());
    }

    /**
     * Cached DTO list — safe across cache hits because DTOs are fully materialized
     * (no JPA lazy collections). Cache eviction handled by AdminService.
     */
    @Cacheable("countries-all-dto")
    public List<CountrySummary> listAllAsDto() {
        return listAll().stream().map(CountrySummary::from).toList();
    }

    public Country get(String code) {
        return countryRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> NotFoundException.of("Country", code));
    }

    public Country getByCode3(String code3) {
        return countryRepository.findByCode3IgnoreCase(code3)
                .orElseThrow(() -> NotFoundException.of("Country(code3)", code3));
    }

    public Page<Country> search(String query, Pageable pageable) {
        return countryRepository.search(query, pageable);
    }

    public Page<Country> byRegion(String region, Pageable pageable) {
        return countryRepository.findByRegionIgnoreCase(region, pageable);
    }

    @Cacheable("countries-list")
    public List<String> regions() {
        return countryRepository.findDistinctRegions();
    }

    @Cacheable("countries-list")
    public List<RegionStats> regionStats() {
        return countryRepository.aggregateByRegion().stream()
                .map(row -> new RegionStats(row.getRegion(), row.getCount(), row.getTotalPopulation()))
                .toList();
    }

    public long count() {
        return countryRepository.count();
    }

    public long countPlacesIn(String code) {
        return placeRepository.countByCountry_CodeIgnoreCase(code);
    }
}
