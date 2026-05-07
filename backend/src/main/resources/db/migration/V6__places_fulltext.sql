-- =========================================================================
-- Lunerie API · V6 · full-text search on places
-- =========================================================================

-- Generated tsvector column derived from name/description/city/region
ALTER TABLE places
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce(name, '')),        'A') ||
        setweight(to_tsvector('simple', coalesce(city, '')),        'B') ||
        setweight(to_tsvector('simple', coalesce(region, '')),      'C') ||
        setweight(to_tsvector('simple', coalesce(description, '')), 'D')
    ) STORED;

CREATE INDEX idx_places_search_vector ON places USING gin (search_vector);

-- Trigram extension + indexes power "ILIKE %x%" autocomplete
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_places_name_trgm        ON places USING gin (name        gin_trgm_ops);
CREATE INDEX idx_places_city_trgm        ON places USING gin (city        gin_trgm_ops);
CREATE INDEX idx_places_description_trgm ON places USING gin (description gin_trgm_ops);
