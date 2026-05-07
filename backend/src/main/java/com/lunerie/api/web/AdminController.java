package com.lunerie.api.web;

import com.lunerie.api.application.admin.AdminService;
import com.lunerie.api.common.NotFoundException;
import com.lunerie.api.common.PageResponse;
import com.lunerie.api.domain.country.CountryRepository;
import com.lunerie.api.web.dto.AdminDtos.*;
import com.lunerie.api.web.dto.CountryDtos.CountrySummary;
import com.lunerie.api.web.dto.PlaceDtos.PlaceDetail;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Tag(name = "Admin")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final CountryRepository countryRepository;

    /* ----- Users ---------------------------------------------------------- */

    @Operation(summary = "List all users (admin)")
    @GetMapping("/users")
    public PageResponse<AdminUserResponse> users(@PageableDefault(size = 50, sort = "email") Pageable pageable) {
        return PageResponse.of(adminService.users(pageable), AdminUserResponse::from);
    }

    @Operation(summary = "Activate or deactivate a user")
    @PostMapping("/users/{userId}/active")
    public ResponseEntity<Void> setActive(@PathVariable UUID userId, @Valid @RequestBody SetActiveRequest request) {
        adminService.setActive(userId, request.active());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Grant or revoke admin role")
    @PostMapping("/users/{userId}/admin")
    public ResponseEntity<Void> setAdmin(@PathVariable UUID userId, @Valid @RequestBody SetAdminRequest request) {
        adminService.setAdmin(userId, request.admin());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Revoke all refresh tokens for a user")
    @PostMapping("/users/{userId}/revoke-tokens")
    public Map<String, Integer> revokeTokens(@PathVariable UUID userId) {
        return Map.of("revoked", adminService.revokeAllRefreshTokens(userId));
    }

    /* ----- Places --------------------------------------------------------- */

    @Operation(summary = "Create a place")
    @PostMapping("/places")
    public ResponseEntity<PlaceDetail> createPlace(@Valid @RequestBody CreatePlaceRequest request) {
        var country = countryRepository.findByCodeIgnoreCase(request.countryCode())
                .orElseThrow(() -> NotFoundException.of("Country", request.countryCode()));
        var place = adminService.createPlace(request.toEntity(country));
        return ResponseEntity.status(HttpStatus.CREATED).body(PlaceDetail.from(place));
    }

    @Operation(summary = "Update a place")
    @PatchMapping("/places/{id}")
    public PlaceDetail updatePlace(@PathVariable UUID id, @Valid @RequestBody UpdatePlaceRequest request) {
        return PlaceDetail.from(adminService.updatePlace(id, request.toPatch()));
    }

    @Operation(summary = "Delete a place")
    @DeleteMapping("/places/{id}")
    public ResponseEntity<Void> deletePlace(@PathVariable UUID id) {
        adminService.deletePlace(id);
        return ResponseEntity.noContent().build();
    }

    /* ----- Countries ------------------------------------------------------ */

    @Operation(summary = "Create or replace a country")
    @PutMapping("/countries")
    public CountrySummary upsertCountry(@Valid @RequestBody UpsertCountryRequest request) {
        return CountrySummary.from(adminService.saveCountry(request.toEntity()));
    }

    @Operation(summary = "Delete a country")
    @DeleteMapping("/countries/{code}")
    public ResponseEntity<Void> deleteCountry(@PathVariable String code) {
        adminService.deleteCountry(code);
        return ResponseEntity.noContent().build();
    }

    /* ----- Cache ---------------------------------------------------------- */

    @Operation(summary = "Evict all caches")
    @PostMapping("/caches/evict-all")
    public ResponseEntity<Void> evictAll() {
        adminService.evictAllCaches();
        return ResponseEntity.noContent().build();
    }
}
