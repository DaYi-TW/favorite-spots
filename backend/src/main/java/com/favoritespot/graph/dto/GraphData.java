package com.favoritespot.graph.dto;

import java.util.List;

public record GraphData(List<GraphNode> nodes, List<GraphEdge> edges) {

    public record GraphNode(
            String id,
            String label,
            String category,
            String city,
            String coverImageUrl
    ) {}

    public record GraphEdge(
            String from,
            String to,
            String type,
            String label
    ) {}
}
