# Feature Specification: Knowledge Graph

**Feature Branch**: `002-knowledge-graph`
**Created**: 2026-04-18
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View a Spot's Knowledge Graph (Priority: P1)

A logged-in user opens a spot's detail page and taps "View in Graph." An interactive graph appears showing the selected spot as the central node, with connected spots radiating outward based on shared category, shared city, similar style tags, or the same source URL. The user can tap any connected node to navigate to that spot's detail page.

**Why this priority**: This is the core differentiator of the product — the visual knowledge graph that connects spots into a discovery network. Without it, the app is just another list.

**Independent Test**: Save 3+ spots with at least one shared category. Open one spot's detail page, tap "View in Graph," confirm the connected spots appear as nodes with labeled relationship edges. Tap a node to confirm navigation to that spot's detail.

**Acceptance Scenarios**:

1. **Given** a spot that shares a category with at least one other spot, **When** the user opens the graph view for that spot, **Then** connected spots appear as nodes with edges labeled by relationship type (Same Category / Same City / Similar Style / Same Source).
2. **Given** the graph view is open, **When** the user taps a connected node, **Then** they are navigated to that spot's detail page.
3. **Given** a spot with no connections, **When** the user opens the graph view, **Then** the spot appears as a single isolated node with a message explaining no connections yet.
4. **Given** a spot with many connections, **When** the graph renders, **Then** only up to 2 hops of relationships are shown (direct connections + their direct connections).
5. **Given** the graph is rendered, **When** the user drags or pinches, **Then** the graph responds to pan and zoom gestures.

---

### User Story 2 — Explore the Full Collection Graph (Priority: P2)

A logged-in user navigates to a dedicated "Graph Explorer" page showing their entire spot collection as an interconnected knowledge graph. They can filter the visible relationships by type (Category / City / Style / Source) and spot-click any node to see a preview card.

**Why this priority**: The full-collection graph is the "wow" moment that makes the product unique. It enables serendipitous discovery across the entire collection.

**Independent Test**: Save 5+ spots with mixed categories and cities. Open Graph Explorer, confirm all spots appear as nodes. Toggle off "Same City" filter, confirm city-based edges disappear. Click a node, confirm a spot preview card appears.

**Acceptance Scenarios**:

1. **Given** a user with 5+ saved spots, **When** they open the Graph Explorer, **Then** all spots appear as nodes with relationship edges connecting them.
2. **Given** the Graph Explorer is open, **When** the user toggles a relationship filter (e.g., hides "Same City"), **Then** those edges disappear without re-loading the page.
3. **Given** the Graph Explorer is open, **When** the user clicks a node, **Then** a preview card slides up showing the spot's cover image, name, category, and a "View Detail" button.
4. **Given** the Graph Explorer with many spots, **When** the graph renders, **Then** it is interactive within 3 seconds for up to 200 nodes.

---

### User Story 3 — Get Related Spot Recommendations (Priority: P2)

On a spot's detail page, a "You might also like" section displays up to 5 related spots ranked by number of shared connections (tags, category, city). The user can tap any recommendation to navigate to that spot.

**Why this priority**: Recommendations surface the graph's value passively without requiring the user to open the full graph view.

**Independent Test**: Save 4+ spots where spot A shares category AND style tag with spot B, but only category with spot C. Open spot A's detail — confirm spot B ranks above spot C in recommendations.

**Acceptance Scenarios**:

1. **Given** a spot with graph connections, **When** the user views its detail page, **Then** up to 5 related spots appear in a "You might also like" section, ranked by number of shared relationship types.
2. **Given** a spot with no connections, **When** the user views its detail page, **Then** the "You might also like" section is hidden.
3. **Given** the recommendations section, **When** the user taps a recommended spot, **Then** they navigate to that spot's detail page.

---

### Edge Cases

- What happens when a new spot is saved but Neo4j sync fails — does the spot still save to PostgreSQL?
- What if two spots have identical names but are in different cities?
- How does the graph handle a spot that is deleted while the graph is being viewed?
- What if the user has only 1 spot saved — can the graph still render?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST maintain Neo4j in sync with PostgreSQL — every time a Spot is created, updated, or deleted in PostgreSQL, the corresponding Neo4j node and relationships MUST be updated.
- **FR-002**: System MUST create Neo4j relationships automatically: SAME_CATEGORY (spots sharing category), LOCATED_IN (spot → city node), HAS_TAG (spot → tag nodes), SIMILAR_STYLE (spots sharing ≥1 style tag), FROM_SAME_SOURCE (spots from the same source URL domain).
- **FR-003**: Graph queries MUST be limited to a maximum depth of 2 hops.
- **FR-004**: Neo4j MUST have indexes on Spot.spotId, Spot.category, and City.name.
- **FR-005**: System MUST expose a `GET /api/graph/spot/{id}` endpoint returning the spot's node and all connections up to 2 hops.
- **FR-006**: System MUST expose a `GET /api/graph/user` endpoint returning all spots for the authenticated user as a graph (nodes + edges).
- **FR-007**: System MUST expose a `GET /api/graph/related/{id}` endpoint returning up to 5 related spots ranked by shared connection count.
- **FR-008**: If Neo4j sync fails, the PostgreSQL write MUST still succeed (Neo4j sync is best-effort, not blocking).
- **FR-009**: The frontend MUST render the graph using an interactive visualization library supporting pan, zoom, and node tap/click.
- **FR-010**: Relationship edges MUST be labeled by type (Same Category, Same City, Similar Style, Same Source).
- **FR-011**: The Graph Explorer MUST support toggling visibility of each relationship type independently.
- **FR-012**: Node tap/click on Graph Explorer MUST show a spot preview card (image, name, category, "View Detail" link).

### Key Entities (Neo4j)

- **Spot node**: `{spotId, name, category, city}` — mirrors PostgreSQL Spot
- **Tag node**: `{name, type}` — mirrors PostgreSQL Tag
- **City node**: `{name}` — derived from Spot.city
- **SAME_CATEGORY relationship**: between two Spot nodes sharing the same category
- **SIMILAR_STYLE relationship**: `{sharedTags: []}` between two Spot nodes sharing ≥1 style tag
- **HAS_TAG relationship**: Spot → Tag
- **LOCATED_IN relationship**: Spot → City
- **FROM_SAME_SOURCE relationship**: `{sourceDomain}` between Spot nodes from the same source URL domain

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A spot's graph view renders within 2 seconds for collections of up to 200 spots.
- **SC-002**: Graph Explorer renders within 3 seconds for a full collection of 200 spots.
- **SC-003**: Related spot recommendations appear on the detail page with no additional user interaction.
- **SC-004**: Neo4j sync failure does not cause the spot-save operation to fail — 100% of spot saves succeed regardless of Neo4j availability.
- **SC-005**: Graph correctly reflects relationship changes within 1 second of a spot being updated or deleted.

## Assumptions

- Neo4j Community Edition is sufficient for Phase 2 (no clustering needed).
- Graph Explorer is accessible from the main navigation; it does not replace the card feed.
- Relationship edges are undirected for display purposes (SAME_CATEGORY between A and B shows as a single edge, not two).
- FROM_SAME_SOURCE is based on the source URL's domain (e.g., `maps.google.com`), not the exact URL.
- Phase 2 does not include graph-based AI recommendations — that is Phase 3 scope.
- The visualization library used is D3.js force-directed graph or vis.js Network; the choice is made in the plan phase.
