package com.lunerie.api.web;

import com.lunerie.api.application.recentview.RecentViewService;
import com.lunerie.api.common.PageResponse;
import com.lunerie.api.security.CurrentUser;
import com.lunerie.api.web.dto.PlaceDtos.PlaceSummary;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Recent views")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/recent-views")
@RequiredArgsConstructor
public class RecentViewController {

    private final RecentViewService recentViewService;
    private final CurrentUser currentUser;

    @Operation(summary = "Most recently viewed places (paginated)")
    @GetMapping
    public PageResponse<PlaceSummary> list(@PageableDefault(size = 12) Pageable pageable) {
        return PageResponse.of(
                recentViewService.list(currentUser.require(), pageable),
                view -> PlaceSummary.from(view.getPlace())
        );
    }

    @Operation(summary = "Top 12 most recent views")
    @GetMapping("/top")
    public List<PlaceSummary> top() {
        return recentViewService.recent(currentUser.require()).stream()
                .map(view -> PlaceSummary.from(view.getPlace()))
                .toList();
    }

    @Operation(summary = "Count of recent views")
    @GetMapping("/count")
    public com.lunerie.api.common.Responses.Count count() {
        return com.lunerie.api.common.Responses.Count.of(recentViewService.count(currentUser.require()));
    }

    @Operation(summary = "Push a place to the top of recent views (idempotent)")
    @PostMapping("/{placeId}")
    public PlaceSummary push(@PathVariable UUID placeId) {
        var view = recentViewService.push(currentUser.require(), placeId);
        return PlaceSummary.from(view.getPlace());
    }

    @Operation(summary = "Remove a place from the recent views list")
    @DeleteMapping("/{placeId}")
    public ResponseEntity<Void> remove(@PathVariable UUID placeId) {
        recentViewService.remove(currentUser.require(), placeId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Clear the recent views list")
    @DeleteMapping
    public ResponseEntity<Void> clear() {
        recentViewService.clear(currentUser.require());
        return ResponseEntity.noContent().build();
    }
}
