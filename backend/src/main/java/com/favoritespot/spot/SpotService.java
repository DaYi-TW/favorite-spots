package com.favoritespot.spot;

import com.favoritespot.auth.User;
import com.favoritespot.auth.UserRepository;
import com.favoritespot.config.ResourceNotFoundException;
import com.favoritespot.parser.LinkParserService;
import com.favoritespot.tag.Tag;
import com.favoritespot.tag.TagRepository;
import com.favoritespot.tag.TagType;
import com.favoritespot.graph.service.GraphSyncService;
import com.favoritespot.geo.GeocodingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpotService {

    private final SpotRepository spotRepository;
    private final SpotSourceRepository spotSourceRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final GraphSyncService graphSyncService;
    private final GeocodingService geocodingService;
    private final LinkParserService linkParserService;

    @Transactional
    public Spot createSpot(UUID userId, CreateSpotRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Set<Tag> tags = resolveOrCreateTags(req.tags());

        Spot spot = Spot.builder()
                .user(user)
                .name(req.name())
                .address(req.address())
                .city(req.city())
                .category(req.category())
                .status(req.status() != null ? req.status() : SpotStatus.WANT_TO_GO)
                .coverImageUrl(req.coverImageUrl())
                .description(req.description())
                .isPublic(req.isPublic() != null && req.isPublic())
                .tags(tags)
                .build();

        spot = spotRepository.save(spot);

        // Best-effort geocoding
        try {
            double[] coords = geocodingService.geocode(req.address(), req.city());
            if (coords != null) {
                spot.setLatitude(coords[0]);
                spot.setLongitude(coords[1]);
                spot = spotRepository.save(spot);
            }
        } catch (Exception e) {
            log.warn("Geocoding failed for spot {}: {}", spot.getId(), e.getMessage());
        }

        graphSyncService.syncSpot(spot);

        if (req.originalUrl() != null && !req.originalUrl().isBlank()) {
            SpotSource source = SpotSource.builder()
                    .spot(spot)
                    .sourceType(req.sourceType() != null ? req.sourceType() : SourceType.MANUAL)
                    .url(req.originalUrl())
                    .parsedAt(OffsetDateTime.now())
                    .build();
            source = spotSourceRepository.save(source);
            spot.getSources().add(source);
        }

        return spot;
    }

    @Transactional(readOnly = true)
    public Page<Spot> listSpots(UUID userId, SpotCategory category, SpotStatus status, String city, String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size); // ORDER BY is handled inside the native query
        String qParam = (q != null && !q.isBlank()) ? q.trim() : null;
        return spotRepository.findFiltered(userId,
                category != null ? category.name() : null,
                status != null ? status.name() : null,
                city, qParam, pageable);
    }

    @Transactional(readOnly = true)
    public Spot getSpot(UUID userId, UUID spotId) {
        Spot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));
        if (!spot.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Spot not found");
        }
        return spot;
    }

    @Transactional
    public Spot updateSpot(UUID userId, UUID spotId, UpdateSpotRequest req) {
        Spot spot = getSpot(userId, spotId);

        if (req.name() != null) spot.setName(req.name());
        if (req.address() != null) spot.setAddress(req.address());
        if (req.city() != null) spot.setCity(req.city());
        if (req.category() != null) spot.setCategory(req.category());
        if (req.coverImageUrl() != null) spot.setCoverImageUrl(req.coverImageUrl());
        if (req.description() != null) spot.setDescription(req.description());
        if (req.personalNote() != null) spot.setPersonalNote(req.personalNote());
        if (req.personalRating() != null) spot.setPersonalRating(req.personalRating());
        if (req.isPublic() != null) spot.setPublic(req.isPublic());
        if (req.tags() != null) spot.setTags(resolveOrCreateTags(req.tags()));

        spot = spotRepository.save(spot);
        graphSyncService.syncSpot(spot);
        return spot;
    }

    @Transactional
    public Spot updateStatus(UUID userId, UUID spotId, SpotStatus status) {
        Spot spot = getSpot(userId, spotId);
        spot.setStatus(status);
        return spotRepository.save(spot);
    }

    @Transactional
    public void deleteSpot(UUID userId, UUID spotId) {
        Spot spot = getSpot(userId, spotId);
        spotRepository.delete(spot);
        graphSyncService.deleteSpot(spotId.toString());
    }

    /**
     * Generate an AI description for a spot and persist it.
     * Best-effort: returns the spot unchanged if generation fails.
     */
    @Transactional
    public Spot generateDescription(UUID userId, UUID spotId) {
        Spot spot = getSpot(userId, spotId);

        List<String> tagNames = new ArrayList<>();
        spot.getTags().forEach(t -> tagNames.add(t.getName()));

        String generated = linkParserService.generateDescription(
                spot.getName(), spot.getAddress(), spot.getCity(),
                spot.getCategory(), tagNames);

        if (generated != null && !generated.isBlank()) {
            spot.setDescription(generated);
            spot = spotRepository.save(spot);
        }
        return spot;
    }

    private Set<Tag> resolveOrCreateTags(Set<String> tagNames) {
        if (tagNames == null || tagNames.isEmpty()) return new HashSet<>();
        Set<Tag> result = new HashSet<>(tagRepository.findByNameIn(tagNames));
        Set<String> existingNames = new HashSet<>();
        result.forEach(t -> existingNames.add(t.getName()));

        for (String name : tagNames) {
            if (!existingNames.contains(name)) {
                Tag tag = Tag.builder()
                        .name(name)
                        .type(TagType.CUSTOM)
                        .build();
                result.add(tagRepository.save(tag));
            }
        }
        return result;
    }
}
