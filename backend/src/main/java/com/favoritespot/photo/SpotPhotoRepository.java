package com.favoritespot.photo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SpotPhotoRepository extends JpaRepository<SpotPhoto, UUID> {
    List<SpotPhoto> findBySpotIdOrderByCreatedAtAsc(UUID spotId);
    long countBySpotId(UUID spotId);
}
