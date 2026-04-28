# Quickstart: Knowledge Graph

**Last updated**: 2026-04-18
**Prerequisite**: Phase 1 MVP must be running

## Add Neo4j to Docker Compose

Add the following service to `docker-compose.yml`:

```yaml
neo4j:
  image: neo4j:5-community
  ports:
    - "7474:7474"   # Neo4j Browser
    - "7687:7687"   # Bolt protocol
  environment:
    NEO4J_AUTH: neo4j/password
  volumes:
    - neo4j_data:/data
```

## Environment Variables (backend/.env)

```
SPRING_NEO4J_URI=bolt://localhost:7687
SPRING_NEO4J_AUTHENTICATION_USERNAME=neo4j
SPRING_NEO4J_AUTHENTICATION_PASSWORD=password
```

## Start All Services

```bash
docker compose up --build
```

Neo4j Browser: http://localhost:7474 (login: neo4j / password)

## Verify Indexes

After backend starts, connect to Neo4j Browser and run:

```cypher
SHOW INDEXES
```

Confirm `spot_spotId`, `spot_category`, `city_name` indexes exist.

## Test Graph Sync

```bash
# 1. Save a spot via API
curl -X POST http://localhost:8080/api/spots \
  -H "Cookie: <jwt_cookie>" \
  -d '{"name":"Test Cafe","category":"CAFE","city":"Taipei",...}'

# 2. Verify node was created in Neo4j Browser:
MATCH (s:Spot {spotId: "<uuid>"}) RETURN s
```

## Run Graph-Related Tests

```bash
# All graph tests
cd backend && ./mvnw test -Dtest="Graph*"

# Single test
cd backend && ./mvnw test -Dtest=GraphSyncServiceTest#shouldCreateSameCategoryRelationship
```
