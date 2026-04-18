# Design Proposal：店家收藏知識圖譜系統
Favorite Spots Knowledge Graph

## 1. Project Overview
Modern people discover favorite spots across multiple platforms (IG, Google Maps, Blogs), but information is scattered. This system allows users to paste a link, auto-parse details via AI, and visualize connections via a Knowledge Graph.

### Core Value Proposition
"Paste the link, let the system do the rest."
- Zero-friction collection.
- Intelligent AI parsing.
- Visual Knowledge Graph.
- Card-based exploration (Mobile First).

## 2. Target Users
- **Primary:** Mobile users who love exploring food, cafes, and attractions.
- **Secondary:** Visitors browsing public collections.

## 3. Functional Planning (MVP)
### Link Parsing Engine
- Supports IG, TikTok, YouTube, Google Maps, Blogs.
- Web scraping + AI extraction (Name, Address, Category, Style, etc.).

### Spot Management
- Auto-filled fields + manual notes/ratings.
- Multiple source links for one spot.

### Classification & Tags
- Categories: Restaurant, Cafe, Dessert, Attraction, Hotel, Bar.
- AI-suggested style tags (Vintage, Minimalist, etc.).

### Knowledge Graph
- Nodes: Spots.
- Relationships: Same Category, Same Area, Similar Style, Same Source.
- Interactive visualization.

### Home Feed
- Pinterest-style cards.
- Filters and Search.

## 4. Technical Stack
- **Backend:** Spring Boot 3.x, Java 21.
- **Databases:** PostgreSQL (Core), Neo4j (Graph), Redis (Cache).
- **AI:** Claude API for extraction.
- **Frontend:** React + Next.js (Mobile First).

## 5. Data Model
- **PostgreSQL:** User, Spot, SpotSource, Tag.
- **Neo4j:** Nodes (Spot, Tag, City) and Relationships (HAS_TAG, LOCATED_IN, SIMILAR_STYLE).

---
Document version: 1.0 | Last updated: 2026-04-18