# Data Model: MVP Core

**Feature**: 001-mvp-core
**Date**: 2026-04-18

## PostgreSQL Entities

### User

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| username | VARCHAR(100) | UNIQUE, NOT NULL |
| is_public | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() |

**Rules**: Email must be valid format. Password stored as bcrypt hash. Username 3–50 chars, alphanumeric + underscore.

---

### Spot

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| user_id | UUID | FK → users.id, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| address | TEXT | nullable |
| city | VARCHAR(100) | nullable (auto-parsed from address) |
| category | VARCHAR(50) | NOT NULL (ENUM: RESTAURANT, CAFE, DESSERT, ATTRACTION, HOTEL, BAR) |
| status | VARCHAR(20) | NOT NULL DEFAULT 'WANT_TO_GO' (ENUM: WANT_TO_GO, VISITED) |
| cover_image_url | TEXT | nullable |
| personal_rating | SMALLINT | nullable, CHECK 1–5 |
| personal_note | TEXT | nullable |
| is_public | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() |

**Indexes**: `(user_id)`, `(user_id, category)`, `(user_id, status)`, `(user_id, city)`

---

### SpotSource

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| spot_id | UUID | FK → spots.id ON DELETE CASCADE |
| source_type | VARCHAR(20) | ENUM: INSTAGRAM, TIKTOK, YOUTUBE, GOOGLE_MAP, BLOG |
| url | TEXT | NOT NULL |
| parsed_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() |

---

### Tag

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| name | VARCHAR(100) | UNIQUE, NOT NULL |
| type | VARCHAR(20) | ENUM: STYLE, CUSTOM |

---

### SpotTag (Join Table)

| Field | Type | Constraints |
|-------|------|-------------|
| spot_id | UUID | FK → spots.id ON DELETE CASCADE |
| tag_id | UUID | FK → tags.id ON DELETE CASCADE |
| PRIMARY KEY | (spot_id, tag_id) | |

---

### ParseCache

| Field | Type | Constraints |
|-------|------|-------------|
| cache_key | VARCHAR(64) | PK (SHA-256 of normalized URL) |
| result_json | TEXT | NOT NULL (JSON blob of ParseResult) |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() |

> Stored in **Redis** as `parse:<cache_key>` with TTL 86400s (24h). The PostgreSQL table is optional and only used if Redis is unavailable as a fallback.

---

## State Transitions

### Spot.status

```
WANT_TO_GO ←──────→ VISITED
```

User can toggle freely in either direction via `PATCH /api/spots/{id}/status`.

---

## TypeScript Types (frontend/lib/types.ts)

```typescript
export type SpotCategory = 'RESTAURANT' | 'CAFE' | 'DESSERT' | 'ATTRACTION' | 'HOTEL' | 'BAR';
export type SpotStatus = 'WANT_TO_GO' | 'VISITED';
export type SourceType = 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'GOOGLE_MAP' | 'BLOG';
export type TagType = 'STYLE' | 'CUSTOM';

export interface Tag {
  id: string;
  name: string;
  type: TagType;
}

export interface SpotSource {
  id: string;
  sourceType: SourceType;
  url: string;
  parsedAt: string;
}

export interface Spot {
  id: string;
  name: string;
  address?: string;
  city?: string;
  category: SpotCategory;
  status: SpotStatus;
  coverImageUrl?: string;
  personalRating?: number;
  personalNote?: string;
  isPublic: boolean;
  tags: Tag[];
  sources: SpotSource[];
  createdAt: string;
  updatedAt: string;
}

export interface ParseResult {
  name?: string;
  address?: string;
  city?: string;
  category?: SpotCategory;
  coverImageUrl?: string;
  suggestedTags: string[];
  sourceType: SourceType;
  originalUrl: string;
  fromCache: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}
```
