# Data Model: Knowledge Graph

**Feature**: 002-knowledge-graph
**Date**: 2026-04-18

## Neo4j Nodes

### SpotNode

```java
@Node("Spot")
public class SpotNode {
    @Id @GeneratedValue
    private Long id;

    @Property("spotId")   // UUID from PostgreSQL — indexed
    private String spotId;

    private String name;
    private String category;  // SpotCategory enum value as string
    private String city;

    @Relationship(type = "HAS_TAG", direction = OUTGOING)
    private List<TagNode> tags;

    @Relationship(type = "LOCATED_IN", direction = OUTGOING)
    private CityNode cityNode;
}
```

### TagNode

```java
@Node("Tag")
public class TagNode {
    @Id @GeneratedValue
    private Long id;
    private String name;
    private String type;  // STYLE or CUSTOM
}
```

### CityNode

```java
@Node("City")
public class CityNode {
    @Id @GeneratedValue
    private Long id;

    @Property("name")   // indexed
    private String name;
}
```

---

## Neo4j Relationships

| Type | From | To | Properties |
|------|------|----|------------|
| `HAS_TAG` | Spot | Tag | — |
| `LOCATED_IN` | Spot | City | — |
| `SAME_CATEGORY` | Spot | Spot | `category: String` |
| `SIMILAR_STYLE` | Spot | Spot | `sharedTags: List<String>` |
| `FROM_SAME_SOURCE` | Spot | Spot | `sourceDomain: String` |

> `SAME_CATEGORY` and `SIMILAR_STYLE` and `FROM_SAME_SOURCE` are bidirectional (stored once, queried with `-[r]-` undirected).

---

## Key Cypher Queries

### Get spot graph (2 hops)
```cypher
MATCH (s:Spot {spotId: $spotId})-[r*1..2]-(related:Spot)
WHERE related.spotId <> $spotId
RETURN s, r, related LIMIT 50
```

### Get full user graph
```cypher
MATCH (s:Spot) WHERE s.spotId IN $spotIds
OPTIONAL MATCH (s)-[r]-(other:Spot) WHERE other.spotId IN $spotIds
RETURN s, r, other
```

### Get related spots (ranked by shared connections)
```cypher
MATCH (s:Spot {spotId: $spotId})-[r]-(related:Spot)
WITH related, count(r) as connectionCount
ORDER BY connectionCount DESC
RETURN related LIMIT 5
```

---

## Neo4j Indexes (applied at startup)

```cypher
CREATE INDEX spot_spotId IF NOT EXISTS FOR (s:Spot) ON (s.spotId);
CREATE INDEX spot_category IF NOT EXISTS FOR (s:Spot) ON (s.category);
CREATE INDEX city_name IF NOT EXISTS FOR (c:City) ON (c.name);
```

---

## GraphDTO (API response shape)

```typescript
// frontend/lib/types.ts additions
export interface GraphNode {
  id: string;        // spotId
  label: string;     // spot name
  category: string;
  city?: string;
  coverImageUrl?: string;
}

export interface GraphEdge {
  from: string;      // spotId
  to: string;        // spotId
  type: 'SAME_CATEGORY' | 'SIMILAR_STYLE' | 'FROM_SAME_SOURCE' | 'HAS_TAG' | 'LOCATED_IN';
  label: string;     // human-readable: "Same Category", "Similar Style", etc.
  properties?: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```
