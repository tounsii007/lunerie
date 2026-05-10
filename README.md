# Lunerie

Premium mobile-first travel discovery — hidden places, viewpoints, photogenic escapes.

This monorepo ships:
- a modern **React 19 / Vite 8 / Tailwind 4** SPA (`src/`),
- a **Spring Boot 3.5 / Java 21** REST API (`backend/`),
- a full **observability stack** (Postgres + Loki + Promtail + Grafana + Prometheus + cAdvisor + postgres-exporter) wired via `docker-compose`,
- and ergonomics: `Makefile`, `scripts/`, `.env.example`, dev + prod compose overrides.

```
.
├── src/                          # Frontend (Vite + React 19)
├── backend/                      # Spring Boot API
├── ops/                          # nginx, loki, promtail, grafana, prometheus, tempo, otel-collector configs
├── scripts/                      # smoke / health / backup / restore / jwt-secret
├── docker-compose.yml            # base stack
├── docker-compose.override.yml   # local dev (Adminer, debug logs)
├── docker-compose.prod.yml       # prod hardening + extra exporters
├── Makefile                      # one-liner ops
├── .env.example                  # all configurable env vars
└── .env.frontend.example         # Vite-side env vars
```

---

## Quick start

```bash
# 1) Configure
cp .env.example .env
make init        # generates a strong LUNERIE_JWT_SECRET into .env if missing

# 2) Start the full stack
make up

# 3) Health check
make smoke
```

| Service        | URL                                             |
|----------------|-------------------------------------------------|
| API gateway    | http://localhost:8080                           |
| Swagger UI     | http://localhost:8080/swagger-ui.html           |
| Adminer        | http://localhost:8081                           |
| Grafana        | http://localhost:3000 (admin / admin)           |
| Prometheus     | http://localhost:9090                           |
| Loki           | http://localhost:3100                           |
| Tempo          | http://localhost:3200                           |
| OTel collector | http://localhost:4318 (OTLP HTTP)               |
| Frontend       | `npm run dev` → http://localhost:5173           |

---

## Make targets

| Target            | What it does                                                   |
|-------------------|----------------------------------------------------------------|
| `make help`       | Show all available targets                                     |
| `make init`       | Copy `.env.example` → `.env` + inject a JWT secret             |
| `make secret`     | Print a fresh 64-char JWT secret                               |
| `make up`         | Build & start the dev stack                                    |
| `make up-prod`    | Start the production stack (`docker-compose.prod.yml` overlay) |
| `make down`       | Stop everything (volumes preserved)                            |
| `make logs`       | Tail logs from all services                                    |
| `make ps`         | Show running services                                          |
| `make build`      | Rebuild backend image                                          |
| `make rebuild`    | Rebuild + restart backend                                      |
| `make backend-shell` / `make db-shell` | Shells into running containers           |
| `make db-dump` / `make db-restore` | Backup / restore Postgres                  |
| `make scale N=4`  | Scale backend replicas behind nginx                            |
| `make smoke`      | Hit health, places, countries, tags, prometheus, OpenAPI       |
| `make health`     | Pretty per-service docker health summary                       |
| `make stats`      | Live resource stats                                            |
| `make test`       | Run backend tests with Testcontainers                          |
| `make clean`      | Stop **and** delete all volumes (DESTRUCTIVE)                  |
| `make prune`      | Remove dangling docker resources                               |

---

## Backend

Full reference: [`backend/README.md`](backend/README.md).

### Endpoints (high level)

| Domain         | Sample endpoints                                                                                                              |
|----------------|-------------------------------------------------------------------------------------------------------------------------------|
| **Auth**       | `POST /api/auth/{register,login,refresh,logout,logout-all}`, `GET /api/auth/me`                                               |
| **Users**      | `GET/PATCH /api/users/me`, `POST /api/users/me/password`, `GET/PUT/PATCH /api/users/me/preferences`                           |
| **GDPR**       | `GET /api/users/me/export` · `DELETE /api/users/me/permanent`                                                                 |
| **Places**     | `list / count / categories / stats / explore / search / nearby / by-country / by-category / by-tag / popular / recent / random / suggest / {id} / by-slug / {id}/related` |
| **Countries**  | `list / all / count / regions / regions/stats / by-region / search / {code} / by-code3 / {code}/places / {code}/stats`        |
| **Favorites**  | `list / count / check/{placeId} / POST /{placeId} / DELETE /{placeId} / DELETE /`                                             |
| **Recent views** | `list / top / count / POST /{placeId} / DELETE /{placeId} / DELETE /`                                                       |
| **Recent searches** | `list / top / count / trending / POST / DELETE /{id} / DELETE /`                                                         |
| **Tags**       | `list / trending`                                                                                                             |
| **Admin**      | user mgmt (active/admin/revoke-tokens), place CRUD, country upsert/delete, cache eviction (ROLE_ADMIN required)               |
| **Health**     | `/api/health`, `/actuator/health`, `/actuator/prometheus`                                                                     |

### Notable robustness features

- Stateless JWT (access + opaque refresh with rotation + reuse-detection)
- Per-user concurrent refresh-token cap + hourly cleanup job
- Bucket4j rate limiter on `/api/auth/*`
- Caffeine cache (countries, regions, place categories, place stats, tags)
- ETag filter for hot read-only endpoints
- Slow-request WARN logger (`> LUNERIE_SLOW_REQ_THRESHOLD_MS`) → easy Loki query
- Custom Micrometer counters: `lunerie.users.{registered,login.{success,failure}}`, `lunerie.favorites.{added,removed}`, `lunerie.recent_views.recorded`, `lunerie.searches.recorded`, `lunerie.places.viewed{country=…}`
- Structured JSON logs in `docker`/`prod` with `requestId` and `userId` MDC
- Optimistic locking + JPA auditing on every entity
- Flyway-managed schema with seed data (18 countries, 16 places)
- Admin auto-bootstrap from `LUNERIE_ADMIN_EMAIL` + `LUNERIE_ADMIN_PASSWORD`

### Multi-instance

The backend is fully stateless. To scale horizontally:

```bash
make scale N=4
```

nginx (`ops/nginx/nginx.conf`) round-robins via Docker's embedded DNS resolver, and Prometheus auto-discovers replicas with a DNS service-discovery rule.

---

## Frontend

The SPA already works standalone with mock data. To wire it to the backend:

```bash
cp .env.frontend.example .env.local
# .env.local already points to http://localhost:8080
npm install
npm run dev
```

Use the typed API client:

```ts
import lunerie from '@/api/lunerie/lunerieClient';
import { useAuth } from '@/state/auth-context';

const { login, logout, user, isAdmin } = useAuth();

await lunerie.places.search('patagonia');
await lunerie.favorites.add(placeId);
await lunerie.recentSearches.record('waterfalls', resultCount);
```

Bearer auth + automatic refresh-token rotation are handled inside the client. Every outbound request also carries a W3C `traceparent` header (see [`src/api/tracing.ts`](src/api/tracing.ts)) so backend traces inherit the frontend trace id.

### PWA

The frontend ships as an installable Progressive Web App:

| Capability            | Where                                                                |
|-----------------------|----------------------------------------------------------------------|
| Manifest              | [`public/manifest.webmanifest`](public/manifest.webmanifest)         |
| Icons                 | `favicon.svg`, `icon-maskable.svg`, `icon-monochrome.svg`, `apple-touch-icon.svg` |
| Service worker        | [`public/sw.js`](public/sw.js) — four named caches per resource type |
| Offline fallback      | [`public/offline.html`](public/offline.html)                         |
| Install prompt UI     | `useInstallPrompt` hook + `InstallChip` component in [`src/app/App.tsx`](src/app/App.tsx) |
| Update notification   | `onServiceWorkerUpdate` + `UpdateBanner` ("New version ready · Reload") |
| Offline status banner | `useOnlineStatus` hook + `OfflineBanner` component                   |
| App shortcuts         | Manifest declares Explore / Search / Nearby / Favorites jumpers      |

The service worker uses **stale-while-revalidate** for hashed Vite assets and external API hosts, **cache-first with eviction (60 entries / 24h TTL)** for images, and **network-first with offline.html fallback** for navigations. Bumping `CACHE_VERSION` in `sw.js` invalidates everything safely.

### Internationalization

Six locales (`en`, `de`, `fr`, `es`, `pt`, `ar`) covering ~200 keys each, including `auth.*`, `account.*`, `pwa.*`, `errors.*`, `geoState*`, search status, settings descriptions, and validation messages.

```tsx
const { t, formatNumber, formatRelativeTime, formatDate } = useI18n();

t('auth.welcomeBackUser', { name: 'Aisha' });
t('resultsForTerm', { count: results.length, term: query });
//   → "12 results for tunisia"  (count !== 1 picks resultsForTerm__plural)

formatNumber(1234567);                        // "1,234,567" (locale-aware)
formatRelativeTime(-3, 'hour');               // "3 hours ago" / "il y a 3 heures"
formatDate(place.updatedAt, { dateStyle: 'long' });
```

The provider auto-sets `<html lang>` + `dir="rtl"` for Arabic.

---

## Production overlay

```bash
make up-prod
```

`docker-compose.prod.yml` adds:
- **postgres-exporter** + **cAdvisor** scraped by Prometheus
- read-only filesystems, `cap_drop: [ALL]`, `no-new-privileges`
- restart policies, tighter Postgres tuning
- Grafana hardening flags

---

## Observability

Three pillars, all bidirectionally cross-linked in Grafana.

- **Logs** — every container → Promtail → Loki. Backend logs are structured JSON; `requestId`, `userId`, `traceId`, `spanId` are exposed as Loki fields. The Loki datasource has a derived field that turns any `traceId` in a log line into a clickable "View trace" button that jumps straight to Tempo.
- **Metrics** — Spring Actuator → Prometheus. Default Grafana dashboard "Lunerie Overview" plots requests/sec, p95 latency, JVM heap, Hikari pool, error counts, plus a live log panel. Cache hit-rates are recorded per Caffeine cache. Prometheus has `--web.enable-remote-write-receiver` + `exemplar-storage` enabled so exemplars on histograms link directly to the matching trace.
- **Traces** — Spring Boot Observation API → Micrometer Tracing → OpenTelemetry SDK → OTLP → OTel collector → Tempo. The frontend emits W3C `traceparent` on every API call (see [`src/api/tracing.ts`](src/api/tracing.ts)) so a single trace spans browser → controller → JPA → DB. Custom spans are declared with `@Observed` (see `AuthService.register`, `AuthService.login`, `PlaceService.search`).

Tracing pipeline:

```
SPA (W3C traceparent) ──▶ backend (Micrometer Tracing → OTLP HTTP)
                                   │
                                   ▼
                       OTel collector (memory_limiter → batch)
                                   │
                                   ▼
                                Tempo  ──▶  Grafana (trace view)
                                   │
                                   └──▶ Prometheus (span-metrics remote_write)
```

Toggle / tune via env vars:

| Env                            | Default                                  | Purpose                                  |
|--------------------------------|------------------------------------------|------------------------------------------|
| `LUNERIE_TRACING_ENABLED`      | `true`                                   | Master switch                            |
| `LUNERIE_TRACING_SAMPLE_RATE`  | `1.0`                                    | Probability sampler                      |
| `LUNERIE_OTLP_ENDPOINT`        | `http://otel-collector:4318/v1/traces`   | Where to ship spans                      |
| `LUNERIE_TRACING_PROPAGATION`  | `W3C`                                    | `W3C` / `B3` / `B3_MULTI`                |
| `LUNERIE_ENV`                  | `docker`                                 | Lands as `deployment.environment` attr   |

In Grafana: **Tempo → click span → "Logs for this span"** to drop into Loki at the matching time window, or **"p95 latency by service"** to see span-derived latency metrics. Reverse direction works too: any Loki log line with a `traceId` carries a "View trace" button.

---

## Repository scripts

| Script                              | Purpose                                                       |
|-------------------------------------|---------------------------------------------------------------|
| `scripts/generate-jwt-secret.sh`    | Generate a strong secret (or `--print` to stdout)             |
| `scripts/db-backup.sh`              | `pg_dump` to `./backup/lunerie-YYYYMMDD-HHMMSS.sql` (keeps 14)|
| `scripts/db-restore.sh [file.sql]`  | Restore the latest (or specified) dump                        |
| `scripts/smoke.sh`                  | Hit every health-relevant endpoint                            |
| `scripts/health.sh`                 | Pretty docker container health summary                        |

---

## License

MIT
