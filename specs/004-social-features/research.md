# Research: Social Features
**Feature**: 004 | **Date**: 2026-04-18

## Decision Log

### 1. Like Count Storage: Denormalized vs Join Count
- **Decision**: **Denormalized** — `Spot.likeCount` integer column updated atomically with `UPDATE spots SET like_count = like_count + 1 WHERE id = ?`.
- **Rationale**: Avoids `COUNT(*)` on SpotLike table on every card render. Atomic SQL increment prevents race conditions without application-level locking.
- **Alternatives**: COUNT query on SpotLike (slow at scale), Redis sorted set (adds Redis dependency for a simple counter).

### 2. Hot Spots Leaderboard Refresh
- **Decision**: Redis cache key `leaderboard:hot` with TTL 3600s (1 hour). Cache warmed on first request after expiry.
- **Rationale**: Hot Spots don't need real-time accuracy. 1-hour staleness is acceptable and eliminates expensive ORDER BY like_count queries on every page load.

### 3. Following Feed Query
- **Decision**: `SELECT s.* FROM spots s JOIN follows f ON s.user_id = f.followee_id WHERE f.follower_id = ? ORDER BY s.created_at DESC LIMIT 50`
- **Rationale**: Simple JOIN query, no denormalization needed for Phase 3 scale. Add composite index `(followee_id)` on follows table.

### 4. Public Profile URL Scheme
- **Decision**: `/u/{username}` — username is unique in the User table.
- **Rationale**: Human-readable, shareable, consistent with common social platform conventions.
