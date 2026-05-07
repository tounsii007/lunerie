package com.lunerie.api.web;

import com.lunerie.api.application.place.PlaceService;
import com.lunerie.api.common.PageResponse;
import com.lunerie.api.common.Responses;
import com.lunerie.api.domain.place.PlaceCategory;
import com.lunerie.api.web.dto.PlaceDtos;
import com.lunerie.api.web.dto.PlaceDtos.CategoryCount;
import com.lunerie.api.web.dto.PlaceDtos.PlaceDetail;
import com.lunerie.api.web.dto.PlaceDtos.PlaceStats;
import com.lunerie.api.web.dto.PlaceDtos.PlaceSummary;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Places")
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @Operation(summary = "List places with filters and pagination")
    @GetMapping
    public PageResponse<PlaceSummary> list(
            @RequestParam(required = false) String countryCode,
            @RequestParam(required = false) PlaceCategory category,
            @RequestParam(required = false) Boolean withImageOnly,
            @RequestParam(required = false) @Min(0) @Max(100) Integer minPopularity,
            @RequestParam(required = false) @Min(0) @Max(100) Integer minRelevance,
            @PageableDefault(size = 24, sort = "popularity") Pageable pageable
    ) {
        var criteria = new PlaceService.SearchCriteria(countryCode, category, withImageOnly, minPopularity, minRelevance);
        return PageResponse.of(placeService.list(criteria, pageable), PlaceSummary::from);
    }

    @Operation(summary = "Total number of places")
    @GetMapping("/count")
    public Responses.Count count() {
        return Responses.Count.of(placeService.count());
    }

    @Operation(summary = "List of supported categories")
    @GetMapping("/categories")
    public List<PlaceCategory> categories() {
        return placeService.categories();
    }

    @Operation(summary = "Aggregate stats over the place catalog")
    @GetMapping("/stats")
    public PlaceStats stats() {
        var stats = placeService.stats();
        var byCategory = stats.byCategory().entrySet().stream()
                .map(e -> new CategoryCount(e.getKey(), e.getValue()))
                .toList();
        return new PlaceStats(
                stats.total(), stats.withImage(),
                round(stats.averagePopularity()), round(stats.averageRelevance()),
                stats.byCategory().size(),
                /* countryCount: derived per call to keep stats class focused */ -1,
                byCategory
        );
    }

    @Operation(summary = "Curated trending feed")
    @GetMapping("/explore")
    public PageResponse<PlaceSummary> explore(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "24") @Min(1) @Max(100) int size
    ) {
        return PageResponse.of(placeService.explore(page, size), PlaceSummary::from);
    }

    @Operation(summary = "Free-text search across places (combined with filters)")
    @GetMapping("/search")
    public PageResponse<PlaceSummary> search(
            @RequestParam @NotBlank String q,
            @RequestParam(required = false) String countryCode,
            @RequestParam(required = false) PlaceCategory category,
            @RequestParam(required = false) Boolean withImageOnly,
            @PageableDefault(size = 24) Pageable pageable
    ) {
        var criteria = new PlaceService.SearchCriteria(countryCode, category, withImageOnly, null, null);
        return PageResponse.of(placeService.search(q, criteria, pageable), PlaceSummary::from);
    }

    @Operation(summary = "Geographic nearby search using Haversine")
    @GetMapping("/nearby")
    public List<PlaceSummary> nearby(
            @Parameter(required = true) @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") double lat,
            @Parameter(required = true) @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") double lon,
            @RequestParam(defaultValue = "80") @Min(1) @Max(200) double radiusKm,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        return placeService.nearby(lat, lon, radiusKm, limit).stream().map(PlaceSummary::from).toList();
    }

    @Operation(summary = "Places in a country")
    @GetMapping("/by-country/{countryCode}")
    public PageResponse<PlaceSummary> byCountry(
            @PathVariable @Size(min = 2, max = 2) String countryCode,
            @PageableDefault(size = 24) Pageable pageable
    ) {
        return PageResponse.of(placeService.byCountry(countryCode, pageable), PlaceSummary::from);
    }

    @Operation(summary = "Places of a category")
    @GetMapping("/by-category/{category}")
    public PageResponse<PlaceSummary> byCategory(
            @PathVariable PlaceCategory category,
            @PageableDefault(size = 24) Pageable pageable
    ) {
        return PageResponse.of(placeService.byCategory(category, pageable), PlaceSummary::from);
    }

    @Operation(summary = "Most popular places (≥ minPopularity)")
    @GetMapping("/popular")
    public PageResponse<PlaceSummary> popular(
            @RequestParam(defaultValue = "85") @Min(0) @Max(100) int minPopularity,
            @PageableDefault(size = 24) Pageable pageable
    ) {
        return PageResponse.of(placeService.popular(minPopularity, pageable), PlaceSummary::from);
    }

    @Operation(summary = "Most recently updated places")
    @GetMapping("/recent")
    public PageResponse<PlaceSummary> recent(@PageableDefault(size = 24) Pageable pageable) {
        return PageResponse.of(placeService.recent(pageable), PlaceSummary::from);
    }

    @Operation(summary = "Random sample of places")
    @GetMapping("/random")
    public List<PlaceSummary> random(@RequestParam(defaultValue = "8") @Min(1) @Max(50) int limit) {
        return placeService.random(limit).stream().map(PlaceSummary::from).toList();
    }

    @Operation(summary = "Place detail by id")
    @GetMapping("/{id}")
    public PlaceDetail get(@PathVariable UUID id) {
        return PlaceDetail.from(placeService.get(id));
    }

    @Operation(summary = "Place detail by slug")
    @GetMapping("/by-slug/{slug}")
    public PlaceDetail bySlug(@PathVariable String slug) {
        return PlaceDetail.from(placeService.getBySlug(slug));
    }

    @Operation(summary = "Autocomplete suggestions for the search bar")
    @GetMapping("/suggest")
    public List<PlaceSummary> suggest(
            @RequestParam @NotBlank String prefix,
            @RequestParam(defaultValue = "8") @Min(1) @Max(20) int limit
    ) {
        return placeService.suggest(prefix, limit).stream().map(PlaceSummary::from).toList();
    }

    @Operation(summary = "Related places (same country or shared categories)")
    @GetMapping("/{id}/related")
    public List<PlaceSummary> related(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "6") @Min(1) @Max(20) int limit
    ) {
        return placeService.related(id, limit).stream().map(PlaceSummary::from).toList();
    }

    @Operation(summary = "Full-text search via Postgres tsvector (ranked)")
    @GetMapping("/fts")
    public PageResponse<PlaceSummary> fullTextSearch(
            @RequestParam @NotBlank String q,
            @PageableDefault(size = 24) Pageable pageable
    ) {
        return PageResponse.of(placeService.fullTextSearch(q, pageable), PlaceSummary::from);
    }

    @Operation(summary = "Places that share a tag")
    @GetMapping("/by-tag/{tag}")
    public PageResponse<PlaceSummary> byTag(
            @PathVariable @NotBlank String tag,
            @PageableDefault(size = 24) Pageable pageable
    ) {
        return PageResponse.of(placeService.byTag(tag, pageable), PlaceSummary::from);
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
