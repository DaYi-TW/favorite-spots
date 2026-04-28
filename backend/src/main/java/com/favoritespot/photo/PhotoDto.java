package com.favoritespot.photo;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PhotoDto(UUID id, String url, String filename, Long sizeBytes, OffsetDateTime createdAt) {
    public static PhotoDto from(SpotPhoto p) {
        return new PhotoDto(p.getId(), p.getUrl(), p.getFilename(), p.getSizeBytes(), p.getCreatedAt());
    }
}
