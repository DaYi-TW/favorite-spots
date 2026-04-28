# Implementation Plan: Chrome Extension + LINE Bot + i18n

**Branch**: `006-chrome-linebot-i18n` | **Date**: 2026-04-18 | **Spec**: [spec.md](spec.md)

## Summary

Build a Manifest V3 Chrome Extension for one-click spot saving from any web page, integrate a LINE Bot using LINE Messaging API webhooks, and add full i18n support (zh-TW / en / ja) to the Next.js frontend using next-intl and Spring MessageSource for backend error messages.

## Technical Context

**Language/Version**: Java 21 (backend), TypeScript / Node 20 (frontend + extension)
**Primary Dependencies**: LINE Messaging API Java SDK (`com.linecorp.bot:line-bot-spring-boot`), next-intl (Next.js i18n), Chrome Extension Manifest V3 (TypeScript + Vite build)
**Storage**: PostgreSQL (User.preferredLocale, User.lineUserId)
**Testing**: JUnit 5 + MockMvc (LINE webhook controller); Jest (extension popup unit tests)
**Target Platform**: Chrome/Chromium browsers (extension); LINE mobile app (bot); all platforms (i18n)
**Project Type**: Three parallel workstreams: extension package + backend LINE integration + frontend i18n
**Performance Goals**: Extension popup ≤500ms; LINE Bot reply ≤15s; language switch ≤200ms
**Constraints**: Extension shares JWT auth domain with web app; LINE webhook must be on public HTTPS URL; no hardcoded UI strings after i18n
**Scale/Scope**: Three locales; one extension manifest; one LINE Bot account

## Constitution Check

| Principle | Gate | Status |
|-----------|------|--------|
| I. Zero-Friction | Extension is one-click save; LINE Bot requires only sending a URL | ✅ Pass |
| II. Dual-Store | Extension and Bot both use existing backend API — no DB changes beyond User fields | ✅ Pass |
| III. AI-First | Extension and Bot reuse existing `POST /api/parse` endpoint — same parse pipeline | ✅ Pass |
| IV. Mobile-First | i18n strings include all Vivid Atlas UI labels; extension popup is a focused mini-UI | ✅ Pass |
| V. Phased Delivery | Phase 4 scope only | ✅ Pass |

## Project Structure

### Documentation (this feature)

```text
specs/006-chrome-linebot-i18n/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── linebot.md
│   └── i18n.md
└── tasks.md
```

### Source Code

```text
extension/                              # Chrome Extension (Manifest V3)
├── manifest.json
├── src/
│   ├── popup/popup.html + popup.ts    # Extension popup UI
│   ├── background/service-worker.ts   # Fetch current tab URL
│   └── api/client.ts                  # Calls backend API
└── vite.config.ts

backend/src/main/java/com/favoritespot/
├── linebot/
│   ├── LineBotController.java         # POST /api/linebot/webhook
│   ├── LineBotService.java            # Parse URL messages, keyword search, account linking
│   └── LineBotConfig.java             # Channel secret + access token
└── user/
    └── User.java                      # Add preferredLocale, lineUserId fields

frontend/
├── messages/
│   ├── zh-TW.json                     # Traditional Chinese (default)
│   ├── en.json                        # English
│   └── ja.json                        # Japanese
├── app/
│   └── [locale]/layout.tsx            # next-intl locale routing
└── i18n.ts                            # next-intl config
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Three separate workstreams (Extension + LINE Bot + i18n) | All three are Phase 4 platform-expansion items with no internal dependencies | Splitting into separate features would create artificial sequencing; they share only the User entity change |
