package com.favoritespot.graph.service;

import com.favoritespot.graph.dto.GraphData;
import com.favoritespot.graph.node.SpotNode;
import com.favoritespot.graph.repository.SpotNodeRepository;
import com.favoritespot.spot.SpotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GraphQueryService {

    private final SpotNodeRepository spotNodeRepository;
    private final Neo4jClient neo4jClient;
    private final SpotRepository spotRepository;

    public GraphData getSpotGraph(String spotId, String userId) {
        List<GraphData.GraphNode> nodes = new ArrayList<>();
        List<GraphData.GraphEdge> edges = new ArrayList<>();

        try {
            // Add the central node
            spotNodeRepository.findBySpotId(spotId).ifPresent(n ->
                nodes.add(toGraphNode(n)));

            // Connected nodes
            List<SpotNode> connected = spotNodeRepository.findConnectedSpots(spotId);
            connected.forEach(n -> {
                if (nodes.stream().noneMatch(gn -> gn.id().equals(n.getSpotId()))) {
                    nodes.add(toGraphNode(n));
                }
            });

            // Edges via Cypher
            edges.addAll(queryEdges(spotId, connected.stream()
                    .map(SpotNode::getSpotId).collect(Collectors.toList())));

        } catch (Exception e) {
            log.warn("Graph query failed for spot {}: {}", spotId, e.getMessage());
        }

        return new GraphData(nodes, edges);
    }

    public GraphData getFullUserGraph(String userId) {
        List<GraphData.GraphNode> nodes = new ArrayList<>();
        List<GraphData.GraphEdge> edges = new ArrayList<>();

        try {
            // Get all spotIds for this user from PostgreSQL
            List<String> spotIds = spotRepository.findByUserId(UUID.fromString(userId))
                    .stream().map(s -> s.getId().toString()).collect(Collectors.toList());

            if (spotIds.isEmpty()) return new GraphData(nodes, edges);

            // Get all SpotNodes
            List<SpotNode> spotNodes = spotNodeRepository.findAllBySpotIds(spotIds);
            spotNodes.forEach(n -> nodes.add(toGraphNode(n)));

            // Get edges between them
            if (spotIds.size() > 1) {
                edges.addAll(queryEdgesBetween(spotIds));
            }

        } catch (Exception e) {
            log.warn("Full graph query failed for user {}: {}", userId, e.getMessage());
        }

        return new GraphData(nodes, edges);
    }

    public List<String> getRelatedSpotIds(String spotId) {
        try {
            return spotNodeRepository.findRelatedSpots(spotId).stream()
                    .map(SpotNode::getSpotId)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Related spots query failed for spot {}: {}", spotId, e.getMessage());
            return List.of();
        }
    }

    private List<GraphData.GraphEdge> queryEdges(String centerSpotId, List<String> connectedIds) {
        List<String> allIds = new ArrayList<>(connectedIds);
        allIds.add(centerSpotId);
        return queryEdgesBetween(allIds);
    }

    private List<GraphData.GraphEdge> queryEdgesBetween(List<String> spotIds) {
        List<GraphData.GraphEdge> edges = new ArrayList<>();
        try {
            neo4jClient.query("""
                MATCH (a:Spot)-[r]-(b:Spot)
                WHERE a.spotId IN $spotIds AND b.spotId IN $spotIds AND id(a) < id(b)
                RETURN a.spotId AS from, b.spotId AS to, type(r) AS relType
                """)
                    .bind(spotIds).to("spotIds")
                    .fetch()
                    .all()
                    .forEach(row -> {
                        String type = (String) row.get("relType");
                        edges.add(new GraphData.GraphEdge(
                                (String) row.get("from"),
                                (String) row.get("to"),
                                type,
                                relTypeToLabel(type)
                        ));
                    });
        } catch (Exception e) {
            log.warn("Edge query failed: {}", e.getMessage());
        }
        return edges;
    }

    private GraphData.GraphNode toGraphNode(SpotNode n) {
        return new GraphData.GraphNode(n.getSpotId(), n.getName(), n.getCategory(), n.getCity(), null);
    }

    private String relTypeToLabel(String type) {
        return switch (type) {
            case "SAME_CATEGORY" -> "Same Category";
            case "SIMILAR_STYLE" -> "Similar Style";
            case "FROM_SAME_SOURCE" -> "Same Source";
            case "HAS_TAG" -> "Tag";
            case "LOCATED_IN" -> "Located In";
            default -> type;
        };
    }
}
