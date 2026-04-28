# API Contract: Spots

**Base Path**: `/api/spots`
**Auth Required**: Yes (HttpOnly JWT cookie) for all endpoints

---

## GET /api/spots

List the authenticated user's saved spots with optional filters.

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| category | string | Filter by SpotCategory (e.g., `CAFE`) |
| status | string | Filter by SpotStatus (`WANT_TO_GO` or `VISITED`) |
| city | string | Filter by city name (case-insensitive) |
| q | string | Keyword search across name, address, tags |
| page | integer | Page number (default: 0) |
| size | integer | Page size (default: 20, max: 100) |

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Paginated list of spots |
| 401 | Not authenticated |

**200 Body**
```json
{
  "content": [ /* Spot objects */ ],
  "totalElements": 42,
  "totalPages": 3,
  "page": 0,
  "size": 20
}
```

---

## POST /api/spots

Create a new spot.

**Request Body**
```json
{
  "name": "The Roastery",
  "address": "No. 7, Alley 3, Lane 72, Yongkang St, Taipei",
  "city": "Taipei",
  "category": "CAFE",
  "status": "WANT_TO_GO",
  "coverImageUrl": "https://example.com/image.jpg",
  "personalRating": null,
  "personalNote": null,
  "isPublic": false,
  "tags": ["文青", "手沖咖啡"],
  "sourceUrl": "https://example.com/blog/the-roastery",
  "sourceType": "BLOG"
}
```

**Responses**

| Status | Description |
|--------|-------------|
| 201 | Spot created; returns full Spot object |
| 400 | Validation error (missing name or category) |
| 401 | Not authenticated |

---

## GET /api/spots/{id}

Get a single spot by ID.

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Full Spot object with tags and sources |
| 401 | Not authenticated |
| 403 | Spot belongs to another user |
| 404 | Spot not found |

---

## PUT /api/spots/{id}

Replace a spot's editable fields (name, address, city, category, coverImageUrl, personalRating, personalNote, isPublic, tags).

**Request Body**: Same shape as POST, all fields optional (only provided fields updated).

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Updated Spot object |
| 400 | Validation error |
| 403 | Not owner |
| 404 | Not found |

---

## PATCH /api/spots/{id}/status

Toggle spot status between WANT_TO_GO and VISITED.

**Request Body**
```json
{
  "status": "VISITED"
}
```

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Updated Spot object |
| 400 | Invalid status value |
| 403 | Not owner |
| 404 | Not found |

---

## DELETE /api/spots/{id}

Delete a spot and all its sources and tag associations.

**Responses**

| Status | Description |
|--------|-------------|
| 204 | Deleted |
| 403 | Not owner |
| 404 | Not found |
