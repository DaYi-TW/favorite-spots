# API Contract: Graph

**Base Path**: `/api/graph`
**Auth Required**: Yes (HttpOnly JWT cookie)

---

## GET /api/graph/spot/{id}

Return the graph data for a single spot — the spot node and all connected spot nodes within 2 hops.

**Path Parameters**: `id` — Spot UUID (PostgreSQL ID)

**Responses**

| Status | Description |
|--------|-------------|
| 200 | GraphData with nodes and edges |
| 401 | Not authenticated |
| 403 | Spot belongs to another user |
| 404 | Spot not found |

**200 Body**
```json
{
  "nodes": [
    { "id": "uuid-A", "label": "The Roastery", "category": "CAFE", "city": "Taipei", "coverImageUrl": "https://..." },
    { "id": "uuid-B", "label": "Cafe Minimal", "category": "CAFE", "city": "Taipei", "coverImageUrl": "https://..." }
  ],
  "edges": [
    { "from": "uuid-A", "to": "uuid-B", "type": "SAME_CATEGORY", "label": "Same Category" }
  ]
}
```

---

## GET /api/graph/user

Return the full knowledge graph for the authenticated user's entire spot collection.

**Responses**

| Status | Description |
|--------|-------------|
| 200 | GraphData with all user's spots as nodes and their inter-relationships as edges |
| 401 | Not authenticated |

**Notes**
- Only relationships between spots belonging to the authenticated user are returned.
- Max 200 nodes; if user has more spots, returns most recently added 200.

---

## GET /api/graph/related/{id}

Return up to 5 related spots ranked by number of shared graph connections.

**Path Parameters**: `id` — Spot UUID

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Array of up to 5 Spot objects (full Spot shape, same as GET /api/spots/{id}) |
| 401 | Not authenticated |
| 404 | Spot not found |

**200 Body**
```json
[
  { "id": "uuid-B", "name": "Cafe Minimal", "category": "CAFE", ... },
  { "id": "uuid-C", "name": "W Hotel Taipei", "category": "HOTEL", ... }
]
```
