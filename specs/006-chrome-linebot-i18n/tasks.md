# Tasks: Chrome Extension + LINE Bot + i18n

**Input**: `specs/006-chrome-linebot-i18n/`
**Branch**: `006-chrome-linebot-i18n`
**Prerequisite**: `001-mvp-core` fully implemented

## Phase 1: Setup
- [ ] T001 Create `extension/` directory at repo root; initialize Vite project with `@crxjs/vite-plugin` and TypeScript
- [ ] T002 [P] Add `line-bot-spring-boot` dependency to `backend/pom.xml`
- [ ] T003 [P] Add `next-intl` to `frontend/package.json`
- [ ] T004 [P] Add `preferredLocale VARCHAR(5) DEFAULT 'zh-TW'` and `line_user_id VARCHAR(64) UNIQUE NULLABLE` columns to users table via Flyway migration `V12__add_user_locale_line.sql`
- [ ] T005 [P] Create locale message files: `frontend/messages/zh-TW.json`, `en.json`, `ja.json` with all current hardcoded UI strings

## Phase 2: Foundational
- [ ] T006 Configure next-intl in `frontend/i18n.ts` and `frontend/app/[locale]/layout.tsx`; set up `prefix: 'as-needed'` routing middleware in `frontend/middleware.ts`
- [ ] T007 [P] Add `lineUserId`, `preferredLocale` fields to `User.java` JPA entity
- [ ] T008 [P] Create `extension/manifest.json` (Manifest V3) with `permissions: ["activeTab", "cookies"]` and popup definition

**Checkpoint**: next-intl routing works; User entity updated; extension manifest valid

## Phase 3: User Story 1 — Chrome Extension (P1) 🎯
- [ ] T009 [US1] Create `extension/src/background/service-worker.ts` — listens for extension icon click, sends current tab URL to popup via chrome.runtime.sendMessage
- [ ] T010 [US1] Create `extension/src/popup/popup.html` + `popup.ts` — shows current URL pre-filled; calls `POST /api/parse` then `POST /api/spots` on Save; shows success with spot name + "View in App" link; shows manual form on parse failure; shows login prompt if unauthenticated (401)
- [ ] T011 [US1] Create `extension/src/api/client.ts` — Axios instance pointing to `https://favoritespot.app`; cookie-based auth (credentials: 'include')
- [ ] T012 [US1] Build extension package: `npm run build` outputs to `extension/dist/` ready for Chrome

**Checkpoint**: Extension installed, opens popup with URL, saves spot to backend

## Phase 4: User Story 2 — LINE Bot (P2)
- [ ] T013 [US2] Create `LineBotConfig.java` — Spring Boot config for LINE channel secret + access token from env vars
- [ ] T014 [US2] Create `LineBotService.java` — `handleUrlMessage(lineUserId, url)`: lookup linked User, call `LinkParserService` + `SpotService`, return confirmation text; `handleKeywordMessage(lineUserId, keyword)`: call `GET /api/spots?q=`, return list; `handleUnlinkedUser(lineUserId)`: return account-linking URL
- [ ] T015 [US2] Create `LineBotController.java` — `POST /api/linebot/webhook`; LINE SDK handles signature verification; routes to `LineBotService`
- [ ] T016 [US2] Add `POST /api/auth/line/link` endpoint to `AuthController` — OAuth LINE Login callback that associates `lineUserId` with authenticated User

**Checkpoint**: LINE Bot replies to URL messages with parsed spot confirmation

## Phase 5: User Story 3 — i18n (P3)
- [ ] T017 [US3] Replace all hardcoded strings in frontend components with `useTranslations()` calls (SpotCard, FilterBar, ParsePreview, auth pages, navigation)
- [ ] T018 [P] [US3] Add language selector to `frontend/app/settings/page.tsx` — calls `PATCH /api/users/me/locale`; stores preference server-side and in cookie for SSR
- [ ] T019 [P] [US3] Add `PATCH /api/users/me/locale` endpoint to backend `UserController`
- [ ] T020 [US3] Validate zero hardcoded UI strings remain: run `grep -r "\"[A-Z]" frontend/components` and confirm no matches outside locale files

**Checkpoint**: All three locales switchable; preference persists across sessions

## Phase 6: Polish
- [ ] T021 [P] Write `LineBotControllerTest` — verify webhook signature rejection for invalid signatures; URL message routing to parse flow
- [ ] T022 [P] Write extension Jest test for `popup.ts` — verify login prompt shown on 401 response
- [ ] T023 [P] Verify all translation keys exist in all 3 locale files (write a script or test that loads all 3 JSON files and checks key parity)
