package com.favoritespot.spot;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/spots")
@RequiredArgsConstructor
public class SpotController {

    private final SpotService spotService;

    @PostMapping
    public ResponseEntity<SpotDto> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreateSpotRequest req) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        Spot spot = spotService.createSpot(userId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(SpotDto.from(spot));
    }

    @GetMapping
    public ResponseEntity<Page<SpotDto>> list(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) SpotCategory category,
            @RequestParam(required = false) SpotStatus status,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        Page<SpotDto> result = spotService.listSpots(userId, category, status, city, q, page, size)
                .map(SpotDto::from);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpotDto> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        Spot spot = spotService.getSpot(userId, id);
        return ResponseEntity.ok(SpotDto.from(spot));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SpotDto> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody UpdateSpotRequest req) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        Spot spot = spotService.updateSpot(userId, id, req);
        return ResponseEntity.ok(SpotDto.from(spot));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SpotDto> updateStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody StatusUpdateRequest req) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        Spot spot = spotService.updateStatus(userId, id, req.status());
        return ResponseEntity.ok(SpotDto.from(spot));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        spotService.deleteSpot(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/description/generate")
    public ResponseEntity<SpotDto> generateDescription(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        Spot spot = spotService.generateDescription(userId, id);
        return ResponseEntity.ok(SpotDto.from(spot));
    }

    record StatusUpdateRequest(SpotStatus status) {}
}
