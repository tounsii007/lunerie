package com.lunerie.api.web;

import com.lunerie.api.application.country.CountryService;
import com.lunerie.api.application.place.PlaceService;
import com.lunerie.api.common.PageResponse;
import com.lunerie.api.common.Responses;
import com.lunerie.api.web.dto.CountryDtos.CountrySummary;
import com.lunerie.api.web.dto.CountryDtos.RegionStats;
import com.lunerie.api.web.dto.PlaceDtos.PlaceSummary;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Countries")
@RestController
@RequestMapping("/api/countries")
@RequiredArgsConstructor
public class CountryController {

    private final CountryService countryService;
    private final PlaceService placeService;

    @Operation(summary = "List all countries (paginated)")
    @GetMapping
    public PageResponse<CountrySummary> list(@PageableDefault(size = 50, sort = "name") Pageable pageable) {
        return PageResponse.of(countryService.list(pageable), CountrySummary::from);
    }

    @Operation(summary = "All countries as a flat list (no pagination, cached)")
    @GetMapping("/all")
    public List<CountrySummary> all() {
        return countryService.listAllAsDto();
    }

    @Operation(summary = "Total country count")
    @GetMapping("/count")
    public Responses.Count count() {
        return Responses.Count.of(countryService.count());
    }

    @Operation(summary = "Distinct regions")
    @GetMapping("/regions")
    public List<String> regions() {
        return countryService.regions();
    }

    @Operation(summary = "Per-region aggregate stats")
    @GetMapping("/regions/stats")
    public List<RegionStats> regionStats() {
        return countryService.regionStats();
    }

    @Operation(summary = "Countries inside a region")
    @GetMapping("/by-region/{region}")
    public PageResponse<CountrySummary> byRegion(
            @PathVariable @NotBlank String region,
            @PageableDefault(size = 50, sort = "name") Pageable pageable
    ) {
        return PageResponse.of(countryService.byRegion(region, pageable), CountrySummary::from);
    }

    @Operation(summary = "Search countries by name / code / capital")
    @GetMapping("/search")
    public PageResponse<CountrySummary> search(
            @RequestParam @NotBlank String q,
            @PageableDefault(size = 50, sort = "name") Pageable pageable
    ) {
        return PageResponse.of(countryService.search(q, pageable), CountrySummary::from);
    }

    @Operation(summary = "Country by ISO-2 code")
    @GetMapping("/{code}")
    public CountrySummary get(@PathVariable @Size(min = 2, max = 2) String code) {
        return CountrySummary.from(countryService.get(code));
    }

    @Operation(summary = "Country by ISO-3 code")
    @GetMapping("/by-code3/{code3}")
    public CountrySummary getByCode3(@PathVariable @Size(min = 3, max = 3) String code3) {
        return CountrySummary.from(countryService.getByCode3(code3));
    }

    @Operation(summary = "Places inside a country (paginated)")
    @GetMapping("/{code}/places")
    public PageResponse<PlaceSummary> places(
            @PathVariable @Size(min = 2, max = 2) String code,
            @PageableDefault(size = 24) Pageable pageable
    ) {
        return PageResponse.of(placeService.byCountry(code, pageable), PlaceSummary::from);
    }

    @Operation(summary = "Country statistics: place count + categorical breakdown")
    @GetMapping("/{code}/stats")
    public Map<String, Object> stats(@PathVariable @Size(min = 2, max = 2) String code) {
        var country = countryService.get(code);
        long places = countryService.countPlacesIn(code);
        return Map.of(
                "country", CountrySummary.from(country),
                "placeCount", places
        );
    }
}
