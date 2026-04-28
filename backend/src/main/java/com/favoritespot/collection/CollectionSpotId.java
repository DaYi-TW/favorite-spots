package com.favoritespot.collection;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class CollectionSpotId implements Serializable {
    @Column(name = "collection_id")
    private UUID collectionId;

    @Column(name = "spot_id")
    private UUID spotId;
}
