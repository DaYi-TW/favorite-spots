# Research: MVP Core

**Feature**: 001-mvp-core
**Date**: 2026-04-18

## Decision Log

### 1. JWT Storage Strategy

- **Decision**: Store JWT in `HttpOnly` cookie (not localStorage)
- **Rationale**: Prevents XSS token theft. Since the app is same-origin (Next.js frontend calls Spring Boot API via proxy or CORS), HttpOnly cookies work cleanly.
- **Alternatives considered**: `Authorization: Bearer` header stored in memory (requires token re-fetch on refresh), localStorage (XSS risk).

### 2. Link Parsing Architecture

- **Decision**: `LinkParserService` with two-stage pipeline — Jsoup first, Claude API if Jsoup yields insufficient data (name + address both empty)
- **Rationale**: Jsoup is synchronous, free, and fast for pages with Open Graph tags. Claude API handles the long tail of unstructured pages and non-English content. Separating them as two stages with a clear "sufficient?" check keeps costs down.
- **Alternatives considered**: Single Claude API call with raw HTML (too expensive, slow); Playwright headless browser (unnecessary complexity for Phase 1).

### 3. Redis Cache Key

- **Decision**: Normalize URL before caching: lowercase scheme+host+path, strip UTM params and trailing slash. Key = `parse:<sha256-of-normalized-url>`.
- **Rationale**: Same physical page can have multiple URLs (tracking params, http vs https). Normalization maximizes cache hit rate.
- **Alternatives considered**: Raw URL as key (too many misses), content hash (requires fetching before checking cache).

### 4. Category and Status as Java Enums

- **Decision**: `SpotCategory` and `SpotStatus` stored as `@Enumerated(EnumType.STRING)` in PostgreSQL.
- **Rationale**: String enums survive column reordering and are readable in SQL. Easy to extend without migration.
- **Alternatives considered**: Integer enum (harder to debug in DB), separate lookup table (over-engineering for Phase 1).

### 5. Next.js App Router vs Pages Router

- **Decision**: App Router (Next.js 14)
- **Rationale**: Server Components reduce client bundle size for card grids. `use client` boundary can be applied only to interactive components (FilterBar, ParsePreview). Better aligned with Next.js roadmap.
- **Alternatives considered**: Pages Router (more familiar, but legacy path).

### 6. Tailwind Token Strategy

- **Decision**: Copy the `tailwind.config` block from `stitch_favorite_spot_knowledge_graph/home_discovery/code.html` directly into `frontend/tailwind.config.ts` as the single source of truth for design tokens.
- **Rationale**: The mockup HTML already has the full Vivid Atlas token set validated against the design system. Re-deriving it would risk drift.
- **Alternatives considered**: CSS variables only (loses Tailwind's utility-class DX), shadcn/ui component library (conflicts with Vivid Atlas no-border and tonal layering rules).

### 7. Flyway for DB Migrations

- **Decision**: Flyway with versioned SQL migrations under `backend/src/main/resources/db/migration/`.
- **Rationale**: Deterministic, reversible, works natively with Spring Boot auto-configuration.
- **Alternatives considered**: Liquibase (XML-heavy, overkill for Phase 1), Hibernate `ddl-auto=update` (dangerous in production).

### 8. Cover Image Handling

- **Decision**: Store scraped cover image as external URL string only. No upload, no proxy in Phase 1.
- **Rationale**: Keeps Phase 1 scope minimal. If the external URL breaks, the card degrades gracefully with a placeholder.
- **Alternatives considered**: Server-side image proxy (adds complexity), S3 upload (Phase 3 scope).
