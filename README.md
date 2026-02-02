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

Optional seed (run **after** migrations so all tables exist):

```bash
npm run prisma:migrate        # dev: creates/updates tables
# or: npm run prisma:migrate:deploy   # production
npm run prisma:seed
```

If you see **"The table \`public.messages\` does not exist"**, run `npx prisma migrate deploy` (or `npm run prisma:migrate`) first to create all tables, then run the seed again.

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
2. In `.env`, set `DATABASE_URL` to your Postgres (see below for **Postgres in another Docker container**).
3. Run `docker-compose up -d`.

**Postgres in another Docker container (app can’t connect):**

The app container must reach Postgres via the **host** or via a **shared network**.

- **Option A – Postgres publishes port 5432 to the host**  
  Ensure your Postgres container has `-p 5432:5432` (or `ports: ["5432:5432"]` in its compose). Then in `.env` set:
  ```env
  DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@host.docker.internal:5432/second_bloom?schema=public
  ```
  `host.docker.internal` is the host machine from inside the app container; the app will connect to the host’s 5432, which forwards to your Postgres container. Restart the app: `docker-compose up -d --force-recreate app`.

- **Option B – Use the Postgres container name**  
  Put the app on the **same Docker network** as the Postgres container. Create a network (e.g. `docker network create shared`), run your Postgres with `--network shared`, and add to this project’s `docker-compose.yml` under `app` → `networks`: `- second-bloom-network` and `- shared`, and under top-level `networks`: `shared: external: true`. Then in `.env` set `DATABASE_URL` with the **Postgres container name** as host (e.g. `postgresql://postgres:pass@postgres:5432/second_bloom?schema=public`).

**Other cases:**

- **App in Docker, Postgres on the same host** (not in Docker): use `host.docker.internal` as host in `DATABASE_URL`.
- **App on the host** (e.g. `npm run start:dev`): use `localhost` as host in `DATABASE_URL`.
- **Postgres on another server**: use that host (or IP) and port in `DATABASE_URL`.

**Postgres resetting when you run `docker-compose up --build`:**

This project’s compose has **only app + redis**; it does **not** include Postgres. So when you run `docker-compose up --build` here, only the app (and redis) are rebuilt — Postgres is never recreated or reset.

- **If Postgres was in the same compose** and data was resetting: run Postgres in a **separate** compose/stack (or standalone container) with its own **named volume**. Start Postgres once with that compose; for this project run only `docker-compose up --build` (app + redis). Connect the app to Postgres via `host.docker.internal:5432` in `DATABASE_URL` (Postgres must publish 5432 to the host). Then `up --build` in this repo never touches Postgres.
- **Do not** run `docker-compose down -v` in the project that has Postgres — that removes volumes and wipes the DB. In this repo, `down -v` only removes the redis volume.

**If you see P1000 and "at postgres:5432" in the log:** Your `DATABASE_URL` still has host `postgres` (the old Docker service). Postgres is no longer in Docker. On the **machine where you run docker-compose** (e.g. the server), edit `.env` and set `DATABASE_URL` to your real Postgres:
- **Postgres on the same host as Docker:** use `host.docker.internal` as host, e.g.  
  `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@host.docker.internal:5432/second_bloom?schema=public`
- Use the same user and password that your Postgres was set up with. Then run `docker-compose up -d --force-recreate app`.

### When you change the database password

Update `DATABASE_URL` in `.env` with the new password, then restart the app (`docker-compose up -d --force-recreate app` or restart your Node process).

---

## Testing

```bash
npm run test
```

E2E and coverage: `npm run test:e2e`, `npm run test:cov`.
