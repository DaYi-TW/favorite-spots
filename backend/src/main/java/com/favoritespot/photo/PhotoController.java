package com.favoritespot.photo;

import com.favoritespot.config.ResourceNotFoundException;
import com.favoritespot.spot.Spot;
import com.favoritespot.spot.SpotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/spots/{spotId}/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final SpotPhotoRepository photoRepository;
    private final SpotRepository spotRepository;
    private final StorageService storageService;

    private static final int MAX_PHOTOS = 10;

    @GetMapping
    public List<PhotoDto> list(@PathVariable UUID spotId,
                               @AuthenticationPrincipal UserDetails user) {
        getOwnedSpot(spotId, user);
        return photoRepository.findBySpotIdOrderByCreatedAtAsc(spotId)
                .stream().map(PhotoDto::from).toList();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoDto> upload(@PathVariable UUID spotId,
                                           @AuthenticationPrincipal UserDetails user,
                                           @RequestParam("file") MultipartFile file) throws Exception {
        Spot spot = getOwnedSpot(spotId, user);

        if (photoRepository.countBySpotId(spotId) >= MAX_PHOTOS) {
            return ResponseEntity.badRequest().build();
        }

        StorageService.StoredFile stored = storageService.store(file, spotId);

        SpotPhoto photo = SpotPhoto.builder()
                .spot(spot)
                .url(stored.url())
                .filename(stored.filename())
                .sizeBytes(stored.sizeBytes())
                .build();
        photo = photoRepository.save(photo);
        return ResponseEntity.status(201).body(PhotoDto.from(photo));
    }

    @DeleteMapping("/{photoId}")
    public ResponseEntity<Void> delete(@PathVariable UUID spotId,
                                       @PathVariable UUID photoId,
                                       @AuthenticationPrincipal UserDetails user) {
        getOwnedSpot(spotId, user);
        SpotPhoto photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found"));
        storageService.delete(photo.getFilename(), spotId);
        photoRepository.delete(photo);
        return ResponseEntity.noContent().build();
    }

    private Spot getOwnedSpot(UUID spotId, UserDetails user) {
        UUID userId = UUID.fromString(user.getUsername());
        Spot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));
        if (!spot.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Spot not found");
        }
        return spot;
    }
}
