package com.favoritespot.recommendation;

import com.favoritespot.spot.*;
import com.favoritespot.tag.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {

    private final SpotRepository spotRepository;

    @GetMapping
    public ResponseEntity<List<SpotDto>> recommend(@AuthenticationPrincipal UserDetails user,
                                                    @RequestParam(defaultValue = "6") int limit) {
        UUID userId = UUID.fromString(user.getUsername());

        // Build taste profile from user's own spots
        List<Spot> mySpots = spotRepository.findFiltered(userId, null, null, null, null,
                PageRequest.of(0, 100)) // ORDER BY is inside the native query
                .getContent();

        Map<SpotCategory, Long> catCounts = mySpots.stream()
                .collect(Collectors.groupingBy(Spot::getCategory, Collectors.counting()));

        Set<String> myTags = mySpots.stream()
                .flatMap(s -> s.getTags().stream())
                .map(Tag::getName)
                .collect(Collectors.toSet());

        // Get public spots from others
        List<Spot> candidates = spotRepository.findPublicByOtherUsers(userId,
                PageRequest.of(0, 200, org.springframework.data.domain.Sort.by("createdAt").descending()));

        // Score each candidate
        List<SpotDto> scored = candidates.stream()
                .map(s -> {
                    double score = 0;
                    // Category match
                    score += catCounts.getOrDefault(s.getCategory(), 0L) * 2.0;
                    // Tag overlap
                    long tagOverlap = s.getTags().stream()
                            .filter(t -> myTags.contains(t.getName()))
                            .count();
                    score += tagOverlap * 3.0;
                    // Has image bonus
                    if (s.getCoverImageUrl() != null) score += 1.0;
                    return Map.entry(score, s);
                })
                .filter(e -> e.getKey() > 0)
                .sorted((a, b) -> Double.compare(b.getKey(), a.getKey()))
                .limit(limit)
                .map(e -> SpotDto.from(e.getValue()))
                .toList();

        // If not enough scored results, fill with recent public spots
        if (scored.size() < limit) {
            Set<UUID> seen = scored.stream().map(SpotDto::id).collect(Collectors.toSet());
            List<SpotDto> fill = candidates.stream()
                    .filter(s -> !seen.contains(s.getId()))
                    .limit(limit - scored.size())
                    .map(SpotDto::from)
                    .toList();
            List<SpotDto> result = new ArrayList<>(scored);
            result.addAll(fill);
            return ResponseEntity.ok(result);
        }

        return ResponseEntity.ok(scored);
    }
}
