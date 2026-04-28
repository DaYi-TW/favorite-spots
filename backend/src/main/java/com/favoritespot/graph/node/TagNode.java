package com.favoritespot.graph.node;

import lombok.*;
import org.springframework.data.neo4j.core.schema.*;

@Node("Tag")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TagNode {

    @Id @GeneratedValue
    private Long id;

    private String name;
    private String type;
}
