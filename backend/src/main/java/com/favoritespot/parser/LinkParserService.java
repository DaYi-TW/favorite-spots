package com.favoritespot.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.favoritespot.spot.SpotCategory;
import com.favoritespot.spot.SourceType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LinkParserService {

    private final ObjectMapper objectMapper;

    @Value("${app.anthropic.api-key:dummy}")
    private String anthropicApiKey;

    @Value("${app.anthropic.base-url:https://api.anthropic.com}")
    private String anthropicBaseUrl;

    @Value("${app.anthropic.model:claude-3-5-haiku-latest}")
    private String anthropicModel;

    private static final int JSOUP_TIMEOUT_MS = 10_000;
    private static final int MAX_PAGE_TEXT_CHARS = 12000;

    public ParseResult parse(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (compatible; FavoriteSpots/1.0)")
                    .timeout(JSOUP_TIMEOUT_MS)
                    .get();

            String name = getMetaContent(doc, "og:title");
            if (name == null || name.isBlank()) {
                name = doc.title();
            }

            String imageUrl = getMetaContent(doc, "og:image");
            String canonicalUrl = getMetaContent(doc, "og:url");
            if (canonicalUrl == null || canonicalUrl.isBlank()) {
                canonicalUrl = url;
            }

            String address = extractAddress(doc);

            log.info("Enriching parse result with Claude API for url={}", url);
            return enrichWithClaudeApi(url, doc, name, address, imageUrl, canonicalUrl);

        } catch (Exception e) {
            log.warn("LinkParserService failed for url={}: {}", url, e.getMessage());
            return ParseResult.builder()
                    .originalUrl(url)
                    .sourceType(SourceType.WEB)
                    .build();
        }
    }

    private String getMetaContent(Document doc, String property) {
        var el = doc.selectFirst("meta[property=" + property + "]");
        if (el != null) return el.attr("content").trim();
        String name = property.contains(":") ? property.split(":")[1] : property;
        el = doc.selectFirst("meta[name=" + name + "]");
        return el != null ? el.attr("content").trim() : null;
    }

    private String extractAddress(Document doc) {
        var el = doc.selectFirst("[itemprop=streetAddress]");
        if (el != null) return el.text().trim();
        el = doc.selectFirst("[itemprop=address]");
        if (el != null) return el.text().trim();
        return null;
    }

    private String extractCity(String address) {
        if (address == null || address.isBlank()) return null;
        String[] parts = address.split(",");
        if (parts.length >= 2) {
            return parts[parts.length - 2].trim();
        }
        return null;
    }

    private SpotCategory guessCategory(String name, String description) {
        String text = ((name != null ? name : "") + " " + (description != null ? description : "")).toLowerCase();
        if (text.matches(".*\\b(restaurant|bistro|eatery|diner|brasserie|食堂|餐廳)\\b.*")) return SpotCategory.RESTAURANT;
        if (text.matches(".*\\b(café|cafe|coffee|茶|咖啡)\\b.*")) return SpotCategory.CAFE;
        if (text.matches(".*\\b(bar|pub|cocktail|brewery|酒吧)\\b.*")) return SpotCategory.BAR;
        if (text.matches(".*\\b(museum|gallery|exhibit|博物館|美術館)\\b.*")) return SpotCategory.MUSEUM;
        if (text.matches(".*\\b(park|garden|nature|公園)\\b.*")) return SpotCategory.PARK;
        if (text.matches(".*\\b(hotel|inn|hostel|resort|旅館|酒店)\\b.*")) return SpotCategory.HOTEL;
        if (text.matches(".*\\b(shop|store|boutique|市場|商店)\\b.*")) return SpotCategory.SHOP;
        return SpotCategory.OTHER;
    }

    /**
     * Generate an AI description for an existing spot (called on-demand).
     */
    public String generateDescription(String name, String address, String city,
                                      SpotCategory category, List<String> tags) {
        if (anthropicApiKey == null || anthropicApiKey.isBlank() || anthropicApiKey.equals("dummy")) {
            return null;
        }
        try {
            String tagStr = tags != null && !tags.isEmpty() ? String.join(", ", tags) : "none";
            String prompt = """
                    Write a compelling 2-3 sentence description for a place with the following details:
                    - Name: %s
                    - Category: %s
                    - Address: %s
                    - City: %s
                    - Tags: %s

                    The description should be vivid, informative, and entice someone to visit.
                    Write in English. Return only the description text, no extra formatting.
                    """.formatted(
                    name,
                    category != null ? category.name() : "OTHER",
                    address != null ? address : "unknown",
                    city != null ? city : "unknown",
                    tagStr);

            Map<String, Object> requestBody = Map.of(
                    "model", anthropicModel,
                    "max_tokens", 256,
                    "messages", List.of(Map.of("role", "user", "content", prompt))
            );

            String requestJson = objectMapper.writeValueAsString(requestBody);
            HttpClient httpClient = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(anthropicBaseUrl + "/v1/messages"))
                    .header("Content-Type", "application/json")
                    .header("x-api-key", anthropicApiKey)
                    .header("anthropic-version", "2023-06-01")
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            Map<String, Object> responseBody = objectMapper.readValue(response.body(), Map.class);

            String responseText = "";
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            if (choices != null && !choices.isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                if (message != null) responseText = (String) message.getOrDefault("content", "");
            }
            if (responseText.isBlank()) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> content = (List<Map<String, Object>>) responseBody.get("content");
                if (content != null && !content.isEmpty()) {
                    responseText = (String) content.get(0).getOrDefault("text", "");
                }
            }
            return responseText.trim().isBlank() ? null : responseText.trim();

        } catch (Exception e) {
            log.error("Failed to generate description for spot '{}': {}", name, e.getMessage());
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private ParseResult enrichWithClaudeApi(String url, Document doc, String jsoupName, String jsoupAddress, String imageUrl, String canonicalUrl) {
        if (anthropicApiKey == null || anthropicApiKey.isBlank() || anthropicApiKey.equals("dummy")) {
            log.warn("Anthropic API key not configured, falling back to Jsoup-only result for url={}", url);
            SpotCategory category = guessCategory(jsoupName, null);
            return ParseResult.builder()
                    .name(jsoupName)
                    .address(jsoupAddress)
                    .city(extractCity(jsoupAddress))
                    .category(category)
                    .coverImageUrl(imageUrl)
                    .sourceType(SourceType.WEB)
                    .originalUrl(canonicalUrl)
                    .build();
        }

        try {
            String pageText = doc.body().text();
            if (pageText.length() > MAX_PAGE_TEXT_CHARS) {
                pageText = pageText.substring(0, MAX_PAGE_TEXT_CHARS);
            }

            String userPrompt = """
                    Analyze the following webpage and extract ALL distinct places/spots mentioned.

                    Return a JSON object with a single key "spots" containing an array of place objects.
                    Each place object must have these fields:
                    - name (string): the name of the place
                    - address (string): full street address if available, otherwise null
                    - city (string): city name if available, otherwise null
                    - category (string): one of RESTAURANT, CAFE, BAR, MUSEUM, PARK, HOTEL, SHOP, ATTRACTION, DESSERT, OTHER
                    - coverImageUrl (string): a representative image URL for this place if available, otherwise null
                    - suggestedTags (array of strings): 2-5 descriptive tags
                    - description (string): a compelling 2-3 sentence description, written in English, that would entice someone to visit

                    Rules:
                    - If the page is about a SINGLE place, return an array with exactly one object.
                    - If the page is a listicle, blog post, or guide mentioning MULTIPLE places, return ALL of them.
                    - Do not invent places — only include spots explicitly mentioned on the page.

                    Already known from page metadata (use as hints):
                    - name hint: %s
                    - address hint: %s

                    Webpage URL: %s

                    Webpage text:
                    %s

                    Return only valid JSON like: {"spots": [...]}. No extra text.
                    """.formatted(
                    jsoupName != null ? jsoupName : "",
                    jsoupAddress != null ? jsoupAddress : "",
                    url,
                    pageText);

            Map<String, Object> requestBody = Map.of(
                    "model", anthropicModel,
                    "max_tokens", 8192,
                    "messages", List.of(Map.of("role", "user", "content", userPrompt))
            );

            String requestJson = objectMapper.writeValueAsString(requestBody);

            HttpClient httpClient = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(anthropicBaseUrl + "/v1/messages"))
                    .header("Content-Type", "application/json")
                    .header("x-api-key", anthropicApiKey)
                    .header("anthropic-version", "2023-06-01")
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("Claude API response status={} for url={}", response.statusCode(), url);

            Map<String, Object> responseBody = objectMapper.readValue(response.body(), Map.class);

            String responseText = "";
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                if (message != null) {
                    responseText = (String) message.getOrDefault("content", "{}");
                }
            }
            if (responseText.isBlank()) {
                List<Map<String, Object>> content = (List<Map<String, Object>>) responseBody.get("content");
                if (content != null && !content.isEmpty()) {
                    responseText = (String) content.get(0).getOrDefault("text", "{}");
                }
            }

            responseText = responseText.trim();
            if (responseText.startsWith("```")) {
                responseText = responseText.replaceAll("(?s)^```[a-z]*\\n?", "").replaceAll("```$", "").trim();
            }

            Map<String, Object> parsed = objectMapper.readValue(responseText, Map.class);

            List<Map<String, Object>> spotsRaw = (List<Map<String, Object>>) parsed.get("spots");
            if (spotsRaw == null || spotsRaw.isEmpty()) {
                // Fallback: AI returned old single-object format
                spotsRaw = List.of(parsed);
            }

            List<ParseResult.SpotParseItem> spotItems = spotsRaw.stream().map(s -> {
                String sName = (String) s.getOrDefault("name", "");
                String sAddress = (String) s.get("address");
                String sCity = (String) s.getOrDefault("city", extractCity(sAddress));
                String sCatStr = (String) s.getOrDefault("category", "OTHER");
                String sCoverImageUrl = (String) s.get("coverImageUrl");
                String sDescription = (String) s.get("description");
                List<String> sTags = (List<String>) s.getOrDefault("suggestedTags", List.of());
                SpotCategory sCat;
                try { sCat = SpotCategory.valueOf(sCatStr.toUpperCase()); }
                catch (IllegalArgumentException ex) { sCat = SpotCategory.OTHER; }
                return ParseResult.SpotParseItem.builder()
                        .name(sName)
                        .address(sAddress)
                        .city(sCity)
                        .category(sCat)
                        .coverImageUrl(sCoverImageUrl)
                        .description(sDescription)
                        .suggestedTags(sTags)
                        .build();
            }).toList();

            // First spot becomes the top-level fields for backward compatibility
            ParseResult.SpotParseItem first = spotItems.get(0);
            String firstCover = (first.getCoverImageUrl() != null) ? first.getCoverImageUrl() : imageUrl;

            return ParseResult.builder()
                    .name(first.getName())
                    .address(first.getAddress())
                    .city(first.getCity())
                    .category(first.getCategory())
                    .coverImageUrl(firstCover)
                    .description(first.getDescription())
                    .suggestedTags(first.getSuggestedTags())
                    .sourceType(SourceType.AI_PARSED)
                    .originalUrl(canonicalUrl)
                    .spots(spotItems)
                    .build();

        } catch (Exception e) {
            log.error("Claude API enrichment failed for url={}: {} ({})", url, e.getMessage(), e.getClass().getName(), e);
            SpotCategory category = guessCategory(jsoupName, null);
            return ParseResult.builder()
                    .name(jsoupName)
                    .address(jsoupAddress)
                    .city(extractCity(jsoupAddress))
                    .category(category)
                    .coverImageUrl(imageUrl)
                    .sourceType(SourceType.WEB)
                    .originalUrl(canonicalUrl)
                    .build();
        }
    }
}
