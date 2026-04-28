CREATE TABLE spots (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name             VARCHAR(255) NOT NULL,
    address          TEXT,
    city             VARCHAR(100),
    category         VARCHAR(50)  NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'WANT_TO_GO',
    cover_image_url  TEXT,
    personal_rating  SMALLINT     CHECK (personal_rating BETWEEN 1 AND 5),
    personal_note    TEXT,
    is_public        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_spots_user_id          ON spots(user_id);
CREATE INDEX idx_spots_user_category    ON spots(user_id, category);
CREATE INDEX idx_spots_user_status      ON spots(user_id, status);
CREATE INDEX idx_spots_user_city        ON spots(user_id, city);
