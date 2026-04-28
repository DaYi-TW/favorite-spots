# Feature Specification: Chrome Extension + LINE Bot + i18n

**Feature Branch**: `006-chrome-linebot-i18n`
**Created**: 2026-04-18
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Save Any Web Page with One Click via Chrome Extension (Priority: P1)

A logged-in user installs the Chrome Extension. While browsing any page (a blog post, Google Maps, Instagram), they click the extension icon in the browser toolbar. A popup shows the page URL pre-filled; the user clicks "Save" and the spot is parsed and added to their collection without leaving the current page.

**Why this priority**: The extension is the zero-friction entry point for desktop users — it eliminates the need to copy-paste URLs into the app manually.

**Independent Test**: Install extension. Navigate to a Google Maps place page. Click extension icon — confirm URL is pre-filled. Click Save — confirm the spot appears in the web app's feed within 5 seconds.

**Acceptance Scenarios**:

1. **Given** a logged-in user with the extension installed, **When** they click the extension icon on any page, **Then** a popup opens with the current page URL pre-filled.
2. **Given** the extension popup, **When** the user clicks "Save," **Then** the URL is sent to the backend for parsing and the spot is saved to their collection.
3. **Given** the extension popup after a successful save, **When** parsing completes, **Then** a success notification shows the spot name and a "View in App" link.
4. **Given** a user who is not logged in, **When** they click the extension icon, **Then** the popup shows a "Log in to Favorite Spots" prompt with a link to the web app.
5. **Given** a URL that fails to parse, **When** the extension save is triggered, **Then** the popup shows the manual input form inline.

---

### User Story 2 — Save Spots via LINE Bot (Priority: P2)

A user adds the official LINE Bot account. When they send any URL message to the Bot, it automatically parses the link and saves the spot to their collection, replying with a confirmation message showing the spot name, category, and a link to view it in the app.

**Why this priority**: LINE is the dominant messaging platform in Taiwan (the primary target market). The Bot enables saving spots from LINE's native share flow without opening a browser.

**Independent Test**: Send a Google Maps URL to the Bot. Confirm a reply arrives within 15 seconds showing the parsed spot name and category. Confirm the spot appears in the web app feed.

**Acceptance Scenarios**:

1. **Given** a registered user who has linked their LINE account, **When** they send a URL to the Bot, **Then** the Bot replies within 15 seconds with a confirmation showing spot name, category, and city.
2. **Given** a URL that cannot be parsed, **When** sent to the Bot, **Then** the Bot replies asking the user to add the spot manually via the web app, with a direct link.
3. **Given** a user who sends a non-URL message (e.g., "台南咖啡廳"), **When** the Bot receives it, **Then** the Bot replies with a list of their saved spots matching the keyword.
4. **Given** a LINE user who has not linked their account, **When** they message the Bot, **Then** the Bot replies with an account-linking URL.

---

### User Story 3 — Switch the App Language (Priority: P3)

A user can switch the app interface between Traditional Chinese (繁體中文), English, and Japanese (日本語) from the settings page. All UI text, category names, status labels, and error messages update immediately without a page reload.

**Why this priority**: Multi-language support opens the app to Japanese tourists visiting Taiwan and English-speaking expats, expanding the addressable market.

**Independent Test**: Switch language to English. Confirm all navigation labels, category names (e.g., "Café" not "咖啡廳"), and status labels (e.g., "Want to Go") are in English. Switch back to Chinese — confirm labels revert.

**Acceptance Scenarios**:

1. **Given** a user on the settings page, **When** they select a language, **Then** all UI text switches to that language without a full page reload.
2. **Given** a user who selected Japanese, **When** they restart the app, **Then** Japanese remains selected (language preference persisted).
3. **Given** translated content, **When** the selected language is English, **Then** category names, status labels, error messages, and navigation all display in English.

---

### Edge Cases

- What if the Chrome Extension's JWT token expires — does it prompt re-login?
- What if LINE's Messaging API is down when a user sends a URL?
- What if a translation key is missing for a newly added UI string?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Chrome Extension (Manifest V3) MUST inject the current page URL into its popup on activation.
- **FR-002**: Extension popup MUST authenticate via the same JWT cookie as the web app (shared auth domain).
- **FR-003**: Extension MUST show a manual input form in the popup when automatic parsing returns null name+address.
- **FR-004**: LINE Bot MUST use LINE Messaging API webhooks to receive messages and call the existing `POST /api/parse` + `POST /api/spots` backend endpoints.
- **FR-005**: LINE Bot MUST support keyword search replies using the existing `GET /api/spots?q=` endpoint.
- **FR-006**: LINE account linking MUST use OAuth 2.0 LINE Login to associate a LINE userId with a platform User account.
- **FR-007**: Frontend MUST support three locales: `zh-TW` (default), `en`, `ja`.
- **FR-008**: Language selection MUST be persisted in user preferences (stored in the User entity).
- **FR-009**: All user-visible strings MUST be defined in locale files (no hardcoded UI text).

### Key Entities

- **User** (extended): Add `preferredLocale` (VARCHAR 5, default `zh-TW`) and `lineUserId` (VARCHAR, nullable, unique).
- **Chrome Extension**: Standalone Manifest V3 package in `extension/` directory at repo root.
- **LINE Bot**: New Spring Boot controller `LineBotController` consuming LINE Messaging API webhooks.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Extension popup opens within 500 milliseconds of clicking the icon.
- **SC-002**: Spot is saved from the extension within 10 seconds of clicking "Save" (same as web app SLA).
- **SC-003**: LINE Bot replies within 15 seconds for 95% of URL messages.
- **SC-004**: Language switch applies to all visible UI text within 200 milliseconds.
- **SC-005**: Zero hardcoded UI strings remain in the codebase after i18n implementation.

## Assumptions

- Chrome Extension shares the same authentication domain as the web app; the JWT HttpOnly cookie is accessible to the extension popup via the same origin.
- LINE Bot webhook endpoint is publicly accessible (via ngrok in development, production URL in deployment).
- i18n library: `next-intl` for Next.js frontend; `Spring MessageSource` for backend error messages.
- Japanese translations are machine-translated initially; professional review is out of scope for Phase 4.
- Extension supports Chrome and Chromium-based browsers (Edge, Brave); Safari extension is future scope.
