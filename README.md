# Favorite Spots — 知識圖譜探索器

> 貼上連結，剩下交給 AI。

你有多少個「先存著之後再去」的地方，最後根本沒去？

**Favorite Spots** 讓你把 Instagram、TikTok、Google Maps 的連結通通丟進來，AI 自動解析地點資訊，幫你整理成漂亮的卡片牆，還能視覺化成互動知識圖譜——看見你的收藏之間，隱藏著哪些你沒發現的關聯。

---

## 怎麼用

1. **貼上任意連結** — Instagram Reel、TikTok、Google Maps、任何網頁都行
2. **AI 自動解析** — 抓取地點名稱、城市、分類、標籤，不用手動填
3. **雙資料庫儲存** — PostgreSQL 管結構化資料，Neo4j 管關係網絡
4. **探索你的地圖** — 互動知識圖譜，發現你的口袋名單之間的隱藏連結

---

## 功能特色

- **智慧連結解析** — OG tag 擷取 + Claude AI 雙重保障，解析成功率極高
- **卡片牆瀏覽** — 依分類、狀態、城市篩選，支援分頁
- **知識圖譜探索器** — vis.js 互動圖，最多 2 跳關係展開
- **AI 推薦相關地點** — 根據共同標籤與位置排名推薦
- **安全登入** — JWT HttpOnly Cookie，不碰 localStorage
- **Redis 快取** — 同一連結 24 小時內不重複解析

---

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端 | Next.js 14 App Router、TypeScript、Tailwind CSS |
| 後端 | Spring Boot 3.4.4、Java 21 |
| 主資料庫 | PostgreSQL + Flyway 版本管理 |
| 圖資料庫 | Neo4j |
| 快取 | Redis |
| AI | Claude API (Anthropic) |
| 基礎設施 | Docker Compose |

---

## 快速啟動

```bash
git clone https://github.com/DaYi-TW/favorite-spots.git
cd favorite-spots
docker compose up -d
```

| 服務 | 網址 |
|------|------|
| 應用程式 | http://localhost:3000 |
| API | http://localhost:8080 |
| Neo4j 瀏覽器 | http://localhost:7474 |

---

## 本地開發

**後端**
```bash
cd backend
mvn spring-boot:run
```

**前端**
```bash
cd frontend
npm install && npm run dev
```

---

## 開發路線圖

- [x] 使用者驗證 + 地點 CRUD + 連結解析 + 卡片牆
- [x] Neo4j 雙寫 + Graph API + vis.js 知識圖譜
- [ ] 地圖視圖 + AI 個人化推薦
- [ ] 社群功能（追蹤、按讚、熱門地點）
- [ ] 照片上傳（S3）+ 主題收藏集
- [ ] Chrome 擴充套件 + LINE Bot + 多語系（繁中 / 英 / 日）

---

## 設計理念

品牌名 **Vivid Atlas** — 電光靛藍 `#4b3fe2` 主色調、Plus Jakarta Sans 標題字型、Manrope 內文字型。卡片圓角全出血，無分隔線，圖譜節點帶光暈。
