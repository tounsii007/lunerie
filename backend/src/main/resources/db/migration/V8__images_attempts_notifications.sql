-- =========================================================================
-- Lunerie API · V8 · richer image model + login attempts + notifications
-- =========================================================================

-- ---------------------------------------------------------------------------
-- Place images (replaces the old place_gallery (place_id, image_url) table)
-- ---------------------------------------------------------------------------

CREATE TABLE place_images (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id        UUID         NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    url             VARCHAR(1024) NOT NULL,
    alt             VARCHAR(256),
    photographer    VARCHAR(200),
    source          VARCHAR(32),
    width           INTEGER,
    height          INTEGER,
    sort_order      INTEGER      NOT NULL DEFAULT 0,
    is_hero         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    version         BIGINT       NOT NULL DEFAULT 0
);
CREATE INDEX idx_place_images_place      ON place_images (place_id);
CREATE INDEX idx_place_images_place_sort ON place_images (place_id, sort_order);
CREATE UNIQUE INDEX idx_place_images_one_hero
    ON place_images (place_id) WHERE is_hero = TRUE;

-- Backfill from the legacy place_gallery + place hero_image_* fields
INSERT INTO place_images (place_id, url, alt, photographer, source, sort_order, is_hero)
SELECT p.id, p.hero_image_url, p.hero_image_alt, p.hero_image_photographer, p.hero_image_source, 0, TRUE
FROM places p
WHERE p.hero_image_url IS NOT NULL;

INSERT INTO place_images (place_id, url, sort_order, is_hero)
SELECT g.place_id, g.image_url, ROW_NUMBER() OVER (PARTITION BY g.place_id ORDER BY g.image_url), FALSE
FROM place_gallery g;

DROP TABLE IF EXISTS place_gallery;

-- ---------------------------------------------------------------------------
-- Login attempts (failed logins for soft lockout / forensics)
-- ---------------------------------------------------------------------------

CREATE TABLE login_attempts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(254),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    successful  BOOLEAN     NOT NULL,
    ip_address  VARCHAR(64),
    user_agent  VARCHAR(512),
    failure_reason VARCHAR(64),
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_login_attempts_email_attempted ON login_attempts (LOWER(email), attempted_at DESC);
CREATE INDEX idx_login_attempts_user_attempted  ON login_attempts (user_id, attempted_at DESC);
CREATE INDEX idx_login_attempts_attempted_at    ON login_attempts (attempted_at);

-- ---------------------------------------------------------------------------
-- Notifications (in-app, future push integration)
-- ---------------------------------------------------------------------------

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(48)  NOT NULL,
    title       VARCHAR(200) NOT NULL,
    body        VARCHAR(2000),
    payload     JSONB,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    version     BIGINT       NOT NULL DEFAULT 0
);
CREATE INDEX idx_notifications_user_created ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread  ON notifications (user_id) WHERE read_at IS NULL;
