# Feature Specification: Map Mode + AI Recommendations

**Feature Branch**: `003-map-ai-recommendations`
**Created**: 2026-04-18
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Browse Spots on a Map (Priority: P1)

A logged-in user switches from the card feed to "Map View." All their saved spots with valid addresses appear as pins on an interactive map. The user can tap a pin to see a spot's preview card, and tap the card to navigate to the full detail page. They can filter visible pins by category or status using the same filter controls as the card feed.

**Why this priority**: Map view is the most-requested navigation pattern for location-based content, making the collection immediately spatial and intuitive.

**Independent Test**: Save 3 spots with valid addresses in different cities. Switch to Map View — confirm 3 pins appear at correct locations. Tap a pin — confirm preview card shows. Apply category filter — confirm only matching pins remain.

**Acceptance Scenarios**:

1. **Given** a user with spots that have addresses, **When** they open Map View, **Then** each spot with a valid address appears as a pin at its correct location.
2. **Given** the Map View, **When** the user taps a pin, **Then** a preview card slides up showing cover image, name, category, status, and a "View Detail" button.
3. **Given** the Map View, **When** the user applies a category filter, **Then** only pins for spots in that category remain visible.
4. **Given** a spot without an address, **When** the user opens Map View, **Then** that spot is excluded from the map with no error.
5. **Given** the Map View, **When** the user taps "View Detail" on a preview card, **Then** they navigate to the spot detail page.

---

### User Story 2 — Get Personalized AI Recommendations (Priority: P2)

Based on a user's saved spot collection (categories, cities, and style tags they have collected most), the system surfaces a "Recommended for You" section on the home feed showing up to 6 spots from other users' public collections that match the user's taste profile. The user can save a recommended spot directly from the recommendation card.

**Why this priority**: Personalized recommendations drive engagement and discovery beyond the user's own collection, leveraging the platform's growing data.

**Independent Test**: User A has 5 café spots tagged "文青" in Taipei. Confirm recommendations include public spots tagged "文青" or in the CAFE category from other users, ranked by match score. Save one — confirm it appears on the user's feed.

**Acceptance Scenarios**:

1. **Given** a user with 3+ saved spots, **When** they view the home feed, **Then** a "Recommended for You" section appears showing up to 6 spot cards.
2. **Given** the recommendations section, **When** the user taps "Save" on a card, **Then** the spot is added to their collection with status "Want to Go."
3. **Given** a user with fewer than 3 saved spots, **When** they view the home feed, **Then** the recommendations section is hidden (not enough data to personalise).
4. **Given** a recommendation that the user has already saved, **When** it would appear in recommendations, **Then** it is excluded from the recommendation list.
5. **Given** the recommendation engine, **When** it generates suggestions, **Then** only spots marked `is_public = true` by their owners are included.

---

### Edge Cases

- What if a spot's address cannot be geocoded to coordinates?
- What if the user has no public spots from other users to recommend?
- What if the Google Maps API is unavailable — does map view fail gracefully?
- What if a recommended spot is deleted by its owner before the user saves it?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST geocode spot addresses to lat/lng coordinates and store them on the Spot entity.
- **FR-002**: System MUST display an interactive map (Google Maps or Mapbox) with one pin per spot that has valid coordinates.
- **FR-003**: Map pins MUST be filterable by category and status without reloading the page.
- **FR-004**: Tapping a map pin MUST show a preview card; tapping the card MUST navigate to spot detail.
- **FR-005**: System MUST compute a taste profile for each user based on their top 3 most-collected categories and most-used style tags.
- **FR-006**: System MUST surface up to 6 recommended spots on the home feed for users with 3+ saved spots.
- **FR-007**: Recommendations MUST only include spots with `is_public = true` that the requesting user has not already saved.
- **FR-008**: Recommendations MUST be refreshed at most once per hour per user (cached result).
- **FR-009**: User MUST be able to save a recommended spot directly from the recommendation card.

### Key Entities

- **Spot** (extended): Add `latitude` (DOUBLE), `longitude` (DOUBLE) fields to existing Spot entity.
- **UserTasteProfile** (derived, not persisted): `{topCategories: [], topStyleTags: []}` — computed on demand from user's spots, cached in Redis.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Map View renders all pins within 2 seconds for a collection of 200 spots.
- **SC-002**: Recommendation section appears on the home feed within 1 second (served from cache after first load).
- **SC-003**: Geocoding succeeds for 90%+ of addresses that include a city name.
- **SC-004**: Users with 3+ spots see at least 1 recommendation card if any matching public spots exist in the platform.

## Assumptions

- Google Maps JavaScript API is used for the frontend map; Google Geocoding API for address-to-coordinates conversion.
- API keys for Google Maps are configured via environment variables and are not exposed to the frontend bundle (geocoding done server-side).
- Recommendations are collaborative-filtering lite — based on tag/category overlap, not ML embeddings (ML is future scope).
- Map View is a toggle on the home feed page (same URL, different view mode), not a separate route.
- Spots saved before this feature ships do not have coordinates; they are geocoded lazily on first Map View access.
