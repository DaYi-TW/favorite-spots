# Research: Map Mode + AI Recommendations
**Feature**: 003 | **Date**: 2026-04-18

## Decision Log

### 1. Map Library: Google Maps vs Mapbox
- **Decision**: **Google Maps JavaScript API**
- **Rationale**: Google Maps has the best coverage for Taiwan and Japan addresses (primary target markets). The same Google Geocoding API is used server-side, keeping the vendor consistent.
- **Alternatives**: Mapbox (better styling flexibility, but coverage gaps in Taiwan rural areas), Leaflet + OpenStreetMap (free but geocoding quality lower).

### 2. Geocoding Strategy: On-Save vs Lazy
- **Decision**: **On-save** — `GeocodingService` called synchronously after spot is created/updated with a non-null address.
- **Rationale**: Ensures map pins appear immediately when a user switches to Map View after saving. Geocoding failure is non-blocking (spot saves, lat/lng stays null, pin excluded from map).
- **Alternatives**: Lazy geocoding on first Map View access (causes delay), background job queue (over-engineering for Phase 3).

### 3. Recommendation Algorithm
- **Decision**: **Tag + category overlap scoring** — for each public spot not owned by the user, compute a score = (shared style tags × 2) + (matching category × 1). Return top 6.
- **Rationale**: Simple, deterministic, explainable. No ML model needed for Phase 3.
- **Alternatives**: Vector embeddings (accurate but requires ML infra), collaborative filtering (needs more user data).

### 4. Recommendation Cache Key
- **Decision**: `recommendations:<userId>` in Redis, TTL 1 hour.
- **Rationale**: Taste profile changes only when a user saves/deletes spots. 1-hour TTL balances freshness vs API cost.
