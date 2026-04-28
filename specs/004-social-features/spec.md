# Feature Specification: Social Features

**Feature Branch**: `004-social-features`
**Created**: 2026-04-18
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Follow Other Users and View Their Collections (Priority: P1)

A logged-in user visits another user's public profile page (via a shareable URL). They can see the other user's public spot collection as a card grid. They can tap "Follow" to follow that user. On their home feed, a "Following" tab shows spots recently saved by people they follow.

**Why this priority**: Following is the social graph backbone — without it, the activity feed and discovery of other users' collections is impossible.

**Independent Test**: User A follows User B. User B saves a new spot. On User A's home feed, switch to "Following" tab — confirm User B's new spot appears.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they visit `/u/{username}`, **Then** they see that user's public spots as a card grid and a "Follow" button if not already following.
2. **Given** a user who taps "Follow," **When** the action completes, **Then** the button changes to "Following" and the follow count on the profile increments.
3. **Given** a user who follows others, **When** they view the "Following" tab on the home feed, **Then** they see spots recently saved by followed users in reverse chronological order.
4. **Given** a user on their own profile, **When** they view it, **Then** they see their follower count, following count, and all their public spots.
5. **Given** a user with `is_public = false` spots, **When** another user views their profile, **Then** only public spots are shown.

---

### User Story 2 — Like Spots (Priority: P2)

A logged-in user can tap a heart icon on any public spot card (on the home feed, Following tab, or another user's profile) to like it. The like count is visible on the card. The user can unlike by tapping again. A "Hot Spots" page shows the top 20 most-liked public spots across all users.

**Why this priority**: Likes are the simplest social signal that drives curation quality and surfaces popular content.

**Independent Test**: User A likes a spot 3 times via toggle (like → unlike → like). Confirm final like count is 1. Confirm the spot appears on the Hot Spots leaderboard if it has the most likes.

**Acceptance Scenarios**:

1. **Given** a public spot card, **When** the user taps the heart icon, **Then** the like count increments and the heart fills to indicate liked state.
2. **Given** a liked spot, **When** the user taps the heart again, **Then** the like is removed and the count decrements.
3. **Given** the Hot Spots page, **When** it loads, **Then** up to 20 public spots are shown ranked by total like count (descending), refreshed hourly.
4. **Given** a spot on the Hot Spots page, **When** the user taps it, **Then** they navigate to that spot's detail page (even if it belongs to another user).

---

### User Story 3 — Share a Public Collection (Priority: P2)

A logged-in user can generate a shareable link to their public collection. Anyone (including non-logged-in visitors) can open the link and browse the user's public spots as a read-only card grid.

**Why this priority**: Shareable collections are the primary growth vector — users share links with friends, driving new sign-ups.

**Independent Test**: Copy the public profile URL. Open it in an incognito browser (not logged in). Confirm public spots are visible; confirm private spots are hidden; confirm no edit controls appear.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they tap "Share Collection" on their profile, **Then** a shareable URL (`/u/{username}`) is copied to clipboard.
2. **Given** a visitor (not logged in) opening `/u/{username}`, **Then** only public spots are shown as a read-only card grid with no save/edit controls.
3. **Given** a visitor on a public profile, **When** they tap "Sign up to save this spot," **Then** they are redirected to the registration page.

---

### Edge Cases

- What if a user unfollows someone — do their spots disappear from the Following tab?
- What if a spot owner changes `is_public` to false after others have liked it?
- What happens to like counts if a spot is deleted?
- Can a user follow themselves?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose public user profiles at `/u/{username}` showing only `is_public = true` spots.
- **FR-002**: System MUST allow a logged-in user to follow/unfollow another user; a user cannot follow themselves.
- **FR-003**: The home feed MUST have a "Following" tab showing spots saved by followed users in reverse chronological order (most recent 50).
- **FR-004**: System MUST allow liking/unliking any public spot; each user can like a spot at most once.
- **FR-005**: System MUST expose a "Hot Spots" page showing top 20 most-liked public spots, refreshed hourly (cached).
- **FR-006**: Public profiles MUST be accessible to unauthenticated visitors.
- **FR-007**: Unauthenticated visitors MUST see a prompt to register when interacting with save/like controls.
- **FR-008**: A user's follower count, following count, and public spot count MUST be visible on their profile.

### Key Entities

- **Follow**: `{followerId, followeeId, createdAt}` — PK(followerId, followeeId)
- **SpotLike**: `{userId, spotId, createdAt}` — PK(userId, spotId)
- **Spot** (extended): Add `likeCount` (integer, denormalized for read performance)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Following tab loads within 2 seconds showing the 50 most recent spots from followed users.
- **SC-002**: Hot Spots page loads within 1 second (served from cache).
- **SC-003**: Like/unlike action completes and the count updates within 500 milliseconds.
- **SC-004**: Public profile page is accessible to unauthenticated users with no login prompt blocking the view.

## Assumptions

- Follow relationships are one-directional (A follows B ≠ B follows A).
- Like counts are denormalized onto the Spot row for fast read; incremented/decremented atomically.
- The "Following" tab shows at most 50 spots to keep the feed fast; no infinite scroll in Phase 3.
- Hot Spots leaderboard is global (all users), not per-city or per-category in Phase 3.
