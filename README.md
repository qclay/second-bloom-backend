# Second Bloom Backend

NestJS API for the Second Bloom flower marketplace. Uses PostgreSQL, Redis, Prisma, and optional integrations (S3-compatible storage, SMS, Firebase).

---

## Prerequisites

- **Node.js** 20+
- **PostgreSQL** 16+
- **Redis** 7+

Optional for full features: Digital Ocean Spaces (or S3), Firebase, Eskiz (SMS).

---

## Installation & Setup

**1. Clone and install**

```bash
git clone <repository-url>
cd second-bloom-backend
npm install
```

**2. Environment**

```bash
cp .env.example .env
```

Edit `.env` and set at least:

- `DATABASE_URL` — PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/second_bloom`)
- `REDIS_URL` — Redis URL (e.g. `redis://localhost:6379`)
- `JWT_SECRET` and `REFRESH_TOKEN_SECRET` — strong random strings (change in production)

See `.env.example` for all options (storage, SMS, Firebase, etc.).

**3. Database**

```bash
npm run prisma:generate
npm run prisma:migrate
```

Optional seed:

```bash
npm run prisma:seed
```

**4. Run**

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

By default the API is at `http://localhost:3000`. Root and health are at `/` and `/health`; the rest is under `/api/v1/`.

---

## Important commands

| Command | Description |
|--------|-------------|
| `npm run start:dev` | Run in development with watch |
| `npm run build` | Build for production |
| `npm run start:prod` | Run production build |
| `npm run prisma:migrate` | Apply migrations (dev) |
| `npm run prisma:migrate:deploy` | Apply migrations (e.g. production) |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed database |

---

## API documentation

With the app running:

- **Swagger UI:** `http://localhost:3000/api/docs`  
  (If `SWAGGER_ENABLED=true` and optional `SWAGGER_USERNAME` / `SWAGGER_PASSWORD` in `.env`.)

Full API reference is in Swagger; use it for request/response shapes and to try endpoints.

---

## Health & root

- **Root:** `GET /` — simple “API is up” response.
- **Health:** `GET /health` — basic health (status, timestamp).
- **Detailed:** `GET /health/detailed` — DB, Redis, memory, etc.
- **Readiness:** `GET /health/readiness` — for orchestration/load balancers.
- **Liveness:** `GET /health/liveness` — minimal “process is alive” check.

---

## Docker

```bash
docker-compose up -d
```

Use for running PostgreSQL and Redis locally; see `docker-compose.yml` for details.

The app container always connects to the **postgres** service by name (not `localhost`). Its `DATABASE_URL` is built from `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` in `.env`, so you can keep `DATABASE_URL` in `.env` set to `localhost` for local development (e.g. `npm run start:dev`) and docker-compose will still connect correctly.

### Running Postgres separately

If you run Postgres on your own (separate Docker, local install, or managed DB) instead of this project’s docker-compose:

1. In `.env`, set `DATABASE_URL` to that instance, e.g.:
   - Local / same machine: `postgresql://postgres:YOUR_PASSWORD@localhost:5432/second_bloom?schema=public`
   - Postgres in another Docker (same host): use the container name or `host.docker.internal` as host, and the correct port/password.

2. Run the app with Node (e.g. `npm run start:dev` or `npm run start:prod`). You do **not** need to start the `postgres` or `app` services from this repo’s docker-compose.

### When you change the database password

If you see **"Authentication failed... the provided database credentials for postgres are not valid"**:

- **Postgres run separately:** Update `DATABASE_URL` in `.env` with the new password, then **restart the app** (e.g. restart `npm run start:dev` or your process manager) so it loads the new URL.

- **Using this repo’s docker-compose:** Update both `POSTGRES_PASSWORD` and `DATABASE_URL` in `.env` (same password in the URL; host is `postgres`). Then run `docker-compose up -d --force-recreate app`. Note: Postgres only reads `POSTGRES_PASSWORD` when the data volume is first created; if the DB already exists, change the password inside Postgres or wipe the volume and re-init.

---

## Testing

```bash
npm run test
```

E2E and coverage: `npm run test:e2e`, `npm run test:cov`.
