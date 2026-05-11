package com.lunerie.api.application.audit;

import com.lunerie.api.domain.audit.AuditEvent;
import com.lunerie.api.domain.audit.AuditEventRepository;
import com.lunerie.api.domain.user.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditEventRepository repository;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(String eventType, User actor, String targetType, String targetId, Map<String, Object> payload) {
        try {
            var http = currentRequest();
            AuditEvent event = AuditEvent.builder()
                    .eventType(eventType)
                    .actorId(actor != null ? actor.getId() : null)
                    .actorEmail(actor != null ? actor.getEmail() : null)
                    .targetType(targetType)
                    .targetId(targetId)
                    .requestId(MDC.get("requestId"))
                    .ipAddress(http != null ? clientIp(http) : null)
                    .userAgent(http != null ? truncate(http.getHeader("User-Agent"), 512) : null)
                    .payload(payload != null ? payload : Map.of())
                    .createdAt(Instant.now())
                    .build();
            repository.save(event);
            log.info("audit.recorded event_type={} actor_id={} target_type={} target_id={}",
                    eventType,
                    actor != null ? actor.getId() : "anonymous",
                    targetType != null ? targetType : "-",
                    targetId != null ? targetId : "-");
        } catch (Exception ex) {
            // Audit must never break business flows
            log.warn("audit.failed event_type={} actor_id={} reason={}",
                    eventType,
                    actor != null ? actor.getId() : "anonymous",
                    ex.getMessage());
        }
    }

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordSimple(String eventType, User actor) {
        record(eventType, actor, null, null, new HashMap<>());
    }

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordTarget(String eventType, User actor, String targetType, UUID targetId) {
        record(eventType, actor, targetType, targetId == null ? null : targetId.toString(), new HashMap<>());
    }

    private static HttpServletRequest currentRequest() {
        var attributes = RequestContextHolder.getRequestAttributes();
        if (attributes instanceof ServletRequestAttributes sra) {
            return sra.getRequest();
        }
        return null;
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() <= max ? value : value.substring(0, max);
    }
}
