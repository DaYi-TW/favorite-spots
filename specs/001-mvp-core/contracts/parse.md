# API Contract: Link Parse

**Base Path**: `/api/parse`
**Auth Required**: Yes (HttpOnly JWT cookie)

---

## POST /api/parse

Submit a URL for parsing. Returns a preview result for the user to review before saving.

**Request Body**
```json
{
  "url": "https://maps.google.com/..."
}
```

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Parse result (may be partial if auto-parse only partially succeeded) |
| 400 | Missing or invalid URL |
| 401 | Not authenticated |

**200 Body**
```json
{
  "name": "The Roastery",
  "address": "No. 7, Alley 3, Lane 72, Yongkang St, Da'an District, Taipei",
  "city": "Taipei",
  "category": "CAFE",
  "coverImageUrl": "https://example.com/image.jpg",
  "suggestedTags": ["文青", "手沖咖啡", "安靜"],
  "sourceType": "BLOG",
  "originalUrl": "https://example.com/blog/the-roastery",
  "fromCache": false
}
```

**Partial Parse (when AI extraction incomplete)**
```json
{
  "name": null,
  "address": null,
  "city": null,
  "category": null,
  "coverImageUrl": "https://example.com/image.jpg",
  "suggestedTags": [],
  "sourceType": "INSTAGRAM",
  "originalUrl": "https://www.instagram.com/p/abc123/",
  "fromCache": false
}
```
> When `name` and `address` are both null, the frontend MUST show the manual input form.

**Notes**
- Response is identical whether result came from cache or fresh parse (`fromCache` flag indicates source).
- `suggestedTags` are AI suggestions only; the user must accept them explicitly before they are saved.
- `category` may be null if the AI cannot determine it; frontend should prompt user to select.
