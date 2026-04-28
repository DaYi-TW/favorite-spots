package com.favoritespot.graph.service;

import com.favoritespot.graph.node.CityNode;
import com.favoritespot.graph.node.SpotNode;
import com.favoritespot.graph.node.TagNode;
import com.favoritespot.graph.repository.SpotNodeRepository;
import com.favoritespot.spot.Spot;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GraphSyncService {

    private final SpotNodeRepository spotNodeRepository;
    private final Neo4jClient neo4jClient;

    public void syncSpot(Spot spot) {
        try {
            // Build tag nodes
            List<TagNode> tagNodes = spot.getTags().stream()
                    .map(tag -> TagNode.builder()
                            .name(tag.getName())
                            .type(tag.getType().name())
                            .build())
                    .collect(Collectors.toList());

            // Build city node
            CityNode cityNode = null;
            if (spot.getCity() != null && !spot.getCity().isBlank()) {
                cityNode = CityNode.builder().name(spot.getCity()).build();
            }

            // Find or create SpotNode
            SpotNode node = spotNodeRepository.findBySpotId(spot.getId().toString())
                    .orElse(SpotNode.builder().spotId(spot.getId().toString()).build());
            node.setName(spot.getName());
            node.setCategory(spot.getCategory().name());
            node.setCity(spot.getCity());
            node.setTags(tagNodes);
            node.setCityNode(cityNode);

            spotNodeRepository.save(node);

            // Build inter-spot relationships (best-effort)
            buildRelationships(spot);

        } catch (Exception e) {
            log.warn("Neo4j sync failed for spot {}: {}", spot.getId(), e.getMessage());
        }
    }

    public void deleteSpot(String spotId) {
        try {
            spotNodeRepository.deleteBySpotId(spotId);
        } catch (Exception e) {
            log.warn("Neo4j delete failed for spot {}: {}", spotId, e.getMessage());
        }
    }

    private void buildRelationships(Spot spot) {
        try {
            String spotId = spot.getId().toString();
            String category = spot.getCategory().name();
            Set<String> tagNames = spot.getTags().stream()
                    .map(t -> t.getName())
                    .collect(Collectors.toSet());

            // SAME_CATEGORY
            neo4jClient.query("""
                MATCH (a:Spot {spotId: $spotId}), (b:Spot)
                WHERE b.spotId <> $spotId AND b.category = $category
                MERGE (a)-[:SAME_CATEGORY]-(b)
                """)
                    .bind(spotId).to("spotId")
                    .bind(category).to("category")
                    .run();

            // SIMILAR_STYLE (2+ shared tags)
            if (!tagNames.isEmpty()) {
                neo4jClient.query("""
                    MATCH (a:Spot {spotId: $spotId})-[:HAS_TAG]->(t:Tag)<-[:HAS_TAG]-(b:Spot)
                    WHERE b.spotId <> $spotId
                    WITH a, b, count(t) as shared
                    WHERE shared >= 2
                    MERGE (a)-[:SIMILAR_STYLE]-(b)
                    """)
                        .bind(spotId).to("spotId")
                        .run();
            }

        } catch (Exception e) {
            log.warn("Neo4j relationship build failed for spot {}: {}", spot.getId(), e.getMessage());
        }
    }
}
