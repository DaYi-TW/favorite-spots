package com.favoritespot.spot;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "spot_sources")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SpotSource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spot_id", nullable = false)
    private Spot spot;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 20)
    private SourceType sourceType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(name = "parsed_at", nullable = false)
    @Builder.Default
    private OffsetDateTime parsedAt = OffsetDateTime.now();
}
