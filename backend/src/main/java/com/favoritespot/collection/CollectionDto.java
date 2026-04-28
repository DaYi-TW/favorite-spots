package com.favoritespot.collection;

import com.favoritespot.spot.SpotDto;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record CollectionDto(
        UUID id,
        String name,
        String description,
        boolean isPublic,
        String coverImageUrl,
        int spotCount,
        List<SpotDto> spots,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static CollectionDto from(Collection c, boolean includeSpots) {
        List<SpotDto> spotDtos = includeSpots
                ? c.getCollectionSpots().stream()
                    .map(cs -> SpotDto.from(cs.getSpot()))
                    .toList()
                : List.of();
        return new CollectionDto(
                c.getId(), c.getName(), c.getDescription(), c.isPublic(),
                c.getCoverImageUrl(), c.getCollectionSpots().size(),
                spotDtos, c.getCreatedAt(), c.getUpdatedAt()
        );
    }
}
