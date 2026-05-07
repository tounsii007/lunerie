package com.lunerie.api.domain.login;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, UUID> {

    @Query("""
            select count(a) from LoginAttempt a
            where lower(a.email) = lower(:email)
              and a.successful = false
              and a.attemptedAt >= :since
            """)
    long countRecentFailures(@Param("email") String email, @Param("since") Instant since);

    @Modifying
    @Query("delete from LoginAttempt a where a.attemptedAt < :cutoff")
    long purgeOlderThan(@Param("cutoff") Instant cutoff);
}
