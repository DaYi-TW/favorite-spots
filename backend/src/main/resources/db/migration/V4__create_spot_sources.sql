CREATE TABLE spot_sources (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id     UUID        NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
    source_type VARCHAR(20) NOT NULL,
    url         TEXT        NOT NULL,
    parsed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
