package com.favoritespot.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(basePackages = {
        "com.favoritespot.auth",
        "com.favoritespot.spot",
        "com.favoritespot.tag",
        "com.favoritespot.photo",
        "com.favoritespot.collection"
})
@EnableNeo4jRepositories(
        basePackages = "com.favoritespot.graph.repository",
        transactionManagerRef = "transactionManager"
)
public class Neo4jConfig {
}
