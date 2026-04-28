package com.favoritespot.spot;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpotSourceRepository extends JpaRepository<SpotSource, UUID> {
    List<SpotSource> findBySpotId(UUID spotId);
}
