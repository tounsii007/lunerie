package com.lunerie.api.web;

import com.lunerie.api.application.recentsearch.RecentSearchService;
import com.lunerie.api.common.PageResponse;
import com.lunerie.api.security.CurrentUser;
import com.lunerie.api.web.dto.RecentSearchDtos.RecentSearchResponse;
import com.lunerie.api.web.dto.RecentSearchDtos.RecordSearchRequest;
import com.lunerie.api.web.dto.RecentSearchDtos.TrendingTermResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Recent searches")
@RestController
@RequestMapping("/api/recent-searches")
@RequiredArgsConstructor
public class RecentSearchController {

    private final RecentSearchService service;
    private final CurrentUser currentUser;

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Paginated list of the user's recent searches")
    @GetMapping
    public PageResponse<RecentSearchResponse> list(@PageableDefault(size = 16) Pageable pageable) {
        return PageResponse.of(service.list(currentUser.require(), pageable), RecentSearchResponse::from);
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Top 8 most recent searches (for autosuggest)")
    @GetMapping("/top")
    public List<RecentSearchResponse> top() {
        return service.top(currentUser.require()).stream().map(RecentSearchResponse::from).toList();
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Count of stored recent searches")
    @GetMapping("/count")
    public com.lunerie.api.common.Responses.Count count() {
        return com.lunerie.api.common.Responses.Count.of(service.count(currentUser.require()));
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Record a search (idempotent — refreshes timestamp if it exists)")
    @PostMapping
    public ResponseEntity<RecentSearchResponse> record(@Valid @RequestBody RecordSearchRequest request) {
        var entry = service.record(currentUser.require(), request.query(), request.resultCount());
        return ResponseEntity.status(HttpStatus.CREATED).body(RecentSearchResponse.from(entry));
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Remove a stored search")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable UUID id) {
        service.remove(currentUser.require(), id);
        return ResponseEntity.noContent().build();
    }

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Clear all stored searches")
    @DeleteMapping
    public ResponseEntity<Void> clear() {
        service.clear(currentUser.require());
        return ResponseEntity.noContent().build();
    }

    /* Public — no auth required */
    @Operation(summary = "Trending search terms across all users (last 30d)")
    @GetMapping("/trending")
    public List<TrendingTermResponse> trending(
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int limit
    ) {
        return service.trending(limit).stream().map(TrendingTermResponse::from).toList();
    }
}
