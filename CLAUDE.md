# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Favorite Spots Knowledge Graph** (brand name: **Curator** / **Vivid Atlas**) is a mobile-first web app where users paste any URL (Instagram, TikTok, YouTube, Google Maps, blogs) and the system auto-parses spot details via AI, stores them, and visualizes relationships as an interactive knowledge graph.

Core flow: User pastes URL → Web scraping (Jsoup) + AI extraction (Claude API) → Stored in PostgreSQL + Neo4j → Displayed as card wall or knowledge graph.

## Repository Contents

This repo is currently in the **design/planning phase**. No implementation code exists yet. The repo contains:

- `favorite-spots-design-proposal.md` — Original Chinese-language design proposal
- `stitch_favorite_spot_knowledge_graph/` — UI mockups, PRD, and design system
  - `home_discovery/code.html` — Home feed (Pinterest card wall)
  - `add_new_spot/code.html` — Link-paste + parse flow
  - `spot_details_the_roastery/code.html` — Spot detail page
  - `knowledge_graph_explorer/code.html` — Interactive graph visualization
  - `vivid_atlas/DESIGN.md` — Full design system spec ("The Intelligent Curator")
  - `project_proposal_favorite_spots_knowledge_graph.md` — English project proposal

## Planned Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.x, Java 21 |
| Primary DB | PostgreSQL + Spring Data JPA |
| Graph DB | Neo4j + Spring Data Neo4j |
| Cache | Redis (parsed link results) |
| Auth | Spring Security + JWT |
| Web Scraping | Jsoup |
| AI Extraction | Claude API |
| Frontend | React + Next.js (mobile-first) |
| Deployment | Docker + Docker Compose |

## Architecture

```
React/Next.js (mobile-first)
        ↓ HTTPS
Spring Boot API Server
  ├── Auth API (JWT)
  ├── Spot API (CRUD)
  ├── Graph API (Neo4j queries)
  └── Link Parser Service
        ├── Web Scraper (Jsoup) — Open Graph meta tags, title, image, address
        └── AI Extractor (Claude API) — name, category, region, style tags
        ↓
  ┌─────────┬──────────┬─────────┐
PostgreSQL   Neo4j     Redis
(users,      (graph    (parse
 spots)      rels)     cache)
```

## Data Models

**PostgreSQL entities:** `User`, `Spot`, `SpotSource`, `Tag`, `SpotTag`

**Spot fields:** name, address, city, category (`RESTAURANT/CAFE/DESSERT/ATTRACTION/HOTEL/BAR`), status (`WANT_TO_GO/VISITED`), cover_image_url, personal_rating (1–5), personal_note, is_public

**Neo4j nodes:** `(:Spot)`, `(:Tag)`, `(:City)`

**Neo4j relationships:**
- `(:Spot)-[:HAS_TAG]->(:Tag)`
- `(:Spot)-[:LOCATED_IN]->(:City)`
- `(:Spot)-[:SAME_CATEGORY]->(:Spot)`
- `(:Spot)-[:SIMILAR_STYLE {sharedTags}]->(:Spot)`
- `(:Spot)-[:FROM_SAME_SOURCE {sourceUrl}]->(:Spot)`

## API Endpoints

- `POST /api/auth/register` / `POST /api/auth/login` — JWT auth
- `POST /api/parse` — parse a URL, return preview (result cached in Redis)
- `GET/POST /api/spots` — list with filters / create spot
- `GET/PUT/DELETE /api/spots/{id}` — spot CRUD
- `PATCH /api/spots/{id}/status` — toggle WANT_TO_GO / VISITED
- `GET /api/graph/spot/{id}` — spot's knowledge graph (max 2 hops)
- `GET /api/graph/related/{id}` — related spot recommendations
- `GET /api/public/{username}` — public profile page

## Design System (vivid_atlas/DESIGN.md)

The UI mockups in `stitch_favorite_spot_knowledge_graph/` implement this design system. When building frontend components, follow these rules:

**Colors (Tailwind tokens already in mockup HTML):**
- Primary / Electric Indigo: `#4b3fe2`
- Surface (canvas): `#f5f6f7` — never use pure white as the base
- On-Surface text: `#2c2f30` — never use pure black

**The "No-Line" Rule:** 1px solid borders are prohibited for sectioning. Use background color shifts between surface tiers instead.

**Typography:**
- Headlines/Display: **Plus Jakarta Sans** (bold, tight tracking)
- Body/Labels: **Manrope** (readable at small sizes)

**Cards:** `xl` radius (1.5rem/24px), full-bleed imagery, no dividers inside.

**Graph Nodes:** `primary` (#4b3fe2) core + 20% opacity `primary_container` (#9895ff) outer glow.

**Buttons:** Pill-shaped (`rounded-full`), primary uses indigo gradient at 135°, scale to 0.96 on tap.

**Elevation:** Tonal layering only — no standard drop shadows. Use ambient shadows with 30px+ blur at ≤6% opacity when float is needed.

## Key Design Decisions

- **Redis caches link parse results** to avoid repeated Claude API calls for the same URL
- **Graph depth limited to 2 hops** in Neo4j queries for performance; add Neo4j indexes on frequently queried properties
- **Instagram/TikTok anti-scraping**: prioritize parsing Open Graph meta tags; fall back to manual input when scraping fails
- **Google Maps links**: use Google Places API or follow redirects to extract place data
- **AI parsing supports multilingual** content (Chinese, Japanese, English) with auto-detection

## Development Phases

1. Spring Boot init, PostgreSQL + JPA entities, JWT auth, basic CRUD
2. Jsoup scraping, Claude API integration, Redis caching, multi-platform URL support
3. Neo4j setup, Spring Data Neo4j, auto-relationship building, Graph API
4. React frontend (card wall + D3.js/vis.js graph visualization), JUnit + MockMvc tests, Docker Compose
5. Social features, map mode (Google Maps API), AI recommendations
6. Chrome Extension (Manifest V3), LINE Bot (LINE Messaging API), i18n (i18next)

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
