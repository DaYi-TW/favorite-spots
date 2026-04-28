package com.favoritespot.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.favoritespot.parser.ParseResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParseCacheService {

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    @Value("${app.parse-cache.ttl-seconds:86400}")
    private long ttlSeconds;

    private static final String PREFIX = "parse:";

    public Optional<ParseResult> get(String url) {
        try {
            String key = PREFIX + hash(normalize(url));
            String json = redis.opsForValue().get(key);
            if (json == null) return Optional.empty();
            return Optional.of(objectMapper.readValue(json, ParseResult.class));
        } catch (Exception e) {
            log.warn("Cache get failed for url={}: {}", url, e.getMessage());
            return Optional.empty();
        }
    }

    public void put(String url, ParseResult result) {
        try {
            String key = PREFIX + hash(normalize(url));
            String json = objectMapper.writeValueAsString(result);
            redis.opsForValue().set(key, json, Duration.ofSeconds(ttlSeconds));
        } catch (Exception e) {
            log.warn("Cache put failed for url={}: {}", url, e.getMessage());
        }
    }

    static String normalize(String url) {
        return url.toLowerCase()
                .replaceAll("https?://", "")
                .replaceAll("[?&](utm_[^&]+)", "")
                .replaceAll("/$", "");
    }

    static String hash(String input) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] bytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(bytes);
    }
}
