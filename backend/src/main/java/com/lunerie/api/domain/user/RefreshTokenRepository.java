package com.lunerie.api.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    long countByUserAndRevokedFalse(User user);

    @Modifying
    @Query("update RefreshToken r set r.revoked = true, r.revokedAt = :now where r.user = :user and r.revoked = false")
    int revokeAllForUser(@Param("user") User user, @Param("now") Instant now);

    @Modifying
    @Query("delete from RefreshToken r where r.expiresAt < :cutoff or r.revoked = true")
    int purgeExpiredAndRevoked(@Param("cutoff") Instant cutoff);
}
