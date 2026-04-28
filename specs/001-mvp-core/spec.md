# Feature Specification: MVP Core

**Feature Branch**: `001-mvp-core`
**Created**: 2026-04-18
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register and Log In (Priority: P1)

A new user visits the app, creates an account with email and password, and logs in. After logging in, they see their (empty) home feed and remain authenticated across page refreshes.

**Why this priority**: Every other story depends on an authenticated user. Without auth, no spot can be saved or retrieved.

**Independent Test**: Register a new account, log out, log in again, and verify the home feed loads with a welcome state.

**Acceptance Scenarios**:

1. **Given** a visitor on the registration page, **When** they submit a valid email + password, **Then** an account is created and they are redirected to the home feed.
2. **Given** a registered user on the login page, **When** they submit correct credentials, **Then** they are authenticated and see their home feed.
3. **Given** a logged-in user who refreshes the page, **When** their session token is still valid, **Then** they remain logged in without re-entering credentials.
4. **Given** a user who submits an already-registered email, **When** they try to register, **Then** they see a clear error message.
5. **Given** a user who submits wrong credentials, **When** they try to log in, **Then** they see a clear error without revealing which field is wrong.

---

### User Story 2 - Paste a Link and Save a Spot (Priority: P1)

A logged-in user pastes any URL (Google Maps, blog, Instagram, etc.) into an input field. The system automatically extracts the spot's name, address, category, city, cover image, and style tags. The user reviews the parsed result, optionally edits fields, and saves the spot to their collection.

**Why this priority**: This is the core value proposition — "paste the link, let the system do the rest."

**Independent Test**: Paste a Google Maps URL; verify the parsed preview shows name, address, category, and at least one style tag; save the spot; verify it appears on the home feed.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the "Add Spot" screen, **When** they paste a URL and submit, **Then** within 10 seconds the system displays a parsed preview with name, address, category, city, and cover image pre-filled.
2. **Given** a parsed preview is displayed, **When** the user confirms without editing, **Then** the spot is saved and appears on the home feed.
3. **Given** a parsed preview is displayed, **When** the user edits any field before saving, **Then** the saved spot reflects the edited values.
4. **Given** the same URL has been parsed before by any user, **When** it is submitted again, **Then** the preview appears immediately (no re-parsing delay).
5. **Given** a URL that cannot be parsed automatically (e.g., private Instagram post), **When** parsing fails, **Then** an empty manual form is shown with a clear explanation and the user can fill it in.
6. **Given** a spot is saved, **When** the user views it, **Then** it has a default status of "Want to Go."

---

### User Story 3 - Browse and Filter the Home Feed (Priority: P2)

A logged-in user sees all their saved spots displayed as visual cards in a Pinterest-style masonry grid. They can filter by category, city, and status (Want to Go / Visited), and search by keyword.

**Why this priority**: The home feed is the primary discovery surface. Without it, saved spots have no visual value.

**Independent Test**: Save 3+ spots with different categories; verify the grid displays them; apply a category filter and verify only matching spots are shown.

**Acceptance Scenarios**:

1. **Given** a logged-in user with saved spots, **When** they visit the home feed, **Then** all spots are shown as cards with cover image, name, category, city, and status visible.
2. **Given** the home feed, **When** the user selects a category filter, **Then** only spots matching that category are shown.
3. **Given** the home feed, **When** the user selects a status filter ("Want to Go" or "Visited"), **Then** only spots with that status are shown.
4. **Given** the home feed, **When** the user types in the search box, **Then** only spots whose name, address, or tags contain the keyword are shown.
5. **Given** a user with no saved spots, **When** they visit the home feed, **Then** they see an empty-state prompt encouraging them to add their first spot.

---

### User Story 4 - View Spot Details and Toggle Status (Priority: P2)

A user taps a spot card to see its full detail page: cover image, name, address, category, city, all style tags, personal rating, personal note, and source URLs. They can toggle the status between "Want to Go" and "Visited."

**Why this priority**: Detail and status management complete the core CRUD loop and are needed before any social or graph features.

**Independent Test**: Save a spot, open its detail page, toggle status to "Visited," and verify the change persists after refreshing.

**Acceptance Scenarios**:

1. **Given** a saved spot, **When** the user taps its card, **Then** the detail page shows all fields: image, name, address, category, city, tags, status, rating, note, source URLs.
2. **Given** a spot with status "Want to Go," **When** the user taps the status toggle, **Then** the status changes to "Visited" and is persisted.
3. **Given** a spot detail page, **When** the user edits the personal note or rating and saves, **Then** the changes are persisted.
4. **Given** a spot detail page, **When** the user taps "Delete," **Then** a confirmation is shown; upon confirming, the spot is removed from the feed.

---

### Edge Cases

- What happens when a URL redirects multiple times before reaching the final page?
- How does the system handle URLs with no extractable content (e.g., a bare domain)?
- What if the Claude API is unavailable during parsing?
- What if the user pastes a duplicate URL for a spot they've already saved?
- What if cover image URL from scraping is broken or inaccessible?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with a unique email and a password (minimum 8 characters).
- **FR-002**: System MUST authenticate users and issue a session token that persists across page refreshes.
- **FR-003**: System MUST accept any valid URL as input for spot creation.
- **FR-004**: System MUST attempt to extract spot name, address, category, city, cover image, and style tags from the submitted URL.
- **FR-005**: System MUST cache parse results so the same URL is never re-parsed during the same user session.
- **FR-006**: System MUST present a manual input form when automatic parsing fails to extract a name and address.
- **FR-007**: System MUST allow the user to edit any auto-parsed field before saving.
- **FR-008**: System MUST store each saved spot with a category (one of: Restaurant, Café, Dessert, Attraction, Hotel, Bar) and a status (Want to Go or Visited).
- **FR-009**: System MUST display saved spots as visual cards on the home feed, ordered by most recently added.
- **FR-010**: System MUST support filtering the home feed by category, city, and status.
- **FR-011**: System MUST support keyword search across spot name, address, and tags.
- **FR-012**: System MUST allow the user to toggle a spot's status between "Want to Go" and "Visited."
- **FR-013**: System MUST allow the user to edit personal rating (1–5) and personal note on any saved spot.
- **FR-014**: System MUST allow the user to delete a spot after confirming intent.
- **FR-015**: System MUST display an empty-state message when a user has no saved spots.

### Key Entities

- **User**: Represents an account. Has email, hashed password, username, public/private flag, creation date.
- **Spot**: Represents a saved place. Belongs to a User. Has name, address, city, category, status, cover image, personal rating, personal note, public flag, creation date.
- **SpotSource**: A URL linked to a Spot (one spot may have multiple source links). Has source type (Instagram, TikTok, YouTube, Google Maps, Blog) and parsed timestamp.
- **Tag**: A style or custom label. Has name and type (Style = AI-suggested, Custom = user-defined).
- **ParseCache**: A cached parse result keyed by normalized URL. Prevents duplicate AI/scraping calls.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete registration and save their first spot in under 3 minutes from landing on the app.
- **SC-002**: A previously parsed URL produces a spot preview in under 1 second.
- **SC-003**: A new URL produces a spot preview within 10 seconds in 95% of cases.
- **SC-004**: The home feed loads all cards within 2 seconds for a collection of up to 200 spots.
- **SC-005**: Users can filter or search their collection and see results update within 500 milliseconds.
- **SC-006**: 100% of saved spots are retrievable and display correctly after a page refresh.

## Assumptions

- Users have a modern mobile browser (iOS Safari 15+ or Android Chrome 105+); no native app required in Phase 1.
- The app is single-user per account in Phase 1; sharing and social features are Phase 3 scope.
- Google Maps link resolution uses URL redirect-following rather than the Places API (to avoid API key dependency in Phase 1).
- AI-suggested style tags are presented as chips that the user can accept or dismiss individually; they are not automatically saved without user interaction.
- Cover images sourced from scraped pages are stored as external URLs, not uploaded/proxied, in Phase 1.
- The "public profile" endpoint exists in the data model but is not surfaced in the UI until Phase 3.
