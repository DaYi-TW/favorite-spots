package com.favoritespot.collection;

import com.favoritespot.spot.Spot;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "collection_spots")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CollectionSpot {

    @EmbeddedId
    @Builder.Default
    private CollectionSpotId id = new CollectionSpotId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("collectionId")
    @JoinColumn(name = "collection_id")
    private Collection collection;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("spotId")
    @JoinColumn(name = "spot_id")
    private Spot spot;

    @Column(nullable = false)
    @Builder.Default
    private int position = 0;

    @Column(name = "added_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime addedAt = OffsetDateTime.now();
}
