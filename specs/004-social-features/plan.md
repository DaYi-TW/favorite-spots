# Implementation Plan: Social Features

**Branch**: `004-social-features` | **Date**: 2026-04-18 | **Spec**: [spec.md](spec.md)

## Summary

Implement social graph (follow/unfollow), per-spot likes with denormalized counts, a Following tab on the home feed, public profile pages, shareable collection URLs, and a Hot Spots leaderboard.

## Technical Context

**Language/Version**: Java 21 (backend), TypeScript / Node 20 (frontend)
**Primary Dependencies**: Spring Data JPA (Follow, SpotLike entities); Redis (Hot Spots leaderboard cache TTL 1h, Following feed cache)
**Storage**: PostgreSQL (Follow, SpotLike tables; Spot.likeCount denormalized column)
**Testing**: JUnit 5 + MockMvc; integration tests for follow/like concurrency
**Target Platform**: Mobile browser
**Project Type**: Extension of existing web application
**Performance Goals**: Following tab ≤2s; Hot Spots ≤1s (cache); like action ≤500ms
**Constraints**: Like count updated atomically (SQL UPDATE spots SET like_count = like_count ± 1); Hot Spots cached hourly
**Scale/Scope**: Up to 1000 followers per user; Hot Spots top 20

## Constitution Check

| Principle | Gate | Status |
|-----------|------|--------|
| I. Zero-Friction | Saving from a recommendation card is one tap | ✅ Pass |
| II. Dual-Store | No Neo4j changes required (social graph in PostgreSQL) | ✅ Pass |
| III. AI-First | Not applicable | ✅ N/A |
| IV. Mobile-First | Profile pages and Following tab follow Vivid Atlas card/typography rules | ✅ Pass |
| V. Phased Delivery | Phase 3 scope only | ✅ Pass |

## Project Structure

### Documentation (this feature)

```text
specs/004-social-features/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── social.md
│   └── public-profile.md
└── tasks.md
```

### Source Code

```text
backend/src/main/java/com/favoritespot/
├── social/
│   ├── Follow.java / FollowRepository.java
│   ├── SpotLike.java / SpotLikeRepository.java
│   ├── SocialService.java             # follow, unfollow, like, unlike, getFollowingFeed
│   └── SocialController.java          # /api/social/* endpoints
├── leaderboard/
│   └── LeaderboardService.java        # Hot Spots (cached)
└── spot/
    └── Spot.java                      # Add likeCount field

frontend/
├── app/
│   ├── u/[username]/page.tsx          # Public profile
│   ├── feed/page.tsx                  # Add Following tab
│   └── hot/page.tsx                   # Hot Spots leaderboard
└── components/
    ├── FollowButton.tsx
    ├── LikeButton.tsx
    └── UserProfileHeader.tsx
```

## Complexity Tracking

*(No constitution violations requiring justification)*
