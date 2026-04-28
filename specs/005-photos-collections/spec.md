# Feature Specification: Photo Upload + Thematic Collections

**Feature Branch**: `005-photos-collections`
**Created**: 2026-04-18
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Upload Personal Photos to a Spot (Priority: P1)

After visiting a spot, a logged-in user opens the spot's detail page and uploads one or more personal photos from their device. The photos appear in the spot's photo gallery. The first uploaded photo can be set as the new cover image.

**Why this priority**: Personal photos make the spot card feel owned and authentic, replacing scraped cover images with real visit memories.

**Independent Test**: Open a saved spot. Upload 2 photos. Confirm both appear in the gallery. Set the second as cover image. Confirm the spot card on the feed now shows the new cover.

**Acceptance Scenarios**:

1. **Given** a spot detail page, **When** the user taps "Add Photos" and selects images from their device, **Then** the photos are uploaded and appear in the spot's photo gallery.
2. **Given** uploaded photos, **When** the user long-presses a photo and selects "Set as Cover," **Then** the spot's cover image updates across all cards showing that spot.
3. **Given** multiple photos uploaded, **When** the user views the spot detail, **Then** photos appear in a horizontal scrollable gallery.
4. **Given** a photo in the gallery, **When** the user taps a delete icon, **Then** the photo is removed after confirmation.
5. **Given** an image file larger than 10 MB, **When** the user tries to upload it, **Then** a clear size-limit error is shown and the upload is rejected.

---

### User Story 2 — Create and Share Thematic Collections (Priority: P2)

A logged-in user can create named collections (e.g., "台南兩天一夜", "Tokyo Coffee Tour") and add any of their saved spots to one or more collections. Collections can be made public and shared via a unique URL. A visitor opening a shared collection URL sees a curated read-only card grid.

**Why this priority**: Collections are the editorial layer on top of individual spots — they enable curation, storytelling, and high-intent sharing (e.g., trip planning).

**Independent Test**: Create a collection "Tainan 2-Day Trip." Add 3 spots. Set collection public. Copy share URL. Open in incognito — confirm 3 spots visible, in the order user arranged them.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they create a collection with a name and optional description, **Then** the collection appears in their profile with 0 spots.
2. **Given** a collection, **When** the user adds a spot to it (from the spot detail page or a spot's context menu), **Then** the spot appears in that collection.
3. **Given** a collection, **When** the user reorders spots via drag-and-drop, **Then** the new order is persisted.
4. **Given** a public collection URL, **When** an unauthenticated visitor opens it, **Then** they see the collection name, description, and spots as a read-only card grid.
5. **Given** a collection set to private, **When** someone other than the owner tries to access its URL, **Then** they receive a "not found" response.

---

### Edge Cases

- What is the max number of photos per spot? (Assume 10 for Phase 3)
- What image formats are supported? (JPEG, PNG, WebP)
- What if a spot is deleted — are its photos also deleted?
- Can a spot belong to multiple collections?
- What is the max number of spots in a collection? (Assume 50)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept JPEG, PNG, and WebP photo uploads up to 10 MB per file, max 10 photos per spot.
- **FR-002**: System MUST store uploaded photos in cloud object storage (e.g., AWS S3 or compatible) and return a permanent URL.
- **FR-003**: System MUST allow any uploaded photo to be set as the spot's cover image.
- **FR-004**: System MUST allow users to delete their own uploaded photos.
- **FR-005**: System MUST allow users to create named collections with an optional description.
- **FR-006**: System MUST allow a spot to belong to multiple collections.
- **FR-007**: System MUST allow users to reorder spots within a collection.
- **FR-008**: System MUST expose public collections at a shareable URL accessible without authentication.
- **FR-009**: Private collections MUST return 404 to non-owners.

### Key Entities

- **SpotPhoto**: `{id, spotId, userId, storageUrl, thumbnailUrl, iscover, displayOrder, uploadedAt}`
- **Collection**: `{id, userId, name, description, isPublic, createdAt}`
- **CollectionSpot**: `{collectionId, spotId, displayOrder}` — PK(collectionId, spotId)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Photo upload completes within 5 seconds for a 10 MB image on a standard mobile connection.
- **SC-002**: Photo gallery on a spot detail page loads within 2 seconds for up to 10 photos.
- **SC-003**: A public collection page loads within 2 seconds for up to 50 spots.
- **SC-004**: Cover image update is reflected on the feed card within 1 second of being set.

## Assumptions

- Cloud storage is AWS S3 or compatible (e.g., Cloudflare R2); bucket name and credentials are environment variables.
- Thumbnail generation (e.g., 400×300) is done server-side on upload using an image processing library.
- Drag-and-drop reordering in the collection editor uses `displayOrder` integer; gaps are allowed (no need to renumber sequentially on every move).
- Collections created by users before this feature ships start empty; no auto-population from existing spots.
