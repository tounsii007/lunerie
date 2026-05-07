package com.lunerie.api.web;

import com.lunerie.api.application.user.AccountExportService;
import com.lunerie.api.application.user.PreferencesService;
import com.lunerie.api.application.user.UserService;
import com.lunerie.api.security.CurrentUser;
import com.lunerie.api.web.dto.AuthDtos.UserSummary;
import com.lunerie.api.web.dto.UserDtos.ChangePasswordRequest;
import com.lunerie.api.web.dto.UserDtos.DeleteAccountRequest;
import com.lunerie.api.web.dto.UserDtos.PatchPreferencesRequest;
import com.lunerie.api.web.dto.UserDtos.PreferencesResponse;
import com.lunerie.api.web.dto.UserDtos.UpdatePreferencesRequest;
import com.lunerie.api.web.dto.UserDtos.UpdateProfileRequest;
import com.lunerie.api.domain.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Users")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserController {

    private final CurrentUser currentUser;
    private final UserService userService;
    private final PreferencesService preferencesService;
    private final AccountExportService accountExportService;

    @Operation(summary = "Current user profile")
    @GetMapping
    public UserSummary me() {
        User user = currentUser.require();
        return new UserSummary(
                user.getId().toString(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRoles().stream().map(Enum::name).collect(java.util.stream.Collectors.toCollection(java.util.LinkedHashSet::new))
        );
    }

    @Operation(summary = "Update display name")
    @PatchMapping
    public UserSummary updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User user = userService.updateProfile(currentUser.require(), request);
        return new UserSummary(
                user.getId().toString(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRoles().stream().map(Enum::name).collect(java.util.stream.Collectors.toCollection(java.util.LinkedHashSet::new))
        );
    }

    @Operation(summary = "Change password")
    @PostMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(currentUser.require(), request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Deactivate the current account")
    @DeleteMapping
    public ResponseEntity<Void> deactivate() {
        userService.deactivate(currentUser.require());
        return ResponseEntity.noContent().build();
    }

    /* ----- Preferences ---------------------------------------------------- */

    @Operation(summary = "Read preferences")
    @GetMapping("/preferences")
    public PreferencesResponse preferences() {
        return PreferencesResponse.from(preferencesService.forUser(currentUser.requireWithPreferences()));
    }

    @Operation(summary = "Replace preferences (full update)")
    @PutMapping("/preferences")
    public PreferencesResponse replacePreferences(@Valid @RequestBody UpdatePreferencesRequest request) {
        return PreferencesResponse.from(preferencesService.replace(currentUser.requireWithPreferences(), request));
    }

    @Operation(summary = "Patch preferences (partial update)")
    @PatchMapping("/preferences")
    public PreferencesResponse patchPreferences(@Valid @RequestBody PatchPreferencesRequest request) {
        return PreferencesResponse.from(preferencesService.patch(currentUser.requireWithPreferences(), request));
    }

    /* ----- GDPR ----------------------------------------------------------- */

    @Operation(summary = "Export all data tied to the current account (GDPR Art. 15)")
    @GetMapping("/export")
    public ResponseEntity<com.lunerie.api.application.user.AccountExport> export() {
        var data = accountExportService.export(currentUser.requireWithPreferences());
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"lunerie-account-export.json\"")
                .body(data);
    }

    @Operation(summary = "Permanently delete the current account and all related data (GDPR Art. 17). Requires password + confirmation phrase.")
    @PostMapping("/permanent")
    public ResponseEntity<Void> hardDelete(@Valid @RequestBody DeleteAccountRequest request) {
        var user = currentUser.require();
        userService.verifyPassword(user, request.currentPassword());
        accountExportService.hardDelete(user);
        return ResponseEntity.noContent().build();
    }
}
