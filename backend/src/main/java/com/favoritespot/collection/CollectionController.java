package com.favoritespot.collection;

import com.favoritespot.auth.User;
import com.favoritespot.auth.UserRepository;
import com.favoritespot.config.ResourceNotFoundException;
import com.favoritespot.spot.Spot;
import com.favoritespot.spot.SpotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionRepository collectionRepository;
    private final SpotRepository spotRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<CollectionDto> list(@AuthenticationPrincipal UserDetails user) {
        UUID userId = uuid(user);
        return collectionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(c -> CollectionDto.from(c, false)).toList();
    }

    @PostMapping
    public ResponseEntity<CollectionDto> create(@AuthenticationPrincipal UserDetails user,
                                                @RequestBody CreateCollectionRequest req) {
        User u = userRepository.findById(uuid(user))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Collection c = Collection.builder()
                .user(u).name(req.name())
                .description(req.description())
                .isPublic(req.isPublic() != null && req.isPublic())
                .build();
        c = collectionRepository.save(c);
        return ResponseEntity.status(201).body(CollectionDto.from(c, false));
    }

    @GetMapping("/{id}")
    public CollectionDto get(@PathVariable UUID id,
                             @AuthenticationPrincipal UserDetails user) {
        Collection c = getOwned(id, user);
        return CollectionDto.from(c, true);
    }

    @PutMapping("/{id}")
    public CollectionDto update(@PathVariable UUID id,
                                @AuthenticationPrincipal UserDetails user,
                                @RequestBody CreateCollectionRequest req) {
        Collection c = getOwned(id, user);
        if (req.name() != null) c.setName(req.name());
        if (req.description() != null) c.setDescription(req.description());
        if (req.isPublic() != null) c.setPublic(req.isPublic());
        return CollectionDto.from(collectionRepository.save(c), false);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id,
                                       @AuthenticationPrincipal UserDetails user) {
        Collection c = getOwned(id, user);
        collectionRepository.delete(c);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/spots/{spotId}")
    public ResponseEntity<CollectionDto> addSpot(@PathVariable UUID id,
                                                  @PathVariable UUID spotId,
                                                  @AuthenticationPrincipal UserDetails user) {
        Collection c = getOwned(id, user);
        Spot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));

        boolean exists = c.getCollectionSpots().stream()
                .anyMatch(cs -> cs.getSpot().getId().equals(spotId));
        if (!exists) {
            CollectionSpot cs = CollectionSpot.builder()
                    .collection(c).spot(spot)
                    .position(c.getCollectionSpots().size())
                    .build();
            c.getCollectionSpots().add(cs);
            c = collectionRepository.save(c);
        }
        return ResponseEntity.ok(CollectionDto.from(c, true));
    }

    @DeleteMapping("/{id}/spots/{spotId}")
    public ResponseEntity<Void> removeSpot(@PathVariable UUID id,
                                            @PathVariable UUID spotId,
                                            @AuthenticationPrincipal UserDetails user) {
        Collection c = getOwned(id, user);
        c.getCollectionSpots().removeIf(cs -> cs.getSpot().getId().equals(spotId));
        collectionRepository.save(c);
        return ResponseEntity.noContent().build();
    }

    // Public share endpoint (no auth)
    @GetMapping("/public/{id}")
    public CollectionDto publicView(@PathVariable UUID id) {
        Collection c = collectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
        if (!c.isPublic()) throw new ResourceNotFoundException("Collection not found");
        return CollectionDto.from(c, true);
    }

    private Collection getOwned(UUID id, UserDetails user) {
        Collection c = collectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
        if (!c.getUser().getId().equals(uuid(user))) {
            throw new ResourceNotFoundException("Collection not found");
        }
        return c;
    }

    private UUID uuid(UserDetails u) { return UUID.fromString(u.getUsername()); }
}
