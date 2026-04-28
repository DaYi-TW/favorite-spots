package com.favoritespot.spot;

import java.util.Set;

public record CreateSpotRequest(
        String name,
        String address,
        String city,
        SpotCategory category,
        SpotStatus status,
        String coverImageUrl,
        String description,
        Boolean isPublic,
        Set<String> tags,
        String originalUrl,
        SourceType sourceType
) {}
