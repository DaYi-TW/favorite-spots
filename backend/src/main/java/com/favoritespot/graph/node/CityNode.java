package com.favoritespot.graph.node;

import lombok.*;
import org.springframework.data.neo4j.core.schema.*;

@Node("City")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CityNode {

    @Id @GeneratedValue
    private Long id;

    private String name;
}
