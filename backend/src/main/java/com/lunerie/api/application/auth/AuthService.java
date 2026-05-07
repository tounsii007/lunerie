package com.lunerie.api.application.auth;

import com.lunerie.api.application.audit.AuditService;
import com.lunerie.api.application.verification.VerificationService;
import com.lunerie.api.common.BadRequestException;
import com.lunerie.api.common.BusinessMetrics;
import com.lunerie.api.common.ConflictException;
import com.lunerie.api.common.NotFoundException;
import com.lunerie.api.domain.user.*;
import com.lunerie.api.security.JwtService;
import com.lunerie.api.web.dto.AuthDtos;
import com.lunerie.api.web.dto.AuthDtos.AuthTokens;
import com.lunerie.api.web.dto.AuthDtos.UserSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final BusinessMetrics metrics;
    private final AuditService auditService;
    private final VerificationService verificationService;

    @Transactional
    public AuthTokens register(AuthDtos.RegisterRequest request, String userAgent, String ip) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email already registered");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .displayName(request.displayName().trim())
                .build();
        user.getRoles().add(UserRole.USER);

        UserPreferences preferences = UserPreferences.builder().user(user).build();
        user.setPreferences(preferences);

        userRepository.save(user);
        metrics.userRegistered();
        auditService.recordSimple("user.registered", user);
        // Fire-and-forget: send verification email async; failures should not block registration.
        try {
            verificationService.sendVerificationEmail(user);
        } catch (Exception ex) {
            log.warn("verification.send.failed user={} reason={}", user.getId(), ex.getMessage());
        }
        return issueTokens(user, userAgent, ip);
    }

    @Transactional
    public AuthTokens login(AuthDtos.LoginRequest request, String userAgent, String ip) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password()));
        } catch (BadCredentialsException ex) {
            metrics.loginFailure();
            throw new BadCredentialsException("Invalid email or password");
        } catch (LockedException ex) {
            metrics.loginFailure();
            throw new BadRequestException("Account is locked");
        }

        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.isActive()) {
            metrics.loginFailure();
            throw new BadCredentialsException("Account is disabled");
        }

        metrics.loginSuccess();
        auditService.recordSimple("user.login", user);
        return issueTokens(user, userAgent, ip);
    }

    @Transactional
    public AuthTokens refresh(String rawRefreshToken, String userAgent, String ip) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }
        String hash = jwtService.hashRefreshToken(rawRefreshToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            // Reuse detection: revoke all tokens for this user.
            log.warn("Refresh token reuse or expiry detected for user {}", stored.getUser().getId());
            refreshTokenRepository.revokeAllForUser(stored.getUser(), Instant.now());
            throw new BadCredentialsException("Refresh token is no longer valid");
        }

        // Rotation: revoke old, issue new.
        stored.setRevoked(true);
        stored.setRevokedAt(Instant.now());
        return issueTokens(stored.getUser(), userAgent, ip);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        String hash = jwtService.hashRefreshToken(rawRefreshToken);
        Optional<RefreshToken> opt = refreshTokenRepository.findByTokenHash(hash);
        opt.ifPresent(token -> {
            token.setRevoked(true);
            token.setRevokedAt(Instant.now());
        });
    }

    @Transactional
    public void logoutAll(User user) {
        refreshTokenRepository.revokeAllForUser(user, Instant.now());
    }

    @Transactional(readOnly = true)
    public UserSummary describe(User user) {
        return new UserSummary(
                user.getId().toString(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRoles().stream().map(UserRole::name).collect(Collectors.toCollection(java.util.LinkedHashSet::new))
        );
    }

    /* -------------------------------------------------------------------- */

    private AuthTokens issueTokens(User user, String userAgent, String ip) {
        String access = jwtService.issueAccessToken(user);
        String refreshRaw = jwtService.generateRefreshTokenRaw();
        String refreshHash = jwtService.hashRefreshToken(refreshRaw);

        // Cap concurrent refresh tokens per user (oldest revoked first).
        long active = refreshTokenRepository.countByUserAndRevokedFalse(user);
        int max = jwtService.properties().maxRefreshTokensPerUser();
        if (active >= max) {
            refreshTokenRepository.revokeAllForUser(user, Instant.now());
        }

        RefreshToken token = RefreshToken.builder()
                .user(user)
                .tokenHash(refreshHash)
                .expiresAt(jwtService.refreshTokenExpiry())
                .userAgent(truncate(userAgent, 512))
                .ipAddress(truncate(ip, 64))
                .build();
        refreshTokenRepository.save(token);

        long accessTtl = jwtService.properties().accessTokenTtl().getSeconds();
        long refreshTtl = jwtService.properties().refreshTokenTtl().getSeconds();

        return new AuthTokens(
                "Bearer",
                access,
                accessTtl,
                refreshRaw,
                refreshTtl,
                describe(user)
        );
    }

    private String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() <= max ? value : value.substring(0, max);
    }
}
