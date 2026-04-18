# Design Proposal：店家收藏知識圖譜系統
**Favorite Spots Knowledge Graph**

---

## 1. 專案概述

### 1.1 背景與動機

現代人習慣從多種管道發現喜歡的店家，包括 Instagram 短影音、Google Map、部落格文章等。然而這些資訊散落在各平台，缺乏一個統一整理、結構化呈現的工具。

本系統旨在讓使用者只需貼上任意連結，系統即自動解析並儲存店家資訊，並透過知識圖譜技術將店家之間的關聯視覺化，讓探索與發現變得更直覺。

### 1.2 核心價值主張

> 「貼上連結，其餘交給系統。」

- **零摩擦收藏**：貼連結即完成，不需手動填寫資料
- **智慧解析**：AI + Web Scraping 自動萃取店家資訊
- **知識圖譜**：店家依類別、地區、風格形成關聯網絡
- **卡片探索**：首頁以視覺化卡片呈現，適合手機瀏覽

---

## 2. 目標使用者

| 使用者類型 | 描述 |
|-----------|------|
| 主要使用者 | 喜歡探索美食、咖啡廳、景點的手機用戶 |
| 次要使用者 | 瀏覽他人公開收藏清單的訪客 |

### 使用情境

1. 小明在滑 Instagram 看到一支台南咖啡廳的短影音，複製連結貼入系統，系統自動解析出店名、地址、風格標籤
2. 小明在 Google Map 找到一間評分很高的餐廳，貼上連結，系統自動抓取店家資訊
3. 小明瀏覽首頁，看到系統推薦「和你收藏的咖啡廳風格相似的店家」
4. 朋友透過公開連結瀏覽小明的收藏地圖

---

## 3. 功能規劃

### 3.1 MVP 功能（第一版）

#### 🔗 連結解析引擎
- 支援來源：Instagram / TikTok / YouTube（短影音）、Google Map、部落格（一般網頁）
- Web Scraping：擷取網頁標題、描述、圖片、地址等 meta 資訊
- AI 解析（LLM）：從非結構化文字中萃取店名、類別、地區、風格關鍵字
- 解析失敗時提供手動補填介面

#### 🏪 店家資料管理
- 自動填入欄位：店名、地址、類別、來源網址、封面圖片
- 手動補充欄位：個人評分、心得、標籤、狀態（想去 / 去過）
- 支援多來源連結（同一間店可有多個來源）

#### 🗂️ 分類與標籤
- 系統預設類別：餐廳、咖啡廳、甜點、景點、住宿、酒吧
- 地區標籤：自動從地址解析（台北、台南、東京...）
- 風格標籤：AI 自動建議（文青、復古、網美、道地小吃...）
- 使用者可自訂標籤

#### 🌐 知識圖譜
- 節點：每間店家
- 關係類型：
  - `同類別`（都是咖啡廳）
  - `同地區`（都在台南中西區）
  - `相似風格`（都有「文青」標籤）
  - `同來源`（同一篇部落格提到）
- 視覺化：互動式圖譜，點擊節點可查看店家詳情

#### 🏠 首頁卡片牆
- Pinterest 風格瀑布流卡片
- 每張卡片顯示：封面圖、店名、類別、地區、狀態
- 篩選器：類別、地區、風格、狀態
- 關鍵字搜尋

#### 👤 使用者系統
- 註冊 / 登入（Email + 密碼）
- 個人公開頁面（可分享給朋友）
- 收藏清單公開 / 私人設定

---

### 3.2 進階功能（第二版）

#### 📍 地圖模式
- 在地圖上顯示所有收藏店家
- 點擊地圖標記查看店家卡片
- 依類別、狀態切換顯示

#### 🤖 AI 推薦
- 根據收藏習慣推薦相似店家
- 「你可能也喜歡」區塊
- 首頁個人化推薦排序

#### 📸 照片上傳
- 去過後上傳個人拍攝照片
- 照片顯示於店家卡片

#### 📋 清單集合
- 建立主題清單（例如「台南兩天一夜」）
- 可公開分享清單連結

#### 🌐 瀏覽器擴充功能
- Chrome / Safari 擴充功能
- 在任何網頁按一下即可收藏當前頁面
- 自動帶入當前網址，觸發連結解析流程

#### 🤖 LINE Bot 整合
- 加入官方帳號後，傳連結給 Bot 即自動收藏
- Bot 回覆解析結果預覽，確認後儲存
- 支援查詢指令（例如：「台南咖啡廳」）

#### 🌍 多語言店家支援
- AI 解析時自動偵測語言（中文、日文、英文）
- 店家資訊支援多語言儲存
- 介面支援繁體中文 / 英文切換

#### 👥 社群功能
- 追蹤達人收藏家
- 熱門店家榜（被最多人收藏）
- 追蹤動態牆（看看你追蹤的人最近收藏了什麼）
- 對店家按讚

---

## 4. 系統架構

### 4.1 整體架構圖

```
┌─────────────────────────────────────────────────────┐
│                   Client（手機瀏覽器）                 │
│              React / Next.js（Mobile First）          │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│                Spring Boot API Server                 │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Auth API   │  │   Spot API   │  │  Graph API  │ │
│  │  (JWT)      │  │   (CRUD)     │  │  (Neo4j)    │ │
│  └─────────────┘  └──────┬───────┘  └─────────────┘ │
│                           │                           │
│  ┌────────────────────────▼──────────────────────┐   │
│  │            Link Parser Service                 │   │
│  │                                               │   │
│  │  ┌─────────────────┐   ┌───────────────────┐ │   │
│  │  │  Web Scraper    │   │   AI Extractor    │ │   │
│  │  │  (Jsoup)        │   │   (Claude API)    │ │   │
│  │  └─────────────────┘   └───────────────────┘ │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │PostgreSQL│  │  Neo4j   │  │  Redis   │
  │(主資料庫) │  │(圖資料庫) │  │  (快取)  │
  └──────────┘  └──────────┘  └──────────┘
```

### 4.2 技術選型

| 層級 | 技術 | 說明 |
|------|------|------|
| 後端框架 | Spring Boot 3.x | 主要練習目標 |
| 語言 | Java 21 | LTS 版本 |
| 主資料庫 | PostgreSQL | 儲存使用者、店家資料 |
| 圖資料庫 | Neo4j | 儲存知識圖譜關係 |
| 快取 | Redis | 連結解析結果快取 |
| 認證 | Spring Security + JWT | 使用者登入 |
| Web Scraping | Jsoup | 擷取網頁內容 |
| AI 解析 | Claude API | 萃取非結構化資訊 |
| ORM | Spring Data JPA | PostgreSQL 操作 |
| 圖 ORM | Spring Data Neo4j | Neo4j 操作 |
| 前端 | React + Next.js | 手機優先 UI |
| 瀏覽器擴充 | Chrome Extension (Manifest V3) | 一鍵收藏任意網頁 |
| LINE Bot | LINE Messaging API + Spring | 傳連結自動收藏 |
| 多語言 | i18next + Spring MessageSource | 中文 / 英文 / 日文 |
| 部署 | Docker + Docker Compose | 本地開發環境 |

---

## 5. 資料模型設計

### 5.1 關聯式資料庫（PostgreSQL）

```
User
├── id (UUID)
├── email
├── password_hash
├── username
├── is_public (boolean)
└── created_at

Spot
├── id (UUID)
├── user_id (FK → User)
├── name
├── address
├── city
├── category (ENUM: RESTAURANT, CAFE, DESSERT, ATTRACTION, HOTEL, BAR)
├── status (ENUM: WANT_TO_GO, VISITED)
├── cover_image_url
├── personal_rating (1-5)
├── personal_note
├── is_public (boolean)
└── created_at

SpotSource
├── id (UUID)
├── spot_id (FK → Spot)
├── source_type (ENUM: INSTAGRAM, TIKTOK, YOUTUBE, GOOGLE_MAP, BLOG)
├── url
└── parsed_at

Tag
├── id (UUID)
├── name
└── type (ENUM: STYLE, CUSTOM)

SpotTag
├── spot_id (FK → Spot)
└── tag_id (FK → Tag)
```

### 5.2 知識圖譜（Neo4j）

```
節點（Node）
(:Spot {spotId, name, category, city})
(:Tag  {name, type})
(:City {name})

關係（Relationship）
(:Spot)-[:HAS_TAG]->(:Tag)
(:Spot)-[:LOCATED_IN]->(:City)
(:Spot)-[:SAME_CATEGORY {category}]->(:Spot)
(:Spot)-[:SIMILAR_STYLE {sharedTags: [...]}]->(:Spot)
(:Spot)-[:FROM_SAME_SOURCE {sourceUrl}]->(:Spot)
```

---

## 6. API 設計

### 6.1 認證

| Method | Endpoint | 說明 |
|--------|----------|------|
| POST | `/api/auth/register` | 註冊 |
| POST | `/api/auth/login` | 登入，回傳 JWT |

### 6.2 連結解析

| Method | Endpoint | 說明 |
|--------|----------|------|
| POST | `/api/parse` | 傳入 URL，回傳解析結果（預覽用） |

### 6.3 店家管理

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/spots` | 取得我的收藏清單（可篩選） |
| POST | `/api/spots` | 新增店家（含解析結果） |
| GET | `/api/spots/{id}` | 取得單一店家詳情 |
| PUT | `/api/spots/{id}` | 編輯店家資料 |
| DELETE | `/api/spots/{id}` | 刪除店家 |
| PATCH | `/api/spots/{id}/status` | 切換想去 / 去過狀態 |

### 6.4 知識圖譜

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/graph/spot/{id}` | 取得某店家的關聯圖譜 |
| GET | `/api/graph/related/{id}` | 取得相關店家推薦 |

### 6.5 公開頁面

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/public/{username}` | 瀏覽某用戶的公開收藏 |

---

## 7. 開發階段規劃

### Phase 1 — 基礎建設（第 1-2 週）
- [ ] Spring Boot 專案初始化
- [ ] PostgreSQL + JPA Entity 設計
- [ ] 使用者註冊 / 登入（Spring Security + JWT）
- [ ] 基本 CRUD API

### Phase 2 — 連結解析（第 3-4 週）
- [ ] Jsoup Web Scraping 實作
- [ ] Claude API 整合（AI 資訊萃取）
- [ ] 多語言資訊解析（中文 / 英文 / 日文自動偵測）
- [ ] 解析結果快取（Redis）
- [ ] 支援各平台連結格式

### Phase 3 — 知識圖譜（第 5-6 週）
- [ ] Neo4j 環境建置
- [ ] Spring Data Neo4j 整合
- [ ] 圖譜關係自動建立邏輯
- [ ] Graph API 開發

### Phase 4 — 前端 & 測試（第 7-8 週）
- [ ] React 首頁卡片牆
- [ ] 知識圖譜視覺化（D3.js / vis.js）
- [ ] JUnit + MockMvc 測試
- [ ] Docker Compose 整合

### Phase 5 — 社群功能（第 9-10 週）
- [ ] 追蹤達人 / 追蹤動態牆
- [ ] 熱門店家榜
- [ ] 按讚功能
- [ ] 公開清單分享
- [ ] 地圖模式（Google Maps API 整合）
- [ ] AI 推薦引擎（依收藏習慣個人化推薦）

### Phase 6 — 擴充整合（第 11-12 週）
- [ ] Chrome Extension（Manifest V3）開發
- [ ] LINE Messaging API 串接
- [ ] LINE Bot 收藏 / 查詢指令
- [ ] 介面多語言切換（i18next）

---

## 8. 技術挑戰與對策

| 挑戰 | 對策 |
|------|------|
| Instagram / TikTok 反爬蟲 | 優先用 AI 解析 meta tag，短影音平台先用手動補填作為 fallback |
| Google Map 連結解析 | 使用 Google Places API 或解析重定向後的網址 |
| 知識圖譜效能 | 限制圖譜深度（最多 2 層關係），加入 Neo4j 索引 |
| AI 解析費用 | Redis 快取相同連結的解析結果，避免重複呼叫 |

---

## 9. 未來展望

- 📸 照片上傳：去過後上傳個人拍攝照片
- 📋 主題清單：建立「台南兩天一夜」等旅遊清單
- 🍎 iOS / Android App：React Native 原生 App

---

*Document version: 1.0*
*Last updated: 2026-04-18*
