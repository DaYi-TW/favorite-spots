# Tasks: Social Features

**Input**: `specs/004-social-features/`
**Branch**: `004-social-features`
**Prerequisite**: `001-mvp-core` fully implemented

## Phase 1: Setup
- [ ] T001 Create Flyway migrations: `V6__create_follows.sql` (follows table with PK(follower_id, followee_id), index on followee_id) and `V7__create_spot_likes.sql` (spot_likes PK(user_id, spot_id))
- [ ] T002 Add `like_count INTEGER DEFAULT 0` column to spots table via `V8__add_spot_like_count.sql`

## Phase 2: Foundational
- [ ] T003 [P] Create `Follow.java` JPA entity and `FollowRepository.java` in `backend/.../social/`
- [ ] T004 [P] Create `SpotLike.java` JPA entity and `SpotLikeRepository.java` in `backend/.../social/`
- [ ] T005 Add `likeCount` field to `Spot.java` entity

**Checkpoint**: DB schema ready; entities defined

## Phase 3: User Story 1 — Follow + Following Feed (P1) 🎯
- [ ] T006 [US1] Create `SocialService.java` — `follow(followerId, followeeId)`, `unfollow`, `getFollowingFeed(userId)` (50 most recent spots from followees), `getFollowerCount`, `getFollowingCount`
- [ ] T007 [US1] Create `SocialController.java` — `POST /api/social/follow/{userId}`, `DELETE /api/social/follow/{userId}`, `GET /api/social/following-feed`
- [ ] T008 [P] [US1] Create `frontend/app/u/[username]/page.tsx` — public profile: UserProfileHeader (avatar, username, follower/following counts, Follow button), public spot grid
- [ ] T009 [P] [US1] Create `frontend/components/FollowButton.tsx` — Follow/Following toggle; calls social API
- [ ] T010 [US1] Add "Following" tab to `frontend/app/feed/page.tsx` alongside "My Spots" tab; fetch `/api/social/following-feed`

**Checkpoint**: Follow/unfollow works; Following tab shows followed users' spots

## Phase 4: User Story 2 — Likes + Hot Spots (P2)
- [ ] T011 [US2] Add `like(userId, spotId)` and `unlike` to `SocialService.java` — atomic `UPDATE spots SET like_count = like_count ± 1`
- [ ] T012 [US2] Add `POST /api/spots/{id}/like` and `DELETE /api/spots/{id}/like` to `SocialController.java`
- [ ] T013 [US2] Create `LeaderboardService.java` — `getHotSpots()` top 20 public spots by like_count, cached in Redis `leaderboard:hot` TTL 3600s
- [ ] T014 [US2] Add `GET /api/leaderboard/hot` to a new `LeaderboardController.java`
- [ ] T015 [P] [US2] Create `frontend/components/LikeButton.tsx` — heart icon with count; optimistic update
- [ ] T016 [P] [US2] Create `frontend/app/hot/page.tsx` — Hot Spots leaderboard page; fetch `/api/leaderboard/hot`

**Checkpoint**: Likes work; Hot Spots page shows top 20

## Phase 5: User Story 3 — Shareable Public Collections (P2)
- [ ] T017 [US3] Add `GET /api/public/{username}` endpoint — returns user's public spots (unauthenticated accessible)
- [ ] T018 [US3] Create `frontend/app/u/[username]/page.tsx` accessible without auth — read-only card grid; "Sign up to save" CTA for unauthenticated visitors

**Checkpoint**: Public profile URL shareable and accessible without login

## Phase 6: Polish
- [ ] T019 [P] Write `SocialServiceTest` — verify self-follow is rejected; atomic like count update
- [ ] T020 [P] Add like button to SpotCard when viewing other users' public spots
