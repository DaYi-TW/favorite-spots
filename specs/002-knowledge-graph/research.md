# Research: Knowledge Graph

**Feature**: 002-knowledge-graph
**Date**: 2026-04-18

## Decision Log

### 1. Graph Visualization Library: vis.js vs D3.js

- **Decision**: **vis.js Network**
- **Rationale**: vis.js has a higher-level API specifically designed for network graphs — nodes, edges, physics simulation, and pan/zoom are built-in. D3.js requires building all of this from scratch using low-level SVG primitives, which is significantly more work for the same result. The mockup in `stitch_favorite_spot_knowledge_graph/knowledge_graph_explorer/` already shows a force-directed layout that vis.js renders natively.
- **Alternatives considered**: D3.js force simulation (too low-level, 3× the code), Cytoscape.js (good alternative but vis.js has better TypeScript types and simpler React integration).

### 2. Neo4j Sync Strategy: Synchronous vs Event-Driven

- **Decision**: **Synchronous best-effort** — `GraphSyncService` is called directly from `SpotService` after PostgreSQL write; exceptions are caught and logged, never re-thrown.
- **Rationale**: Phase 2 scope does not include a message broker. Synchronous with exception swallowing satisfies Constitution Principle II ("best-effort, not blocking") without adding Kafka/RabbitMQ complexity. If Neo4j is down, the spot saves successfully; graph data re-syncs on next relevant operation.
- **Alternatives considered**: Spring ApplicationEvent async dispatch (non-blocking but complex), Kafka (Phase 3 scope), @Transactional with both stores (Neo4j doesn't participate in JPA transactions cleanly).

### 3. Relationship Building Logic

- **Decision**: Recalculate all relationships for a spot on every create/update by first deleting existing relationships, then re-creating them.
- **Rationale**: Simpler to reason about than differential updates. For Phase 2 scale (≤200 spots), full recalculation is fast enough.
- **Alternatives considered**: Differential update (compare old vs new tags/category — more complex), CDC (change data capture — overkill for Phase 2).

### 4. Cypher Depth Limiting

- **Decision**: All graph queries use `MATCH (s:Spot)-[*1..2]-(related:Spot)` with explicit depth bounds and `LIMIT` clauses.
- **Rationale**: Unbounded traversal on a dense graph can be exponentially slow. 2-hop cap is specified in the Constitution.
- **Alternatives considered**: apoc.path.subgraphNodes (requires APOC plugin, not available in Community Edition without setup).

### 5. Neo4j Node Identity

- **Decision**: Use `spotId` (UUID from PostgreSQL) as the Neo4j node identifier, stored as a property. Spring Data Neo4j's internal `@Id @GeneratedValue` is used for the Neo4j internal node ID.
- **Rationale**: Allows cross-referencing between PostgreSQL and Neo4j without keeping a separate mapping table. `spotId` is indexed.
- **Alternatives considered**: Use Neo4j internal ID as primary reference (breaks if Neo4j is rebuilt from scratch), separate mapping table (unnecessary indirection).

### 6. vis.js React Integration

- **Decision**: Wrap vis.js in a `use client` React component (`GraphCanvas.tsx`) using a `useRef` for the container div and `useEffect` for initialization/cleanup.
- **Rationale**: vis.js is a DOM-manipulating library — it must run client-side only. `useEffect` with cleanup prevents memory leaks from network instances persisting across re-renders.
- **Alternatives considered**: react-vis-network (thin wrapper, less maintained), react-graph-vis (outdated vis.js version).
