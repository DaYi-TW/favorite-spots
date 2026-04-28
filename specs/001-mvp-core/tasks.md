# Tasks: MVP Core

**Input**: `specs/001-mvp-core/` (plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md)
**Branch**: `001-mvp-core`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup

**Purpose**: Project scaffolding and shared infrastructure

- [ ] T001 Initialize Spring Boot 3 project with Maven in `backend/` (dependencies: Spring Web, Spring Security, Spring Data JPA, Flyway, Spring Data Redis, Lombok, Jsoup, Anthropic Java SDK)
- [ ] T002 Initialize Next.js 14 App Router project with TypeScript in `frontend/`
- [ ] T003 [P] Copy Vivid Atlas Tailwind token config from `stitch_favorite_spot_knowledge_graph/home_discovery/code.html` into `frontend/tailwind.config.ts`
- [ ] T004 [P] Add Google Fonts (Plus Jakarta Sans + Manrope) to `frontend/app/layout.tsx`
- [ ] T005 Create `docker-compose.yml` at repo root with services: postgres:16, redis:7, backend, frontend
- [ ] T006 [P] Create `backend/src/main/resources/application.yml` with datasource, Redis, JWT, and Anthropic API key config
- [ ] T007 [P] Create `frontend/.env.local` with `NEXT_PUBLIC_API_BASE_URL`
- [ ] T008 [P] Create `frontend/lib/types.ts` with TypeScript types from data-model.md (Spot, Tag, SpotSource, ParseResult, AuthUser, SpotCategory, SpotStatus, SourceType, TagType)
- [ ] T009 [P] Create `frontend/lib/api.ts` with Axios instance and HttpOnly cookie passthrough

---

## Phase 2: Foundational (Blocks All User Stories)

**Purpose**: Database schema, security config, and shared backend infrastructure

⚠️ **CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 Create Flyway migration `V1__create_users.sql` in `backend/src/main/resources/db/migration/`
- [ ] T011 Create Flyway migration `V2__create_spots.sql` with category + status ENUMs and indexes
- [ ] T012 Create Flyway migration `V3__create_tags.sql` and `V4__create_spot_sources.sql`
- [ ] T013 [P] Create `User` JPA entity in `backend/src/main/java/com/favoritespot/auth/User.java`
- [ ] T014 [P] Create `Spot`, `Tag`, `SpotSource`, `SpotTag` JPA entities in `backend/.../spot/` and `backend/.../tag/`
- [ ] T015 Create `JpaConfig`, `SecurityConfig` (permit `/api/auth/**`, secure all others), `RedisConfig` in `backend/.../config/`
- [ ] T016 Implement `JwtUtil` (generate, validate, extract userId) and `JwtAuthFilter` in `backend/.../auth/`
- [ ] T017 Create `GlobalExceptionHandler` (`@RestControllerAdvice`) in `backend/.../` handling 400, 401, 403, 404, 409

**Checkpoint**: DB schema migrated, Spring Security + JWT filter wired, exceptions handled → user story work can begin

---

## Phase 3: User Story 1 — Register and Log In (Priority: P1) 🎯 MVP

**Goal**: User can create an account and log in; JWT cookie is issued and persists across refreshes.

**Independent Test**: Register at `/register`, log out, log back in at `/login`, refresh — confirm session persists.

### Implementation

- [ ] T018 [P] [US1] Create `UserRepository` (JPA) in `backend/.../auth/UserRepository.java`
- [ ] T019 [P] [US1] Create `AuthService` (register with bcrypt, login, loadUserByUsername) in `backend/.../auth/AuthService.java`
- [ ] T020 [US1] Create `AuthController` (POST `/api/auth/register`, POST `/api/auth/login`, POST `/api/auth/logout`, GET `/api/auth/me`) in `backend/.../auth/AuthController.java`
- [ ] T021 [P] [US1] Create `frontend/app/(auth)/register/page.tsx` — registration form (email, password, username), calls POST `/api/auth/register`
- [ ] T022 [P] [US1] Create `frontend/app/(auth)/login/page.tsx` — login form, calls POST `/api/auth/login`
- [ ] T023 [US1] Create `frontend/components/ui/Button.tsx`, `Input.tsx` primitives following Vivid Atlas spec (pill shape, indigo gradient, scale 0.96 on tap)
- [ ] T024 [US1] Wire auth redirect: unauthenticated users → `/login`; authenticated users on auth pages → `/feed` (Next.js middleware in `frontend/middleware.ts`)

**Checkpoint**: Registration, login, and session persistence fully working end-to-end

---

## Phase 4: User Story 2 — Paste a Link and Save a Spot (Priority: P1) 🎯 MVP

**Goal**: User pastes a URL → parsed preview → save → appears on feed.

**Independent Test**: Paste a Google Maps URL, confirm preview shows name + address + category, save, verify spot appears on `/feed`.

### Implementation

- [ ] T025 [P] [US2] Create `ParseCacheService` (Redis get/set by SHA-256 normalized URL key, TTL 24h) in `backend/.../cache/ParseCacheService.java`
- [ ] T026 [P] [US2] Create `LinkParserService` (Jsoup meta tag extraction → if name+address empty call Claude API → return `ParseResult`) in `backend/.../parser/LinkParserService.java`
- [ ] T027 [US2] Create `ParseController` (POST `/api/parse`) in `backend/.../parser/ParseController.java` — checks cache first, calls `LinkParserService`, stores result in cache
- [ ] T028 [P] [US2] Create `SpotRepository` (JPA + custom queries for filter/search), `TagRepository`, `SpotSourceRepository` in `backend/.../spot/`
- [ ] T029 [P] [US2] Create `SpotService` (createSpot: save Spot + SpotSource + Tags) in `backend/.../spot/SpotService.java`
- [ ] T030 [US2] Create `SpotController` (POST `/api/spots`) in `backend/.../spot/SpotController.java`
- [ ] T031 [P] [US2] Create `frontend/components/ParsePreview.tsx` — displays parsed result fields, allows editing, shows suggested tag chips (accept/dismiss), shows manual form when name+address null
- [ ] T032 [US2] Create `frontend/app/spots/new/page.tsx` — URL input field, calls POST `/api/parse`, shows `ParsePreview`, submits POST `/api/spots`

**Checkpoint**: Full link-paste → parse → save flow works; cached URL returns instantly

---

## Phase 5: User Story 3 — Browse and Filter the Home Feed (Priority: P2)

**Goal**: Saved spots displayed as masonry card grid with category/city/status filters and keyword search.

**Independent Test**: Save 3 spots with different categories; apply category filter; verify only matching spots shown.

### Implementation

- [ ] T033 [US3] Add `GET /api/spots` to `SpotController` with query params: `category`, `status`, `city`, `q`, `page`, `size` — implement in `SpotService` using JPA Specifications or JPQL
- [ ] T034 [P] [US3] Create `frontend/components/SpotCard.tsx` — cover image (full-bleed, xl radius), spot name (Plus Jakarta Sans bold), category badge, city, status chip; no borders (tonal layering only)
- [ ] T035 [P] [US3] Create `frontend/components/SpotGrid.tsx` — CSS masonry grid (columns-2 on mobile, columns-3 on tablet), maps spots → SpotCard
- [ ] T036 [P] [US3] Create `frontend/components/FilterBar.tsx` — category chips, status toggle, city dropdown, keyword search input; all interactive (`use client`)
- [ ] T037 [US3] Create `frontend/app/feed/page.tsx` — Server Component fetching initial spots, renders `SpotGrid` + `FilterBar`; filter changes trigger client-side re-fetch via `api.ts`
- [ ] T038 [US3] Add empty-state UI to `frontend/app/feed/page.tsx` — shown when user has 0 spots; prompt to add first spot with link to `/spots/new`

**Checkpoint**: Home feed loads, all filters work, empty state displays correctly

---

## Phase 6: User Story 4 — Spot Detail and Status Toggle (Priority: P2)

**Goal**: Full spot detail page with all fields; status toggle between Want to Go / Visited; edit note/rating; delete.

**Independent Test**: Open a spot detail, toggle status to Visited, refresh — confirm status persisted; delete spot — confirm removed from feed.

### Implementation

- [ ] T039 [US4] Add `GET /api/spots/{id}`, `PUT /api/spots/{id}`, `PATCH /api/spots/{id}/status`, `DELETE /api/spots/{id}` to `SpotController` and `SpotService`
- [ ] T040 [P] [US4] Create `frontend/app/spots/[id]/page.tsx` — displays all spot fields (cover image hero, name, address, category, city, tags, status, rating, note, source URLs)
- [ ] T041 [P] [US4] Add status toggle button to spot detail page — calls `PATCH /api/spots/{id}/status`, updates UI optimistically
- [ ] T042 [P] [US4] Add inline edit for `personalNote` and `personalRating` (1–5 star input) — calls `PUT /api/spots/{id}` on save
- [ ] T043 [US4] Add delete button with confirmation modal — calls `DELETE /api/spots/{id}`, redirects to `/feed` on success

**Checkpoint**: All spot CRUD operations work end-to-end; status toggle persists

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T044 [P] Add loading skeletons to SpotGrid (card placeholders while fetching) in `frontend/components/SpotCard.tsx`
- [ ] T045 [P] Add error boundary and toast notification system to `frontend/app/layout.tsx`
- [ ] T046 [P] Implement cover image fallback placeholder in `SpotCard.tsx` when `coverImageUrl` is null or broken
- [ ] T047 Add `PATCH /api/spots/{id}/status` 400 validation test in `backend/src/test/java/com/favoritespot/spot/SpotControllerTest.java`
- [ ] T048 [P] Write `LinkParserServiceTest` covering: cached URL hit, Jsoup-only success, Claude API fallback, total failure → null result in `backend/src/test/java/com/favoritespot/parser/`
- [ ] T049 Run `quickstart.md` end-to-end validation: `docker compose up --build`, register, add spot via URL, filter feed, toggle status
- [ ] T050 [P] Update `CLAUDE.md` with actual build/test commands from `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T001–T009 mostly parallel
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks all user stories; T010–T017 must complete first
- **US1 (Phase 3)**: Depends on Phase 2 only
- **US2 (Phase 4)**: Depends on Phase 2 only — can run in parallel with US1 after Phase 2
- **US3 (Phase 5)**: Depends on Phase 2 + US2 (needs saved spots to filter)
- **US4 (Phase 6)**: Depends on Phase 2 + US2 (needs saved spots to view/edit)
- **Polish (Phase 7)**: Depends on all story phases

### Parallel Opportunities

```bash
# Phase 1 — run all in parallel:
T001 (backend scaffold) | T002 (frontend scaffold) | T005 (docker-compose)

# Phase 2 — migrations first, then parallel:
T010 → T011 → T012 (sequential migrations)
T013 | T014 (entities in parallel once migrations done)
T015 → T016 → T017 (security config chain)

# Phase 3 — after Phase 2:
T018 | T019 (repository + service in parallel)
T021 | T022 | T023 (frontend auth pages + UI primitives in parallel)

# Phase 4 — after Phase 2 (parallel with Phase 3):
T025 | T026 (cache service + parser in parallel)
T028 | T029 (spot repository + service in parallel)
T031 (ParsePreview component, independent)
```

---

## Implementation Strategy

### MVP First (US1 + US2 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Auth) — test independently
4. Complete Phase 4: US2 (Parse + Save) — test independently
5. **Stop and demo**: User can register, paste a link, and save a spot ✅

### Incremental Delivery

1. Setup + Foundational → infrastructure ready
2. + US1 → auth works (demo: register + login)
3. + US2 → core value prop works (demo: paste → parse → save)
4. + US3 → discovery works (demo: browse + filter feed)
5. + US4 → full CRUD works (demo: detail + toggle + edit + delete)
6. + Polish → production-ready MVP

---

## Notes

- [P] = different files, no dependencies on incomplete tasks
- [USN] maps to user story N from spec.md
- All backend file paths use `com/favoritespot/` as the base package
- Constitution Principle IV: every frontend component must use Vivid Atlas tokens — no hardcoded colors
- Constitution Principle I: `ParsePreview` must show the manual form only when both `name` and `address` are null
