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

Postgres is **not** included. Install and run PostgreSQL separately (system install or managed DB). Docker Compose runs Redis and the app only.

```bash
docker-compose up -d
```

**Before running:**

1. Install and start Postgres (e.g. `second_bloom` database, user/password of your choice).
2. In `.env`, set `DATABASE_URL` to your Postgres:
   - **App runs in Docker** and Postgres is on the **same host**: use `host.docker.internal` as host so the container can reach the host, e.g.  
     `postgresql://postgres:YOUR_PASSWORD@host.docker.internal:5432/second_bloom?schema=public`
   - **App runs on the host** (e.g. `npm run start:dev`): use `localhost`, e.g.  
     `postgresql://postgres:YOUR_PASSWORD@localhost:5432/second_bloom?schema=public`
   - **Postgres is on another server**: use that host (or IP) and port in the URL.

Then `docker-compose up -d` starts Redis and the app; the app connects to Postgres using `DATABASE_URL` from `.env`.

### When you change the database password

Update `DATABASE_URL` in `.env` with the new password, then restart the app (`docker-compose up -d --force-recreate app` or restart your Node process).

---

## Testing

```bash
npm run test
```

E2E and coverage: `npm run test:e2e`, `npm run test:cov`.
