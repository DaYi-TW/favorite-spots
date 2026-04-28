-- V5: lat/lng on spots
ALTER TABLE spots
    ADD COLUMN IF NOT EXISTS latitude  DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_spots_geo ON spots(latitude, longitude)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- spot photos
CREATE TABLE IF NOT EXISTS spot_photos (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id     UUID        NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
    url         TEXT        NOT NULL,
    filename    VARCHAR(255) NOT NULL,
    size_bytes  BIGINT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_spot_photos_spot ON spot_photos(spot_id);

-- collections
CREATE TABLE IF NOT EXISTS collections (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    is_public   BOOLEAN     NOT NULL DEFAULT FALSE,
    cover_image_url TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);

CREATE TABLE IF NOT EXISTS collection_spots (
    collection_id UUID    NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    spot_id       UUID    NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
    position      INTEGER NOT NULL DEFAULT 0,
    added_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (collection_id, spot_id)
);
CREATE INDEX IF NOT EXISTS idx_cs_collection ON collection_spots(collection_id);
