package com.lunerie.api.web.dto;

import com.lunerie.api.common.validation.StrongPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @StrongPassword String password,
            @NotBlank @Size(min = 1, max = 80) String displayName
    ) {}

    public record LoginRequest(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 1, max = 100) String password
    ) {}

    public record RefreshRequest(
            @NotBlank String refreshToken
    ) {}

    public record LogoutRequest(
            String refreshToken
    ) {}

    public record AuthTokens(
            String tokenType,
            String accessToken,
            long accessTokenExpiresInSeconds,
            String refreshToken,
            long refreshTokenExpiresInSeconds,
            UserSummary user
    ) {}

    public record UserSummary(
            String id,
            String email,
            String displayName,
            java.util.Set<String> roles
    ) {}
}
