# Tasks: Photo Upload + Thematic Collections

**Input**: `specs/005-photos-collections/`
**Branch**: `005-photos-collections`
**Prerequisite**: `001-mvp-core` fully implemented

## Phase 1: Setup
- [ ] T001 Add S3/R2 storage dependencies to `backend/pom.xml` (AWS SDK v2 S3, Thumbnailator)
- [ ] T002 [P] Add `react-dropzone` and `@dnd-kit/core` + `@dnd-kit/sortable` to `frontend/package.json`
- [ ] T003 [P] Add storage env vars to `backend/.env`: `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_CDN_BASE_URL`
- [ ] T004 Create Flyway migrations: `V9__create_spot_photos.sql` and `V10__create_collections.sql` + `V11__create_collection_spots.sql`

## Phase 2: Foundational
- [ ] T005 [P] Create `SpotPhoto.java` JPA entity and `SpotPhotoRepository.java` in `backend/.../photo/`
- [ ] T006 [P] Create `Collection.java`, `CollectionSpot.java` JPA entities and `CollectionRepository.java` in `backend/.../collection/`
- [ ] T007 Create `StorageService.java` — upload file to S3/R2, generate thumbnail via Thumbnailator, return `{storageUrl, thumbnailUrl}`

**Checkpoint**: DB schema migrated; S3 client connected; entities defined

## Phase 3: User Story 1 — Photo Upload (P1) 🎯
- [ ] T008 [US1] Create `PhotoService.java` — `uploadPhoto(spotId, userId, file)`: validate type/size, call StorageService, save SpotPhoto entity; `deletePhoto`, `setCoverImage`
- [ ] T009 [US1] Create `PhotoController.java` — `POST /api/spots/{id}/photos` (multipart), `DELETE /api/spots/{id}/photos/{photoId}`, `PATCH /api/spots/{id}/photos/{photoId}/cover`
- [ ] T010 [P] [US1] Create `frontend/components/PhotoUploader.tsx` — react-dropzone; shows upload progress; enforces 10 MB / JPEG+PNG+WebP constraints
- [ ] T011 [P] [US1] Create `frontend/components/PhotoGallery.tsx` — horizontal scroll; thumbnail display; long-press context menu (Set as Cover, Delete)
- [ ] T012 [US1] Add `PhotoGallery` + `PhotoUploader` to `frontend/app/spots/[id]/page.tsx`

**Checkpoint**: Photos upload, display in gallery, cover image sets correctly

## Phase 4: User Story 2 — Thematic Collections (P2)
- [ ] T013 [US2] Create `CollectionService.java` — CRUD + `addSpot`, `removeSpot`, `reorderSpot` (midpoint displayOrder algorithm)
- [ ] T014 [US2] Create `CollectionController.java` — `GET/POST /api/collections`, `GET/PUT/DELETE /api/collections/{id}`, `POST /api/collections/{id}/spots`, `PATCH /api/collections/{id}/spots/reorder`; public endpoint `GET /api/c/{id}` (unauthenticated)
- [ ] T015 [P] [US2] Create `frontend/components/CollectionEditor.tsx` — @dnd-kit sortable list of SpotCards; drag handle per card
- [ ] T016 [P] [US2] Create `frontend/app/collections/page.tsx` + `new/page.tsx` + `[id]/page.tsx`
- [ ] T017 [P] [US2] Create `frontend/app/c/[id]/page.tsx` — public shareable collection view (unauthenticated accessible); read-only card grid

**Checkpoint**: Collections create/edit/share work; drag reorder persists

## Phase 5: Polish
- [ ] T018 [P] Write `PhotoServiceTest` — verify file size/type validation rejects invalid uploads; StorageService mocked
- [ ] T019 [P] Write `CollectionServiceTest` — verify midpoint displayOrder algorithm; private collection returns 404 for non-owner
- [ ] T020 [P] Add "Add to Collection" button to spot detail page context menu
