# Tasks: Map Mode + AI Recommendations

**Input**: `specs/003-map-ai-recommendations/`
**Branch**: `003-map-ai-recommendations`
**Prerequisite**: `001-mvp-core` fully implemented

## Phase 1: Setup
- [ ] T001 Add `latitude DOUBLE PRECISION` and `longitude DOUBLE PRECISION` columns to `spots` table via Flyway migration `V5__add_spot_coordinates.sql`
- [ ] T002 [P] Add Google Maps JavaScript API key to `frontend/.env.local` (`NEXT_PUBLIC_GOOGLE_MAPS_KEY`)
- [ ] T003 [P] Add Google Geocoding API key to `backend/.env` (`GOOGLE_GEOCODING_API_KEY`)
- [ ] T004 [P] Add `latitude`, `longitude` fields to `Spot.java` JPA entity

## Phase 2: Foundational
- [ ] T005 Create `GeocodingService.java` in `backend/.../geo/` — calls Google Geocoding REST API with address string, returns lat/lng or null on failure; wraps in try/catch (non-blocking)
- [ ] T006 Wire `GeocodingService` into `SpotService.createSpot()` and `SpotService.updateSpot()` — call after save, update lat/lng if address changed

**Checkpoint**: New spots with addresses automatically get coordinates on save

## Phase 3: User Story 1 — Map View (P1) 🎯
- [ ] T007 [US1] Add `GET /api/spots/map` endpoint to `SpotController` — returns spots with non-null coordinates as `{id, name, category, status, lat, lng, coverImageUrl}` list; supports same category/status filters
- [ ] T008 [P] [US1] Create `frontend/components/MapView.tsx` — `use client`; Google Maps JS API wrapper; renders `MapPin` per spot; fires `onPinClick(spotId)` callback
- [ ] T009 [P] [US1] Create `frontend/components/MapPin.tsx` — custom indigo `#4b3fe2` SVG marker with category icon
- [ ] T010 [P] [US1] Create `frontend/components/MapSpotPreview.tsx` — slide-up card on pin click: cover image, name, category, status, "View Detail" button
- [ ] T011 [US1] Add map/card view toggle to `frontend/app/feed/page.tsx`; persist view preference in localStorage

**Checkpoint**: Map View shows all pinned spots; pin tap shows preview card

## Phase 4: User Story 2 — AI Recommendations (P2)
- [ ] T012 [US2] Create `RecommendationService.java` in `backend/.../recommendation/` — compute taste profile (top 3 categories + top style tags from user's spots), score public spots by overlap, return top 6; cache in Redis `recommendations:<userId>` TTL 1h
- [ ] T013 [US2] Create `RecommendationController.java` — `GET /api/recommendations`
- [ ] T014 [P] [US2] Create `frontend/components/RecommendationRow.tsx` — horizontal scroll of SpotCards with "Save" button; hidden when empty
- [ ] T015 [US2] Add `RecommendationRow` to `frontend/app/feed/page.tsx` below filter bar; fetch `/api/recommendations`; hide if fewer than 3 user spots

**Checkpoint**: Recommendations appear on feed for users with 3+ spots; save from card works

## Phase 5: Polish
- [ ] T016 [P] Handle spots without coordinates gracefully in MapView — show count badge "N spots not shown (no address)"
- [ ] T017 [P] Write `GeocodingServiceTest` — verify non-blocking failure when API returns error
- [ ] T018 [P] Write `RecommendationServiceTest` — verify taste profile computation and public-only filtering
