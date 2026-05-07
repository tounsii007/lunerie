-- =========================================================================
-- Lunerie API · V5 · audit log
-- =========================================================================

CREATE TABLE audit_events (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type  VARCHAR(64)  NOT NULL,
    actor_id    UUID,
    actor_email VARCHAR(254),
    target_type VARCHAR(64),
    target_id   VARCHAR(120),
    request_id  VARCHAR(64),
    ip_address  VARCHAR(64),
    user_agent  VARCHAR(512),
    payload     JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_events_event_type ON audit_events (event_type);
CREATE INDEX idx_audit_events_actor      ON audit_events (actor_id);
CREATE INDEX idx_audit_events_created_at ON audit_events (created_at DESC);
CREATE INDEX idx_audit_events_target     ON audit_events (target_type, target_id);
