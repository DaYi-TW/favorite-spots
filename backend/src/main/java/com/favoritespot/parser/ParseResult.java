package com.favoritespot.parser;

import com.favoritespot.spot.SpotCategory;
import com.favoritespot.spot.SourceType;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ParseResult {
    private String name;
    private String address;
    private String city;
    private SpotCategory category;
    private String coverImageUrl;
    private String description;
    @Builder.Default
    private List<String> suggestedTags = List.of();
    private SourceType sourceType;
    private String originalUrl;
    @Builder.Default
    private boolean fromCache = false;

    /** Non-null when the source page contains multiple distinct spots (e.g. a listicle/blog). */
    @Builder.Default
    private List<SpotParseItem> spots = List.of();

    @Data
    @Builder
    public static class SpotParseItem {
        private String name;
        private String address;
        private String city;
        private SpotCategory category;
        private String coverImageUrl;
        private String description;
        @Builder.Default
        private List<String> suggestedTags = List.of();
    }
}
