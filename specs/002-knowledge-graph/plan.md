# Implementation Plan: Knowledge Graph

**Branch**: `002-knowledge-graph` | **Date**: 2026-04-18 | **Spec**: [spec.md](spec.md)

## Summary

Add Neo4j as the second data store (fulfilling Constitution Principle II), build automatic dual-store sync on every Spot write, expose Graph API endpoints (spot graph, full user graph, related spots), and render an interactive knowledge graph visualization in the frontend using vis.js Network.

## Technical Context

**Language/Version**: Java 21 (backend), TypeScript / Node 20 (frontend)
**Primary Dependencies**: Spring Data Neo4j 7.x, Neo4j Java Driver, vis.js Network (frontend graph viz)
**Storage**: Neo4j 5 Community (graph DB); PostgreSQL + Redis already established in Phase 1
**Testing**: JUnit 5 + Neo4j Test Harness (`@DataNeo4jTest`) for graph repository tests
**Target Platform**: Same Docker Compose stack as Phase 1; Neo4j browser at localhost:7474
**Project Type**: Extension of existing web application
**Performance Goals**: Spot graph renders ≤2s; full user graph ≤3s for 200 nodes; related spots API ≤500ms
**Constraints**: Max 2 hop depth on all Cypher queries; Neo4j sync must be best-effort (non-blocking); Neo4j Community Edition only
**Scale/Scope**: Up to 200 spots per user; up to 5 relationship types per spot pair

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Zero-Friction | Graph builds automatically from saved spots — no user action needed | ✅ Pass |
| II. Dual-Store Architecture | This feature IS the Neo4j implementation required by Principle II | ✅ Pass |
| III. AI-First Parsing | Not applicable to graph layer | ✅ N/A |
| IV. Mobile-First Design | Graph Explorer uses Vivid Atlas node colors (primary `#4b3fe2`, glow `#9895ff`) | ✅ Pass |
| V. Phased Delivery | Phase 2 scope only; no social or recommendation features | ✅ Pass |

## Project Structure

### Documentation (this feature)

```text
specs/002-knowledge-graph/
├── plan.md
├── research.md
├── data-model.md        # Neo4j node/relationship schema
├── quickstart.md        # Neo4j Docker setup, Cypher queries
├── contracts/
│   └── graph.md         # Graph API endpoints
└── tasks.md
```

### Source Code

```text
backend/src/main/java/com/favoritespot/
├── graph/
│   ├── node/            # SpotNode.java, TagNode.java, CityNode.java (@Node entities)
│   ├── relationship/    # SameCategory.java, SimilarStyle.java, etc. (@RelationshipProperties)
│   ├── repository/      # SpotNodeRepository.java (Spring Data Neo4j)
│   ├── service/         # GraphSyncService.java, GraphQueryService.java
│   └── controller/      # GraphController.java
└── config/
    └── Neo4jConfig.java

frontend/
├── app/
│   ├── graph/page.tsx              # Graph Explorer (full collection)
│   └── spots/[id]/graph/page.tsx   # Single spot graph view
└── components/
    ├── GraphCanvas.tsx             # vis.js Network wrapper (use client)
    ├── GraphNodePreview.tsx        # Spot preview card on node click
    └── GraphFilterBar.tsx          # Relationship type toggle filters
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Second database (Neo4j) | Core product feature — knowledge graph relationships cannot be efficiently modeled in relational DB | PostgreSQL recursive CTEs for multi-hop traversal are orders of magnitude slower and harder to maintain than native graph queries |
