package com.lunerie.api.application.verification;

import com.lunerie.api.common.BadRequestException;
import com.lunerie.api.domain.user.User;
import com.lunerie.api.domain.user.UserRepository;
import com.lunerie.api.domain.verification.EmailVerificationToken;
import com.lunerie.api.domain.verification.EmailVerificationTokenRepository;
import com.lunerie.api.domain.verification.PasswordResetToken;
import com.lunerie.api.domain.verification.PasswordResetTokenRepository;
import com.lunerie.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationService {

    private static final Duration EMAIL_VERIFICATION_TTL = Duration.ofHours(24);
    private static final Duration PASSWORD_RESET_TTL = Duration.ofMinutes(30);

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository emailRepo;
    private final PasswordResetTokenRepository resetRepo;
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /* ---------- Email verification --------------------------------------- */

    @Transactional
    public void sendVerificationEmail(User user) {
        if (user.getEmailVerifiedAt() != null) return;
        String raw = jwtService.generateRefreshTokenRaw();
        String hash = jwtService.hashRefreshToken(raw);
        emailRepo.save(EmailVerificationToken.builder()
                .user(user)
                .tokenHash(hash)
                .expiresAt(Instant.now().plus(EMAIL_VERIFICATION_TTL))
                .build());
        mailService.sendVerification(user.getEmail(), raw);
    }

    @Transactional
    public void verifyEmail(String rawToken) {
        EmailVerificationToken token = emailRepo.findByTokenHash(jwtService.hashRefreshToken(rawToken))
                .orElseThrow(() -> new BadRequestException("Verification link is invalid"));
        if (token.getConsumedAt() != null) {
            throw new BadRequestException("Verification link already used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Verification link expired");
        }
        token.getUser().setEmailVerifiedAt(Instant.now());
        token.setConsumedAt(Instant.now());
    }

    /* ---------- Password reset ------------------------------------------- */

    @Transactional
    public void requestPasswordReset(String email, String userAgent, String ip) {
        // Always succeed silently to avoid leaking which emails are registered.
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            String raw = jwtService.generateRefreshTokenRaw();
            String hash = jwtService.hashRefreshToken(raw);
            resetRepo.save(PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(hash)
                    .expiresAt(Instant.now().plus(PASSWORD_RESET_TTL))
                    .userAgent(truncate(userAgent, 512))
                    .ipAddress(truncate(ip, 64))
                    .build());
            mailService.sendPasswordReset(user.getEmail(), raw);
        });
    }

    @Transactional
    public void completePasswordReset(String rawToken, String newPassword) {
        PasswordResetToken token = resetRepo.findByTokenHash(jwtService.hashRefreshToken(rawToken))
                .orElseThrow(() -> new BadRequestException("Reset link is invalid"));
        if (token.getConsumedAt() != null) {
            throw new BadRequestException("Reset link already used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Reset link expired");
        }
        token.getUser().setPasswordHash(passwordEncoder.encode(newPassword));
        token.setConsumedAt(Instant.now());
    }

    /* ---------- Cleanup -------------------------------------------------- */

    @Transactional
    @Scheduled(cron = "${lunerie.security.verification-cleanup-cron:0 15 * * * *}")
    public void purge() {
        Instant now = Instant.now();
        int e = emailRepo.purgeStale(now);
        int p = resetRepo.purgeStale(now);
        if (e + p > 0) log.info("verification.purge email={} reset={}", e, p);
    }

    private static String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() <= max ? value : value.substring(0, max);
    }
}
