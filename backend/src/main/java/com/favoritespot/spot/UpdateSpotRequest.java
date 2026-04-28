package com.favoritespot.spot;

import java.util.Set;

public record UpdateSpotRequest(
        String name,
        String address,
        String city,
        SpotCategory category,
        String coverImageUrl,
        String description,
        String personalNote,
        Short personalRating,
        Boolean isPublic,
        Set<String> tags
) {}
