# Favorite Spots — Knowledge Graph Explorer

> Paste any URL. Let AI do the rest.

A mobile-first web app that turns your saved links — Instagram reels, TikTok videos, Google Maps pins — into a living, breathing knowledge graph of places you love.

---

## What it does

1. **Paste a URL** — Instagram, TikTok, Google Maps, or any webpage
2. **AI parses it** — OG tags + Claude API extract the spot name, city, category, and tags automatically
3. **Stores it everywhere** — PostgreSQL for structured data, Neo4j for relationships
4. **Visualize connections** — explore your collection as an interactive knowledge graph

---

## Features

- **Smart link parser** — Jsoup OG tag extraction with Claude API fallback
- **Card wall feed** — filter by category, status, city; paginated
- **Knowledge Graph Explorer** — vis.js interactive graph, 2-hop relationship traversal
- **Related spot suggestions** — AI-ranked recommendations based on shared tags and location
- **JWT auth** — HttpOnly cookie sessions, no localStorage tokens
- **Redis caching** — parsed links cached 24h by SHA-256 URL hash

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
| Backend | Spring Boot 3.4.4, Java 21 |
| Primary DB | PostgreSQL + Flyway migrations |
| Graph DB | Neo4j |
| Cache | Redis |
| AI | Claude API (Anthropic) |
| Infra | Docker Compose |

---

## Quick Start

```bash
# Clone and start all services
git clone https://github.com/DaYi-TW/favorite-spots.git
cd favorite-spots
docker compose up -d
```

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| API | http://localhost:8080 |
| Neo4j Browser | http://localhost:7474 |

---

## Development

**Backend**
```bash
cd backend
mvn spring-boot:run
```

**Frontend**
```bash
cd frontend
npm install && npm run dev
```

---

## Roadmap

- [x] Auth + Spot CRUD + Link Parser + Card Feed
- [x] Neo4j dual-store + Graph API + vis.js visualization
- [ ] Map View + AI Recommendations
- [ ] Social features (follow, likes, hot spots)
- [ ] Photo upload (S3) + Thematic Collections
- [ ] Chrome Extension + LINE Bot + i18n (zh-TW / en / ja)

---

## Design

Brand: **Vivid Atlas** — Electric Indigo (`#4b3fe2`), Plus Jakarta Sans headlines, Manrope body text. Cards are full-bleed with rounded corners, no dividers. Graph nodes glow.
