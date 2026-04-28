package com.favoritespot.parser;

import com.favoritespot.cache.ParseCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/parse")
@RequiredArgsConstructor
@Slf4j
public class ParseController {

    private final LinkParserService linkParserService;
    private final ParseCacheService parseCacheService;

    record ParseRequest(String url) {}

    @PostMapping
    public ResponseEntity<ParseResult> parse(@RequestBody ParseRequest request) {
        String url = request.url();
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // Check cache first
        var cached = parseCacheService.get(url);
        if (cached.isPresent()) {
            log.info("Cache hit for url={}", url);
            ParseResult result = cached.get();
            // Return a new instance with fromCache=true
            return ResponseEntity.ok(ParseResult.builder()
                    .name(result.getName())
                    .address(result.getAddress())
                    .city(result.getCity())
                    .category(result.getCategory())
                    .coverImageUrl(result.getCoverImageUrl())
                    .description(result.getDescription())
                    .suggestedTags(result.getSuggestedTags())
                    .sourceType(result.getSourceType())
                    .originalUrl(result.getOriginalUrl())
                    .spots(result.getSpots())
                    .fromCache(true)
                    .build());
        }

        ParseResult result = linkParserService.parse(url);
        parseCacheService.put(url, result);
        return ResponseEntity.ok(result);
    }
}
