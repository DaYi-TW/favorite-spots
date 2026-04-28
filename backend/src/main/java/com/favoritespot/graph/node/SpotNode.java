package com.favoritespot.graph.node;

import lombok.*;
import org.springframework.data.neo4j.core.schema.*;
import java.util.ArrayList;
import java.util.List;

@Node("Spot")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SpotNode {

    @Id @GeneratedValue
    private Long id;

    @Property("spotId")
    private String spotId;

    private String name;
    private String category;
    private String city;

    @Relationship(type = "HAS_TAG", direction = Relationship.Direction.OUTGOING)
    @Builder.Default
    private List<TagNode> tags = new ArrayList<>();

    @Relationship(type = "LOCATED_IN", direction = Relationship.Direction.OUTGOING)
    private CityNode cityNode;
}
