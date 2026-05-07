-- =========================================================================
-- Lunerie API · V1 · initial schema
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Users + auth
-- ---------------------------------------------------------------------------

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(254) NOT NULL,
    password_hash   VARCHAR(100) NOT NULL,
    display_name    VARCHAR(80)  NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    version         BIGINT       NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX idx_users_email ON users (LOWER(email));

CREATE TABLE user_roles (
    user_id  UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role     VARCHAR(32)  NOT NULL,
    PRIMARY KEY (user_id, role)
);
CREATE INDEX idx_user_roles_user ON user_roles (user_id);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(128) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked     BOOLEAN      NOT NULL DEFAULT FALSE,
    revoked_at  TIMESTAMPTZ,
    user_agent  VARCHAR(512),
    ip_address  VARCHAR(64),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    version     BIGINT       NOT NULL DEFAULT 0
);
CREATE INDEX idx_refresh_tokens_user       ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

-- ---------------------------------------------------------------------------
-- Countries
-- ---------------------------------------------------------------------------

CREATE TABLE countries (
    code            VARCHAR(2)  PRIMARY KEY,
    code3           VARCHAR(3)  NOT NULL UNIQUE,
    name            VARCHAR(120) NOT NULL,
    native_name     VARCHAR(200),
    region          VARCHAR(80)  NOT NULL,
    subregion       VARCHAR(80),
    capital         VARCHAR(120),
    population      BIGINT       NOT NULL DEFAULT 0,
    flag_emoji      VARCHAR(8),
    hero_image_url  VARCHAR(1024),
    hero_image_alt  VARCHAR(256),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    version         BIGINT       NOT NULL DEFAULT 0
);
CREATE INDEX idx_countries_region ON countries (region);

CREATE TABLE country_languages (
    country_code VARCHAR(2)  NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
    language     VARCHAR(80) NOT NULL,
    PRIMARY KEY (country_code, language)
);
CREATE INDEX idx_country_languages_country ON country_languages (country_code);

CREATE TABLE country_currencies (
    country_code VARCHAR(2) NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
    currency     VARCHAR(8) NOT NULL,
    PRIMARY KEY (country_code, currency)
);
CREATE INDEX idx_country_currencies_country ON country_currencies (country_code);

-- ---------------------------------------------------------------------------
-- Places
-- ---------------------------------------------------------------------------

CREATE TABLE places (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                      VARCHAR(200) NOT NULL UNIQUE,
    name                      VARCHAR(200) NOT NULL,
    description               VARCHAR(4000) NOT NULL,
    country_code              VARCHAR(2)   NOT NULL REFERENCES countries(code),
    region                    VARCHAR(80)  NOT NULL,
    city                      VARCHAR(120) NOT NULL,
    latitude                  DOUBLE PRECISION NOT NULL CHECK (latitude  BETWEEN -90  AND 90),
    longitude                 DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    hero_image_url            VARCHAR(1024),
    hero_image_alt            VARCHAR(256),
    hero_image_source         VARCHAR(32),
    hero_image_photographer   VARCHAR(200),
    source_attribution        VARCHAR(400),
    popularity                INT NOT NULL CHECK (popularity BETWEEN 0 AND 100),
    relevance                 INT NOT NULL CHECK (relevance  BETWEEN 0 AND 100),
    has_image                 BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version                   BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_places_country     ON places (country_code);
CREATE INDEX idx_places_popularity  ON places (popularity DESC);
CREATE INDEX idx_places_relevance   ON places (relevance DESC);
CREATE INDEX idx_places_updated_at  ON places (updated_at DESC);
CREATE INDEX idx_places_lat_lon     ON places (latitude, longitude);
CREATE INDEX idx_places_has_image   ON places (has_image);

CREATE TABLE place_categories (
    place_id UUID         NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    category VARCHAR(32)  NOT NULL,
    PRIMARY KEY (place_id, category)
);
CREATE INDEX idx_place_categories_place    ON place_categories (place_id);
CREATE INDEX idx_place_categories_category ON place_categories (category);

CREATE TABLE place_tags (
    place_id UUID        NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    tag      VARCHAR(80) NOT NULL,
    PRIMARY KEY (place_id, tag)
);
CREATE INDEX idx_place_tags_place ON place_tags (place_id);

CREATE TABLE place_gallery (
    place_id  UUID          NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    image_url VARCHAR(1024) NOT NULL,
    PRIMARY KEY (place_id, image_url)
);
CREATE INDEX idx_place_gallery_place ON place_gallery (place_id);

-- ---------------------------------------------------------------------------
-- User preferences
-- ---------------------------------------------------------------------------

CREATE TABLE user_preferences (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    locale                   VARCHAR(8)  NOT NULL DEFAULT 'EN',
    theme_mode               VARCHAR(16) NOT NULL DEFAULT 'DARK',
    accent_color             VARCHAR(16) NOT NULL DEFAULT 'SUNSET',
    background_style         VARCHAR(16) NOT NULL DEFAULT 'AURORA',
    rtl                      BOOLEAN     NOT NULL DEFAULT FALSE,
    reduced_motion           BOOLEAN     NOT NULL DEFAULT FALSE,
    haptic_feedback          BOOLEAN     NOT NULL DEFAULT TRUE,
    onboarding_completed     BOOLEAN     NOT NULL DEFAULT FALSE,
    filter_radius_km         INT         NOT NULL DEFAULT 80 CHECK (filter_radius_km BETWEEN 1 AND 200),
    filter_sort_by           VARCHAR(16) NOT NULL DEFAULT 'RELEVANCE',
    filter_with_image_only   BOOLEAN     NOT NULL DEFAULT TRUE,
    filter_country_code      VARCHAR(3),
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version                  BIGINT      NOT NULL DEFAULT 0
);
CREATE INDEX idx_user_preferences_user ON user_preferences (user_id);

CREATE TABLE user_preferences_categories (
    preferences_id UUID         NOT NULL REFERENCES user_preferences(id) ON DELETE CASCADE,
    category       VARCHAR(32)  NOT NULL,
    PRIMARY KEY (preferences_id, category)
);
CREATE INDEX idx_user_pref_categories_pref ON user_preferences_categories (preferences_id);

-- ---------------------------------------------------------------------------
-- Favorites + recent views
-- ---------------------------------------------------------------------------

CREATE TABLE favorites (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    place_id   UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version    BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_favorites_user_place UNIQUE (user_id, place_id)
);
CREATE INDEX idx_favorites_user        ON favorites (user_id);
CREATE INDEX idx_favorites_place       ON favorites (place_id);
CREATE INDEX idx_favorites_user_created ON favorites (user_id, created_at DESC);

CREATE TABLE recent_views (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    place_id   UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    viewed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version    BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_recent_views_user_place UNIQUE (user_id, place_id)
);
CREATE INDEX idx_recent_views_user            ON recent_views (user_id);
CREATE INDEX idx_recent_views_place           ON recent_views (place_id);
CREATE INDEX idx_recent_views_user_viewed_at  ON recent_views (user_id, viewed_at DESC);
