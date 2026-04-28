package com.favoritespot.spot;

import com.favoritespot.tag.Tag;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record SpotDto(
        UUID id,
        String name,
        String address,
        String city,
        Double latitude,
        Double longitude,
        SpotCategory category,
        SpotStatus status,
        String coverImageUrl,
        Short personalRating,
        String personalNote,
        String description,
        boolean isPublic,
        Set<String> tags,
        List<SpotSourceDto> sources,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public record SpotSourceDto(UUID id, SourceType sourceType, String url, OffsetDateTime parsedAt) {
        public static SpotSourceDto from(SpotSource s) {
            return new SpotSourceDto(s.getId(), s.getSourceType(), s.getUrl(), s.getParsedAt());
        }
    }

    public static SpotDto from(Spot spot) {
        return new SpotDto(
                spot.getId(),
                spot.getName(),
                spot.getAddress(),
                spot.getCity(),
                spot.getLatitude(),
                spot.getLongitude(),
                spot.getCategory(),
                spot.getStatus(),
                spot.getCoverImageUrl(),
                spot.getPersonalRating(),
                spot.getPersonalNote(),
                spot.getDescription(),
                spot.isPublic(),
                spot.getTags().stream().map(Tag::getName).collect(Collectors.toSet()),
                spot.getSources().stream().map(SpotSourceDto::from).collect(Collectors.toList()),
                spot.getCreatedAt(),
                spot.getUpdatedAt()
        );
    }
}
