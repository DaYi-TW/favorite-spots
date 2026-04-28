CREATE TABLE tags (
    id   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20)  NOT NULL
);

CREATE TABLE spot_tags (
    spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
    tag_id  UUID NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (spot_id, tag_id)
);
