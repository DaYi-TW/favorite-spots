package com.favoritespot.graph.repository;

import com.favoritespot.graph.node.SpotNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpotNodeRepository extends Neo4jRepository<SpotNode, Long> {

    Optional<SpotNode> findBySpotId(String spotId);

    void deleteBySpotId(String spotId);

    @Query("""
        MATCH (s:Spot {spotId: $spotId})-[r*1..2]-(related:Spot)
        WHERE related.spotId <> $spotId
        RETURN s, collect(r), collect(related)
        LIMIT 50
        """)
    List<SpotNode> findConnectedSpots(@Param("spotId") String spotId);

    @Query("""
        MATCH (s:Spot) WHERE s.spotId IN $spotIds
        RETURN s
        """)
    List<SpotNode> findAllBySpotIds(@Param("spotIds") List<String> spotIds);

    @Query("""
        MATCH (s:Spot {spotId: $spotId})-[r]-(related:Spot)
        WITH related, count(r) as connectionCount
        ORDER BY connectionCount DESC
        RETURN related
        LIMIT 5
        """)
    List<SpotNode> findRelatedSpots(@Param("spotId") String spotId);
}
