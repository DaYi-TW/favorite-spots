# Research: Photo Upload + Thematic Collections
**Feature**: 005 | **Date**: 2026-04-18

## Decision Log

### 1. Cloud Storage: AWS S3 vs Cloudflare R2
- **Decision**: **Cloudflare R2** (default), configurable to any S3-compatible storage via environment variables.
- **Rationale**: R2 has no egress fees (important for photo-heavy apps), AWS S3-compatible API means the same AWS SDK v2 works without code changes. Environment variables control the endpoint URL, making it swappable.
- **Alternatives**: AWS S3 (egress costs), local filesystem (not scalable, not Docker-friendly).

### 2. Thumbnail Generation: Server-side vs Client-side
- **Decision**: **Server-side** using Thumbnailator (Java) — generate 400×300 thumbnail on upload, store both original and thumbnail URLs.
- **Rationale**: Client-side resizing is unreliable (quality varies by browser) and increases upload payload. Server-side ensures consistent thumbnail quality.
- **Alternatives**: Client-side Canvas resize (variable quality), Lambda function on S3 event (over-engineering for Phase 3).

### 3. Drag-and-Drop: @dnd-kit vs react-beautiful-dnd
- **Decision**: **@dnd-kit**
- **Rationale**: react-beautiful-dnd is deprecated (maintenance stopped 2022). @dnd-kit is actively maintained, accessible, and has first-class TypeScript support.

### 4. Collection Display Order
- **Decision**: `displayOrder` integer with gaps (e.g., 10, 20, 30). Gaps avoid renumbering all rows on every drag operation; only the moved item's `displayOrder` is updated to the midpoint between neighbors.
- **Rationale**: Midpoint insertion algorithm (LexoRank-lite) prevents O(n) updates on every reorder.
