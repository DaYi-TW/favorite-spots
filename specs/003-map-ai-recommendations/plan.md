# Implementation Plan: Map Mode + AI Recommendations

**Branch**: `003-map-ai-recommendations` | **Date**: 2026-04-18 | **Spec**: [spec.md](spec.md)

## Summary

Add geographic coordinates to spots via server-side geocoding, render an interactive map view of the collection using Google Maps JavaScript API, and implement a lightweight taste-profile-based recommendation engine that surfaces public spots from other users.

## Technical Context

**Language/Version**: Java 21 (backend), TypeScript / Node 20 (frontend)
**Primary Dependencies**: Google Maps JavaScript API (frontend map), Google Geocoding API (server-side), Spring WebClient (geocoding HTTP calls), next-intl (already planned for Phase 4)
**Storage**: PostgreSQL (spot lat/lng fields + Redis for recommendation cache TTL 1h)
**Testing**: JUnit 5 + MockMvc; Mockito for Google Geocoding API client
**Target Platform**: Mobile browser (map view is the primary mobile use case)
**Project Type**: Extension of existing web application
**Performance Goals**: Map renders ≤2s for 200 pins; recommendations ≤1s (from cache)
**Constraints**: Google Maps API key server-proxied (not exposed in frontend bundle for geocoding); recommendations only from `is_public = true` spots
**Scale/Scope**: Up to 200 map pins per user; up to 6 recommendations

## Constitution Check

| Principle | Gate | Status |
|-----------|------|--------|
| I. Zero-Friction | Geocoding is automatic on spot save — no user action needed | ✅ Pass |
| II. Dual-Store | lat/lng stored in PostgreSQL; no Neo4j impact | ✅ Pass |
| III. AI-First Parsing | Geocoding uses Google API, not Claude — acceptable for structured address resolution | ✅ Pass |
| IV. Mobile-First Design | Map view uses Vivid Atlas color tokens for pin markers | ✅ Pass |
| V. Phased Delivery | Phase 3 scope; no Chrome Extension or LINE Bot | ✅ Pass |

## Project Structure

### Documentation (this feature)

```text
specs/003-map-ai-recommendations/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── map.md
│   └── recommendations.md
└── tasks.md
```

### Source Code

```text
backend/src/main/java/com/favoritespot/
├── geo/
│   ├── GeocodingService.java          # Google Geocoding API client
│   └── GeocodingConfig.java           # API key config
├── recommendation/
│   ├── RecommendationService.java     # Taste profile + spot matching
│   └── RecommendationController.java  # GET /api/recommendations
└── spot/
    └── Spot.java                      # Add latitude, longitude fields

frontend/
├── app/feed/page.tsx                  # Add map/card view toggle
└── components/
    ├── MapView.tsx                    # Google Maps JS API wrapper (use client)
    ├── MapPin.tsx                     # Custom indigo pin marker
    ├── MapSpotPreview.tsx             # Slide-up card on pin tap
    └── RecommendationRow.tsx          # Horizontal scroll of recommended spot cards
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| External geocoding API | Addresses from AI parsing are unstructured text; accurate lat/lng requires a geocoding service | Manual coordinate entry violates Zero-Friction principle |
