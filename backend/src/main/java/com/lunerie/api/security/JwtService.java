package com.lunerie.api.security;

import com.lunerie.api.domain.user.User;
import com.lunerie.api.domain.user.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Date;
import java.util.HexFormat;
import java.util.UUID;

@Slf4j
@Service
public class JwtService {

    private static final String CLAIM_ROLES = "roles";
    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_NAME  = "name";

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        byte[] secretBytes = properties.secret().getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException("lunerie.security.jwt.secret must be at least 32 bytes");
        }
        double entropyBitsPerByte = shannonEntropy(secretBytes);
        if (entropyBitsPerByte < 3.5) {
            throw new IllegalStateException(String.format(
                    "lunerie.security.jwt.secret has too little entropy (%.2f bits/byte; need >= 3.5). " +
                    "Generate a strong secret with `openssl rand -hex 48` and set it via LUNERIE_JWT_SECRET.",
                    entropyBitsPerByte));
        }
        this.signingKey = Keys.hmacShaKeyFor(secretBytes);
    }

    private static double shannonEntropy(byte[] data) {
        int[] counts = new int[256];
        for (byte b : data) counts[b & 0xff]++;
        double entropy = 0.0;
        for (int count : counts) {
            if (count == 0) continue;
            double p = (double) count / data.length;
            entropy -= p * (Math.log(p) / Math.log(2));
        }
        return entropy;
    }

    public String issueAccessToken(User user) {
        Instant now = Instant.now();
        Instant exp = now.plus(properties.accessTokenTtl());
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim(CLAIM_EMAIL, user.getEmail())
                .claim(CLAIM_NAME, user.getDisplayName())
                .claim(CLAIM_ROLES, user.getRoles().stream().map(UserRole::name).toList())
                .issuer(properties.issuer())
                .audience().add(properties.audience()).and()
                .issuedAt(Date.from(now))
                .notBefore(Date.from(now))
                .expiration(Date.from(exp))
                .id(UUID.randomUUID().toString())
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public Claims parseAndValidate(String token) {
        try {
            Jws<Claims> jws = Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(properties.issuer())
                    .requireAudience(properties.audience())
                    .build()
                    .parseSignedClaims(token);
            return jws.getPayload();
        } catch (JwtException ex) {
            log.debug("JWT validation failed: {}", ex.getMessage());
            throw ex;
        }
    }

    /** Generates an opaque random refresh token. The raw value is returned to the client; we store its SHA-256 hash. */
    public String generateRefreshTokenRaw() {
        byte[] bytes = new byte[48];
        new java.security.SecureRandom().nextBytes(bytes);
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hashRefreshToken(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] result = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(result);
        } catch (Exception ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }

    public Instant accessTokenExpiry() {
        return Instant.now().plus(properties.accessTokenTtl());
    }

    public Instant refreshTokenExpiry() {
        return Instant.now().plus(properties.refreshTokenTtl());
    }

    public JwtProperties properties() {
        return properties;
    }
}
