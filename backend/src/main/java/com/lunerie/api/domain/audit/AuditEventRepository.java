package com.lunerie.api.domain.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {

    Page<AuditEvent> findByEventTypeOrderByCreatedAtDesc(String eventType, Pageable pageable);

    Page<AuditEvent> findByActorIdOrderByCreatedAtDesc(UUID actorId, Pageable pageable);

    Page<AuditEvent> findByCreatedAtAfterOrderByCreatedAtDesc(Instant cutoff, Pageable pageable);

    /** GDPR Art. 15 — return everything tied to one actor. */
    List<AuditEvent> findByActorIdOrderByCreatedAtAsc(UUID actorId);

    @Modifying
    @Query("delete from AuditEvent a where a.createdAt < :cutoff")
    long deleteByCreatedAtBefore(@Param("cutoff") Instant cutoff);
}
