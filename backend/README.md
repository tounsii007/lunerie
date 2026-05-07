# Lunerie API

Spring Boot 3.5 · Java 21 · Postgres 17 · stateless JWT · multi-instance ready.

---

## Stack

| Layer            | Tech                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| Framework        | Spring Boot 3.5 (Web, Validation, Data JPA, Security, Actuator)        |
| Language         | Java 21 (virtual threads enabled)                                     |
| Database         | PostgreSQL 17 + Flyway migrations                                     |
| Auth             | JWT (access) + opaque refresh token rotation, BCrypt(12), DB-backed    |
| Docs             | springdoc-openapi (Swagger UI at `/swagger-ui.html`)                  |
| Observability    | Micrometer → Prometheus, JSON logs (logstash-logback-encoder) → Loki  |
| Rate limiting    | Bucket4j (per-IP token bucket on `/api/auth/*`)                       |
| Build            | Maven 3.9                                                              |
| Container        | Multistage `eclipse-temurin:21-jre-alpine`, non-root user, healthcheck |

---

## Architecture

```
backend/
├── pom.xml
├── Dockerfile
└── src/main/java/com/lunerie/api/
    ├── LunerieApplication.java
    ├── common/                  # BaseEntity, ApiError, exception types, GlobalExceptionHandler
    ├── config/                  # Security, OpenAPI, CORS, async, request-id filter
    ├── security/                # JwtService, JwtAuthenticationFilter, AppUserDetails, CurrentUser
    ├── domain/                  # JPA entities + repositories
    │   ├── user/                # User, UserRole, UserPreferences, RefreshToken + repos
    │   ├── country/             # Country + repo
    │   ├── place/               # Place, PlaceCategory + repo (Specifications, native nearby query)
    │   ├── favorite/            # Favorite + repo
    │   └── recentview/          # RecentView + repo
    ├── application/             # Use-case services (read transactions, invariants, side-effects)
    │   ├── auth/                # AuthService, RateLimiter, RefreshTokenCleanupJob
    │   ├── user/                # UserService, PreferencesService
    │   ├── place/               # PlaceService (search, nearby, stats, by-category, ...)
    │   ├── country/             # CountryService (regions, by-code, stats)
    │   ├── favorite/            # FavoriteService
    │   └── recentview/          # RecentViewService
    └── web/                     # @RestController + DTO records (PlaceDtos, CountryDtos, AuthDtos, UserDtos)
└── src/main/resources/
    ├── application.yml          # base profile
    ├── application-docker.yml   # docker profile overrides
    ├── logback-spring.xml       # JSON logs in docker/prod, pretty console in dev
    └── db/migration/
        ├── V1__init_schema.sql        # full schema with indexes + checks
        ├── V2__seed_countries.sql     # 18 countries
        └── V3__seed_places.sql        # 16 curated places
```

The architecture follows the **layered / hexagonal-ish** style:
- **Domain** — entities, repositories. Pure data + JPA mapping.
- **Application** — use-case services, transactional boundaries, business invariants.
- **Web** — controllers + DTOs. No business logic.
- **Common** — cross-cutting types (errors, base entity, page response).
- **Config / Security** — Spring infrastructure.

Key robustness choices:
- Constructor injection only (`@RequiredArgsConstructor`) — testable, no field magic.
- DTOs are Java `records`. Jakarta Bean Validation on every input boundary.
- Optimistic locking (`@Version`) on every entity → safe concurrent updates.
- Auditing (`@CreatedDate` / `@LastModifiedDate`) on every entity.
- `open-in-view: false` — no LIY-loading surprises in controllers.
- `@RestControllerAdvice` covers 12 exception types → consistent `ApiError` JSON.
- Refresh-token rotation with reuse-detection (revoke-all on suspected reuse).
- Per-user concurrent refresh-token cap (default 8) + hourly cleanup job.
- Rate-limited auth endpoints.
- CORS, CSRF disabled (stateless JWT), session policy STATELESS.
- Indexed FKs, partial indexes, `CHECK` constraints in SQL.
- Hibernate batch inserts/updates (`jdbc.batch_size=50`).
- Virtual threads enabled by default (Java 21).

---

## Endpoints

### Auth (`/api/auth`)

| Method | Path                     | Description                                |
|--------|--------------------------|--------------------------------------------|
| POST   | `/register`              | Create account, issue access + refresh     |
| POST   | `/login`                 | Email + password                           |
| POST   | `/refresh`               | Rotate refresh token                       |
| POST   | `/logout`                | Revoke given refresh token                 |
| POST   | `/logout-all` 🔒         | Revoke all refresh tokens for current user |
| GET    | `/me` 🔒                 | Authenticated user summary                 |

### Users (`/api/users/me`) 🔒

| Method  | Path             | Description                |
|---------|------------------|----------------------------|
| GET     | `/`              | Profile                    |
| PATCH   | `/`              | Update display name        |
| DELETE  | `/`              | Deactivate account         |
| POST    | `/password`      | Change password            |
| GET     | `/preferences`   | Read preferences           |
| PUT     | `/preferences`   | Replace preferences        |
| PATCH   | `/preferences`   | Patch preferences          |

### Places (`/api/places`)

| Method | Path                          | Description                                                |
|--------|-------------------------------|------------------------------------------------------------|
| GET    | `/`                           | List w/ filters: countryCode, category, withImageOnly, ... |
| GET    | `/count`                      | Total count                                                |
| GET    | `/categories`                 | Supported categories enum                                  |
| GET    | `/stats`                      | Aggregate stats + per-category counts                      |
| GET    | `/explore`                    | Curated trending feed                                      |
| GET    | `/search?q=`                  | Full-text + filters                                        |
| GET    | `/nearby?lat=&lon=&radiusKm=` | Geographic Haversine search                                |
| GET    | `/by-country/{countryCode}`   | Places in country                                          |
| GET    | `/by-category/{category}`     | Places in category                                         |
| GET    | `/popular`                    | popularity ≥ minPopularity                                 |
| GET    | `/recent`                     | Most recently updated                                      |
| GET    | `/random?limit=`              | Random N                                                   |
| GET    | `/{id}`                       | Detail by UUID                                             |
| GET    | `/by-slug/{slug}`             | Detail by slug                                             |

### Countries (`/api/countries`)

| Method | Path                       | Description                              |
|--------|----------------------------|------------------------------------------|
| GET    | `/`                        | Paginated list                           |
| GET    | `/all`                     | Flat list                                |
| GET    | `/count`                   | Count                                    |
| GET    | `/regions`                 | Distinct regions                         |
| GET    | `/regions/stats`           | Region aggregate stats                   |
| GET    | `/by-region/{region}`      | Countries in region                      |
| GET    | `/search?q=`               | Search by name / code / capital          |
| GET    | `/{code}`                  | By ISO-2                                 |
| GET    | `/by-code3/{code3}`        | By ISO-3                                 |
| GET    | `/{code}/places`           | Places in country                        |
| GET    | `/{code}/stats`            | Country + place count                    |

### Favorites (`/api/favorites`) 🔒

| Method | Path              | Description                      |
|--------|-------------------|----------------------------------|
| GET    | `/`               | Paginated list (newest first)    |
| GET    | `/count`          | Count                            |
| GET    | `/check/{placeId}`| Is favorited?                    |
| POST   | `/{placeId}`      | Add (idempotent)                 |
| DELETE | `/{placeId}`      | Remove                           |
| DELETE | `/`               | Clear all                        |

### Recent views (`/api/recent-views`) 🔒

| Method | Path           | Description                           |
|--------|----------------|---------------------------------------|
| GET    | `/`            | Paginated list (most recent first)    |
| GET    | `/top`         | Top 12                                |
| GET    | `/count`       | Count                                 |
| POST   | `/{placeId}`   | Push (refresh timestamp if exists)    |
| DELETE | `/{placeId}`   | Remove                                |
| DELETE | `/`            | Clear all                             |

### Health & ops

| Method | Path                  | Description                     |
|--------|-----------------------|---------------------------------|
| GET    | `/api/health`         | Service + version + instance    |
| GET    | `/actuator/health`    | Spring liveness/readiness       |
| GET    | `/actuator/prometheus`| Metrics scrape (Prometheus)     |
| GET    | `/swagger-ui.html`    | Swagger UI                      |
| GET    | `/v3/api-docs`        | OpenAPI 3 JSON                  |

🔒 = Bearer token required.

---

## Run locally

### Option A — full stack with docker compose (recommended)

From the repo root:

```bash
cp .env.example .env
# generate a strong jwt secret
openssl rand -hex 48 | xargs -I{} sed -i.bak "s|^LUNERIE_JWT_SECRET=.*|LUNERIE_JWT_SECRET={}|" .env

docker compose up -d --build
```

What you get:

| Service     | URL                                     |
|-------------|-----------------------------------------|
| API         | <http://localhost:8080/api>             |
| Swagger UI  | <http://localhost:8080/swagger-ui.html> |
| Grafana     | <http://localhost:3000>                 |
| Prometheus  | <http://localhost:9090>                 |
| Loki        | <http://localhost:3100>                 |
| Postgres    | `localhost:5432`                        |

Scale the backend horizontally:

```bash
docker compose up -d --scale backend=4
# nginx will round-robin across all replicas; Prometheus auto-discovers them via DNS
```

### Option B — local jvm + docker postgres

```bash
docker compose up -d postgres
cd backend
./mvnw spring-boot:run
```

---

## Multi-instance notes

The backend is **fully stateless**:
- No HTTP sessions (Spring Security `SessionCreationPolicy.STATELESS`).
- Refresh tokens stored hashed in Postgres (rotation + reuse detection).
- Logs sent to stdout only (Loki ingests via Promtail).
- Prometheus discovers replicas via Docker DNS (`dns_sd_configs` resolving `backend`).
- nginx (in `ops/nginx/nginx.conf`) load-balances using its `resolver 127.0.0.11` to keep up with `--scale`.

Increase `BACKEND_REPLICAS` in `.env`, set `DB_POOL_MAX` so `replicas × DB_POOL_MAX < postgres max_connections`, and you're done.

---

## Tests

```bash
cd backend
./mvnw test
```

`LunerieApplicationTests` boots the full Spring context against a real Postgres started by Testcontainers — the safest possible smoke test.
