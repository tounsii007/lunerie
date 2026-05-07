package com.lunerie.api.web;

import com.lunerie.api.application.verification.VerificationService;
import com.lunerie.api.common.validation.StrongPassword;
import com.lunerie.api.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Verification + password reset")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;
    private final CurrentUser currentUser;

    public record EmailRequest(@NotBlank @Email @Size(max = 254) String email) {}
    public record TokenRequest(@NotBlank String token) {}
    public record CompleteResetRequest(@NotBlank String token, @NotBlank @StrongPassword String newPassword) {}

    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Send/resend the email-verification link to the current user")
    @PostMapping("/verification/send")
    public ResponseEntity<Void> sendVerification() {
        verificationService.sendVerificationEmail(currentUser.require());
        return ResponseEntity.accepted().build();
    }

    @Operation(summary = "Confirm an email using the token from the verification link")
    @PostMapping("/verification/confirm")
    public ResponseEntity<Void> confirm(@Valid @RequestBody TokenRequest request) {
        verificationService.verifyEmail(request.token());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Request a password reset email (returns 202 even if the email is unknown)")
    @PostMapping("/password/forgot")
    public ResponseEntity<Void> forgot(@Valid @RequestBody EmailRequest request, HttpServletRequest http) {
        verificationService.requestPasswordReset(request.email(), http.getHeader("User-Agent"), http.getRemoteAddr());
        return ResponseEntity.accepted().build();
    }

    @Operation(summary = "Complete a password reset using the email link token")
    @PostMapping("/password/reset")
    public ResponseEntity<Void> reset(@Valid @RequestBody CompleteResetRequest request) {
        verificationService.completePasswordReset(request.token(), request.newPassword());
        return ResponseEntity.noContent().build();
    }
}
