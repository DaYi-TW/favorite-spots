package com.favoritespot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.neo4j.repository.config.ReactiveNeo4jRepositoryAutoConfiguration;

@SpringBootApplication(exclude = ReactiveNeo4jRepositoryAutoConfiguration.class)
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
