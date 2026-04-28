# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Favorite Spots Knowledge Graph** (brand name: **Curator** / **Vivid Atlas**) — a mobile-first web app where users paste any URL (Instagram, TikTok, Google Maps, etc.) and the system auto-parses spot details via AI, stores them in PostgreSQL + Neo4j, and visualizes relationships as an interactive knowledge graph.

Core flow: User pastes URL → Jsoup (OG tags) + Claude API fallback → PostgreSQL + Neo4j sync → card wall or knowledge graph.

## Development Commands

### Full stack (Docker)
```bash
docker compose up -d                                          # start all 5 services
docker compose build backend && docker compose up -d backend  # rebuild backend only
docker compose build frontend && docker compose up -d frontend # rebuild frontend only
docker compose logs -f backend                                # tail backend logs
```

### Backend (local)
```bash
cd backend
mvn spring-boot:run           # requires local postgres/redis/neo4j
mvn package -DskipTests       # build JAR
mvn test                      # run all tests
mvn test -Dtest=ClassName     # run single test class
```

### Frontend (local)
```bash
cd frontend
npm install && npm run dev    # dev server on :3000
npm run build                 # production build
npm run test:ci               # jest (no watch)
```

## Services

| Service | Port | Notes |
|---------|------|-------|
| postgres | 5432 | primary store, Flyway-managed schema |
| redis | 6379 | link parse cache, key = `parse:<SHA-256(url)>`, 24h TTL |
| neo4j | 7474 / 7687 | graph store; browser at localhost:7474 (neo4j / favoritespot) |
| backend | 8080 | Spring Boot 3.4.4 / Java 21 |
| frontend | 3000 | Next.js 14 App Router |

## Backend Architecture

**Package root**: `com.favoritespot`

| Package | Contents |
|---------|----------|
| `auth/` | JWT HttpOnly cookie auth; `AuthService` implements `UserDetailsService`; userId (UUID) stored as Spring Security username |
| `spot/` | CRUD; `SpotService` owns dual-store wiring — calls `GraphSyncService` after every PostgreSQL save/delete |
| `graph/node/` | Neo4j `@Node` entities: `SpotNode`, `TagNode`, `CityNode` |
| `graph/repository/` | `SpotNodeRepository` — custom Cypher `@Query` methods |
| `graph/service/` | `GraphSyncService` (write, best-effort), `GraphQueryService` (read) |
| `graph/controller/` | `GraphController` — `/api/graph/*` endpoints |
| `graph/dto/` | `GraphData` record (nodes + edges) |
| `parser/` | Two-stage URL parser: Jsoup OG tags → Claude API fallback; `ParseCacheService` wraps Redis |
| `tag/` | `Tag` entity + `TagRepository` |
| `config/` | See below |

**Config classes and why they exist**:
- `PasswordConfig` — `PasswordEncoder` bean lives here, **not** in `SecurityConfig`, to break the circular dependency: `SecurityConfig → JwtAuthFilter → AuthService → PasswordEncoder → SecurityConfig`
- `Neo4jConfig` — explicitly scopes `@EnableJpaRepositories` (auth/spot/tag) and `@EnableNeo4jRepositories` (graph.repository) because both Spring Data modules are on the classpath and would otherwise conflict
- `CorsConfig` — allows `localhost:3000` with credentials (`withCredentials: true` from frontend)
- `SecurityConfig` — stateless JWT, permits `/api/auth/**` and `GET /api/public/**`

**Dual-store invariants**:
- Neo4j sync is **best-effort**: all exceptions in `GraphSyncService` are caught and logged as WARN, never rethrown — a Neo4j outage must not break CRUD
- Graph queries are max **2 hops** — enforced in all Cypher
- `User.isPublic` and `User.createdAt` require `@Builder.Default` — Lombok `@Builder` ignores field initializers without it

**Database**:
- Flyway migrations: `V1__create_users` → `V2__create_spots` → `V3__create_tags` → `V4__create_spot_sources`
- `jpa.ddl-auto: validate` — schema changes require new migration files
- Neo4j indexes created automatically via `spring.data.neo4j.schema-generate: create`

**API endpoints**:
```
POST   /api/auth/register|login|logout
GET    /api/auth/me
POST   /api/parse
GET    /api/spots          ?category=&status=&city=&page=&size=
POST   /api/spots
GET|PUT|DELETE /api/spots/{id}
PATCH  /api/spots/{id}/status
GET    /api/graph/spot/{id}      # 2-hop graph for one spot
GET    /api/graph/user           # full collection graph
GET    /api/graph/related/{id}   # up to 5 ranked related spots
```

## Frontend Architecture

**Next.js 14 App Router** with `output: 'standalone'` (required for Docker multi-stage build).

**Critical**: `NEXT_PUBLIC_*` vars are **build-time baked-in** — pass them as Docker build `args`, not runtime `environment`. See `docker-compose.yml`.

**Routes**:
- `(auth)/login` + `(auth)/register` — auth (route group, no shared layout)
- `feed/` — card wall with category/status filter chips, pagination
- `spots/new/` — 3-step flow: URL input → parse preview (`ParsePreview.tsx`) → manual fallback
- `spots/[id]/` — detail: status toggle, 1-5 rating, note edit, related spots, delete
- `spots/[id]/graph/` — single-spot knowledge graph
- `graph/` — full collection Knowledge Graph Explorer

**Key type notes** (`lib/types.ts`):
- `Spot.tags` is `string[]` (tag names), not `Tag[]`
- `SpotListResponse.number` is the current page index (Spring's `Page<T>` uses `number`, not `page`)
- `UpdateSpotRequest` is separate from `CreateSpotRequest`

**API client** (`lib/api.ts`):
- Axios with `withCredentials: true`
- All methods return `.then(r => r.data)` — consumers get typed data directly
- Exports: `authApi`, `spotsApi`, `graphApi`

**GraphCanvas** (`components/GraphCanvas.tsx`):
- `use client`, dynamically imported with `ssr: false`
- Uses plain arrays (not `DataSet`) passed to vis-network `Network` to avoid TypeScript type conflicts
- Category-color-coded nodes, per-relationship-type edge colors

## Design System (Vivid Atlas)

- **No 1px borders** for section separation — use background color shifts between surface tiers
- **Colors**: Primary `#4b3fe2` (Electric Indigo), Surface `#f5f6f7`, On-Surface `#2c2f30`
- **Fonts**: `font-headline` = Plus Jakarta Sans; `font-body` / `font-label` = Manrope
- **Cards**: `rounded-2xl` (1.5rem), full-bleed images, no dividers inside
- **Buttons**: `rounded-full`, primary = indigo gradient 135°
- **Graph nodes**: `#4b3fe2` fill, `#9895ff` at 20% opacity outer glow

## Active Specs

| File | Status |
|------|--------|
| `specs/001-mvp-core/plan.md` | ✅ Done |
| `specs/002-knowledge-graph/plan.md` | ✅ Done |
| `specs/003-map-ai-recommendations/plan.md` | ⬜ Pending |
| `specs/004-social-features/plan.md` | ⬜ Pending |
| `specs/005-photos-collections/plan.md` | ⬜ Pending |
| `specs/006-chrome-linebot-i18n/plan.md` | ⬜ Pending |

Read the relevant `plan.md` before starting any spec implementation.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan.

Active specs (in implementation order):
- specs/001-mvp-core/plan.md          — Phase 1: Auth + Spot CRUD + Link Parser + Card Feed
- specs/002-knowledge-graph/plan.md   — Phase 2: Neo4j dual-store + Graph API + vis.js visualization
- specs/003-map-ai-recommendations/plan.md — Phase 3a: Map View (Google Maps) + AI Recommendations
- specs/004-social-features/plan.md   — Phase 3b: Follow, Likes, Hot Spots, Public Profiles
- specs/005-photos-collections/plan.md — Phase 3c: Photo Upload (S3) + Thematic Collections
- specs/006-chrome-linebot-i18n/plan.md — Phase 4: Chrome Extension + LINE Bot + i18n (zh-TW/en/ja)
<!-- SPECKIT END -->
