# Tasks: Knowledge Graph

**Input**: `specs/002-knowledge-graph/` (plan.md, spec.md, data-model.md, contracts/graph.md, research.md, quickstart.md)
**Branch**: `002-knowledge-graph`
**Prerequisite**: Phase 1 MVP (`001-mvp-core`) fully implemented

---

## Phase 1: Setup

- [ ] T001 Add `neo4j:5-community` service to `docker-compose.yml` with Bolt (7687) and Browser (7474) ports
- [ ] T002 Add Spring Data Neo4j dependency to `backend/pom.xml`
- [ ] T003 [P] Add Neo4j connection config to `backend/src/main/resources/application.yml` (uri, username, password)
- [ ] T004 [P] Add `vis-network` npm package to `frontend/package.json`
- [ ] T005 [P] Add `GraphNode`, `GraphEdge`, `GraphData` TypeScript types to `frontend/lib/types.ts`

---

## Phase 2: Foundational (Blocks All User Stories)

⚠️ **CRITICAL**: Neo4j entities, sync service, and index setup must complete before any graph feature works

- [ ] T006 Create `Neo4jConfig.java` in `backend/.../config/` — define index creation beans for `spot_spotId`, `spot_category`, `city_name`
- [ ] T007 [P] Create `SpotNode.java` (`@Node("Spot")`) in `backend/.../graph/node/` with `spotId`, `name`, `category`, `city`, `tags`, `cityNode` fields
- [ ] T008 [P] Create `TagNode.java` (`@Node("Tag")`) and `CityNode.java` (`@Node("City")`) in `backend/.../graph/node/`
- [ ] T009 Create `SpotNodeRepository.java` (Spring Data Neo4j `@Repository`) with custom `@Query` methods: findBySpotId, findGraphUpTo2Hops, findRelated in `backend/.../graph/repository/`
- [ ] T010 Create `GraphSyncService.java` in `backend/.../graph/service/` — methods: `syncSpot(Spot)`, `deleteSpot(String spotId)`, `buildRelationships(SpotNode)` — all wrapped in try/catch (best-effort, never throw)
- [ ] T011 Wire `GraphSyncService.syncSpot()` call into `SpotService.createSpot()` and `SpotService.updateSpot()` after PostgreSQL save (in `backend/.../spot/SpotService.java`)
- [ ] T012 Wire `GraphSyncService.deleteSpot()` call into `SpotService.deleteSpot()` after PostgreSQL delete

**Checkpoint**: Neo4j starts, indexes created, SpotNode synced on every PostgreSQL Spot write

---

## Phase 3: User Story 1 — Spot Graph View (Priority: P1) 🎯

**Goal**: Tap "View in Graph" on a spot detail page → see the spot and connected spots as an interactive graph.

**Independent Test**: Save 3 cafés in Taipei. Open one's detail page, tap "View in Graph." Confirm 3 nodes appear connected with "Same Category" and "Same City" edges. Tap a connected node → navigates to that spot.

- [ ] T013 [US1] Create `GraphQueryService.java` in `backend/.../graph/service/` — method: `getSpotGraph(String spotId, String userId)` executes 2-hop Cypher query, returns `GraphData` DTO
- [ ] T014 [US1] Create `GraphController.java` in `backend/.../graph/controller/` — implement `GET /api/graph/spot/{id}` (ownership check + call `GraphQueryService`)
- [ ] T015 [P] [US1] Create `frontend/components/GraphCanvas.tsx` — `use client` component wrapping vis.js Network; accepts `GraphData` prop; Electric Indigo nodes (`#4b3fe2`) with 20% opacity glow (`#9895ff`); edge labels by relationship type; supports pan, zoom, tap
- [ ] T016 [P] [US1] Create `frontend/components/GraphNodePreview.tsx` — slide-up card shown on node tap; displays cover image, name, category, city, "View Detail" button
- [ ] T017 [US1] Create `frontend/app/spots/[id]/graph/page.tsx` — fetches `GET /api/graph/spot/{id}`, renders `GraphCanvas` + isolated node message when no connections

**Checkpoint**: Single-spot graph view fully interactive end-to-end

---

## Phase 4: User Story 2 — Graph Explorer (Priority: P2)

**Goal**: Full-collection interactive graph with per-relationship-type filter toggles.

**Independent Test**: Save 5 spots mixed categories/cities. Open Graph Explorer — all 5 nodes visible. Toggle off "Same City" — city edges disappear. Click node — preview card appears.

- [ ] T018 [US2] Add `getFullUserGraph(String userId)` to `GraphQueryService.java` — fetches all user's spotIds from PostgreSQL, runs full-graph Cypher, returns `GraphData`
- [ ] T019 [US2] Add `GET /api/graph/user` to `GraphController.java`
- [ ] T020 [P] [US2] Create `frontend/components/GraphFilterBar.tsx` — toggle chips for each relationship type (Same Category, Same City, Similar Style, Same Source); `use client`; filters edges client-side without re-fetching
- [ ] T021 [US2] Create `frontend/app/graph/page.tsx` — fetches `GET /api/graph/user`, renders `GraphCanvas` + `GraphFilterBar` + `GraphNodePreview`; add "Graph" link to main nav

**Checkpoint**: Graph Explorer renders full collection, all filter toggles work

---

## Phase 5: User Story 3 — Related Spot Recommendations (Priority: P2)

**Goal**: "You might also like" section on spot detail page showing up to 5 ranked related spots.

**Independent Test**: Spot A shares category+tag with spot B but only category with spot C. Spot B appears above spot C in A's recommendations.

- [ ] T022 [US3] Add `getRelatedSpots(String spotId, String userId)` to `GraphQueryService.java` — ranked Cypher query, returns up to 5 Spot UUIDs ordered by shared connection count
- [ ] T023 [US3] Add `GET /api/graph/related/{id}` to `GraphController.java` — resolves UUIDs to full Spot objects via `SpotRepository`
- [ ] T024 [US3] Add `RelatedSpots` section to `frontend/app/spots/[id]/page.tsx` — fetches `/api/graph/related/{id}`, renders horizontal scroll of `SpotCard` components; hidden when empty array returned

**Checkpoint**: Recommendations appear on detail page, ranked correctly, hidden when no connections

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T025 [P] Add loading skeleton to `GraphCanvas.tsx` while graph data is fetching
- [ ] T026 [P] Add "no connections yet" empty state to `frontend/app/spots/[id]/graph/page.tsx` with explanation message
- [ ] T027 [P] Write `GraphSyncServiceTest` — verify: spot create triggers sync, sync failure does not throw, SAME_CATEGORY relationship created when two spots share category (`backend/src/test/java/com/favoritespot/graph/`)
- [ ] T028 Update `CLAUDE.md` SPECKIT block to reference `specs/002-knowledge-graph/plan.md`

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: Independent — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1; blocks all user stories
- **US1 (Phase 3)**: Depends on Phase 2; can start once `GraphSyncService` + `SpotNodeRepository` ready
- **US2 (Phase 4)**: Depends on Phase 2; can run in parallel with US1
- **US3 (Phase 5)**: Depends on Phase 2; can run in parallel with US1 and US2
- **Polish (Phase 6)**: Depends on all stories

### Parallel Opportunities

```bash
# Phase 2 parallel after T006:
T007 | T008 (SpotNode + TagNode/CityNode entities)

# Phase 3 parallel after T013-T014:
T015 | T016 (GraphCanvas + NodePreview frontend components)
```

## Notes

- All Neo4j sync calls MUST be wrapped in try/catch — exceptions logged, never re-thrown (Constitution Principle II)
- Vivid Atlas graph node style: `#4b3fe2` fill, `#9895ff` at 20% opacity outer glow (Constitution Principle IV)
- Max 2 hops enforced in ALL Cypher queries — no exceptions (Constitution Principle II)
