# Research: Chrome Extension + LINE Bot + i18n
**Feature**: 006 | **Date**: 2026-04-18

## Decision Log

### 1. i18n Library: next-intl vs react-i18next
- **Decision**: **next-intl**
- **Rationale**: next-intl is built specifically for Next.js App Router with Server Component support. It handles locale routing, Server Component message access, and Client Component hydration without boilerplate. react-i18next requires manual setup for RSC.
- **Alternatives**: react-i18next (works but requires additional RSC bridge config), next-translate (less maintained).

### 2. Extension Auth: Shared Cookie vs Extension OAuth
- **Decision**: **Shared HttpOnly cookie** — extension popup communicates with the same backend origin, so the cookie is automatically sent with every API request.
- **Rationale**: Zero additional auth flow. The extension popup is a small HTML page served from the extension package; it calls the same `https://favoritespot.app` API origin, where the cookie is already valid.
- **Alternatives**: Extension-specific OAuth (duplicates auth flow), API token in extension storage (less secure than HttpOnly cookie).

### 3. Extension Build Tool: Vite vs Webpack
- **Decision**: **Vite** with `@crxjs/vite-plugin`
- **Rationale**: Faster HMR during extension development. `@crxjs/vite-plugin` handles Manifest V3 service worker bundling automatically.
- **Alternatives**: Webpack + webextension-webpack-plugin (more config, slower builds).

### 4. LINE Bot Framework
- **Decision**: **line-bot-sdk-java** Spring Boot starter (`com.linecorp.bot:line-bot-spring-boot`)
- **Rationale**: Official SDK with Spring Boot auto-configuration. Handles webhook signature verification, message parsing, and reply API automatically.
- **Alternatives**: Raw HTTP webhook (manual signature verification, more error-prone).

### 5. Locale Routing
- **Decision**: next-intl locale prefix strategy: `prefix: 'as-needed'` — default locale (`zh-TW`) has no prefix (`/feed`), other locales are prefixed (`/en/feed`, `/ja/feed`).
- **Rationale**: Clean URLs for the primary market (Taiwan), standard prefix for secondary markets.
