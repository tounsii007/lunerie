package com.lunerie.api.web;

import com.lunerie.api.application.favorite.FavoriteService;
import com.lunerie.api.common.PageResponse;
import com.lunerie.api.common.Responses;
import com.lunerie.api.security.CurrentUser;
import com.lunerie.api.web.dto.PlaceDtos.PlaceSummary;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Favorites")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final CurrentUser currentUser;

    @Operation(summary = "List the current user's favorites (newest first)")
    @GetMapping
    public PageResponse<PlaceSummary> list(@PageableDefault(size = 50) Pageable pageable) {
        var page = favoriteService.list(currentUser.require(), pageable);
        return PageResponse.of(page, fav -> PlaceSummary.from(fav.getPlace()));
    }

    @Operation(summary = "Number of favorites for the current user")
    @GetMapping("/count")
    public Responses.Count count() {
        return Responses.Count.of(favoriteService.count(currentUser.require()));
    }

    @Operation(summary = "Check whether a place is favorited by the current user")
    @GetMapping("/check/{placeId}")
    public Responses.BoolValue check(@PathVariable UUID placeId) {
        return Responses.BoolValue.of(favoriteService.isFavorite(currentUser.require(), placeId));
    }

    @Operation(summary = "Add a place to favorites (idempotent)")
    @PostMapping("/{placeId}")
    public ResponseEntity<PlaceSummary> add(@PathVariable UUID placeId) {
        var favorite = favoriteService.add(currentUser.require(), placeId);
        return ResponseEntity.status(HttpStatus.CREATED).body(PlaceSummary.from(favorite.getPlace()));
    }

    @Operation(summary = "Remove a place from favorites")
    @DeleteMapping("/{placeId}")
    public ResponseEntity<Void> remove(@PathVariable UUID placeId) {
        favoriteService.remove(currentUser.require(), placeId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Remove all favorites for the current user")
    @DeleteMapping
    public ResponseEntity<Void> clear() {
        favoriteService.clear(currentUser.require());
        return ResponseEntity.noContent().build();
    }
}
