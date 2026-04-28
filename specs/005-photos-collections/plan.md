# Implementation Plan: Photo Upload + Thematic Collections

**Branch**: `005-photos-collections` | **Date**: 2026-04-18 | **Spec**: [spec.md](spec.md)

## Summary

Enable users to upload personal photos to spots (stored in S3-compatible cloud storage with server-side thumbnail generation), and create named thematic collections of spots that can be made public and shared via URL.

## Technical Context

**Language/Version**: Java 21 (backend), TypeScript / Node 20 (frontend)
**Primary Dependencies**: AWS SDK v2 (S3 upload), Thumbnailator (Java image resizing), Spring Multipart, react-dropzone (frontend upload UX), @dnd-kit (drag-and-drop collection reordering)
**Storage**: PostgreSQL (SpotPhoto, Collection, CollectionSpot tables); AWS S3 / Cloudflare R2 (photo binary storage)
**Testing**: JUnit 5; MockMultipartFile for upload tests; LocalStack for S3 integration tests
**Target Platform**: Mobile browser (camera upload primary use case)
**Project Type**: Extension of existing web application
**Performance Goals**: Photo upload ≤5s for 10 MB; gallery load ≤2s for 10 photos; collection page ≤2s for 50 spots
**Constraints**: Max 10 MB per photo; max 10 photos per spot; max 50 spots per collection; JPEG/PNG/WebP only
**Scale/Scope**: Per-spot photo galleries; per-user collections

## Constitution Check

| Principle | Gate | Status |
|-----------|------|--------|
| I. Zero-Friction | Photo upload is additive — existing spot save flow unchanged | ✅ Pass |
| II. Dual-Store | No Neo4j changes required | ✅ Pass |
| III. AI-First | Not applicable | ✅ N/A |
| IV. Mobile-First | Photo gallery uses full-bleed imagery per Vivid Atlas card spec | ✅ Pass |
| V. Phased Delivery | Phase 3 scope only | ✅ Pass |

## Project Structure

### Documentation (this feature)

```text
specs/005-photos-collections/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── photos.md
│   └── collections.md
└── tasks.md
```

### Source Code

```text
backend/src/main/java/com/favoritespot/
├── photo/
│   ├── SpotPhoto.java / SpotPhotoRepository.java
│   ├── StorageService.java            # S3 upload + thumbnail generation
│   └── PhotoController.java           # /api/spots/{id}/photos
├── collection/
│   ├── Collection.java / CollectionSpot.java
│   ├── CollectionRepository.java
│   ├── CollectionService.java
│   └── CollectionController.java      # /api/collections/*

frontend/
├── app/
│   ├── spots/[id]/page.tsx            # Add photo gallery section
│   ├── collections/page.tsx           # My collections list
│   ├── collections/new/page.tsx       # Create collection
│   ├── collections/[id]/page.tsx      # Collection detail + drag reorder
│   └── c/[id]/page.tsx               # Public shareable collection view
└── components/
    ├── PhotoGallery.tsx               # Horizontal scroll gallery
    ├── PhotoUploader.tsx              # react-dropzone upload area
    └── CollectionEditor.tsx           # @dnd-kit sortable list
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| External object storage (S3) | Photo binaries cannot be stored in PostgreSQL at scale | DB blob storage hits row size limits and degrades query performance |
