# Quickstart: MVP Core

**Last updated**: 2026-04-18

## Prerequisites

- Docker Desktop (with Docker Compose v2)
- Java 21 (for running backend outside Docker)
- Node.js 20 (for running frontend outside Docker)

## Start Everything with Docker Compose

```bash
# Clone the repo and start all services
docker compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432 (user: postgres, pass: postgres, db: favoritespot)
- Redis: localhost:6379

## Environment Variables

**backend/.env** (or set in docker-compose.yml)
```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/favoritespot
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379
JWT_SECRET=change-me-in-production-min-32-chars
ANTHROPIC_API_KEY=sk-ant-...
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Run Backend Only

```bash
cd backend
./mvnw spring-boot:run
```

## Run Frontend Only

```bash
cd frontend
npm install
npm run dev
```

## Run Backend Tests

```bash
# All tests
cd backend && ./mvnw test

# Single test class
cd backend && ./mvnw test -Dtest=LinkParserServiceTest

# Single test method
cd backend && ./mvnw test -Dtest=LinkParserServiceTest#shouldReturnCachedResult
```

## Run Frontend Tests

```bash
cd frontend
npm test               # watch mode
npm test -- --run      # single run (CI)
```

## Database Migrations

Flyway runs automatically on backend startup. Migration files live in:
```
backend/src/main/resources/db/migration/
  V1__create_users.sql
  V2__create_spots.sql
  V3__create_tags.sql
  V4__create_spot_sources.sql
```

To reset the database in development:
```bash
docker compose down -v   # removes volumes
docker compose up
```

## Lint

```bash
# Backend (Checkstyle via Maven)
cd backend && ./mvnw checkstyle:check

# Frontend (ESLint + Prettier)
cd frontend && npm run lint
cd frontend && npm run format:check
```
