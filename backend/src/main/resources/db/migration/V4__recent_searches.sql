-- =========================================================================
-- Lunerie API · V4 · recent searches
-- =========================================================================

CREATE TABLE recent_searches (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query        VARCHAR(200) NOT NULL,
    normalized   VARCHAR(200) NOT NULL,
    searched_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    result_count INTEGER,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    version      BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT uq_recent_searches_user_normalized UNIQUE (user_id, normalized)
);
CREATE INDEX idx_recent_searches_user             ON recent_searches (user_id);
CREATE INDEX idx_recent_searches_user_searched_at ON recent_searches (user_id, searched_at DESC);
CREATE INDEX idx_recent_searches_searched_at      ON recent_searches (searched_at);
