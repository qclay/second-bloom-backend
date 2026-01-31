# Deployment troubleshooting

## P1000: Authentication failed (database credentials not valid)

If the app container logs show:

```text
Error: P1000: Authentication failed against database server, the provided database credentials for `postgres` are not valid.
```

the app is connecting to PostgreSQL with credentials that the database does not accept.

### Cause

- **PostgreSQL** is configured from `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` in your `.env` (or docker-compose defaults).
- The **app** gets `DATABASE_URL` from the same `.env` via docker-compose (e.g. `postgresql://POSTGRES_USER:POSTGRES_PASSWORD@postgres:5432/POSTGRES_DB?...`).
- PostgreSQL only uses these env vars **when the data directory is created for the first time**. After that, the user and password are stored in the volume. If you later change `.env` (e.g. a new password), the app will use the new credentials but the running Postgres still has the **old** ones → P1000.

So P1000 usually means: **credentials in `.env` do not match the credentials the Postgres volume was initialized with.**

### Fix

**Option A – Make `.env` match the existing Postgres (no data loss)**

If the Postgres container was first started with defaults (no `.env` or old values), use those same values in `.env` on the server, for example:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=second_bloom
```

Then restart only the app (so it picks up the corrected `DATABASE_URL`):

```bash
cd ~/second-bloom-backend
docker-compose up -d --force-recreate app
```

**Option B – Change the password inside Postgres (keep current `.env`)**

If you want to keep the password you have in `.env`, set the same password inside the running Postgres:

```bash
cd ~/second-bloom-backend
docker-compose exec postgres psql -U postgres -d second_bloom -c "ALTER USER postgres PASSWORD 'YOUR_NEW_PASSWORD';"
```

Use the **exact** value you have for `POSTGRES_PASSWORD` in `.env`. Then restart the app:

```bash
docker-compose up -d --force-recreate app
```

**Option C – Recreate Postgres from scratch (data loss)**

Only if you can lose the current DB data:

```bash
cd ~/second-bloom-backend
docker-compose down
docker volume rm second-bloom-backend_postgres_data   # or the volume name from docker volume ls
# Ensure .env has the final POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB you want
docker-compose up -d
```

### Checklist on the server

1. **`.env` exists** in `~/second-bloom-backend` and is used when you run `docker-compose` (same directory as `docker-compose.yml`).
2. **No typos**: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` are set and match what Postgres was initialized with (or use Option B to align the DB password with `.env`).
3. **No empty password** unless you intentionally set Postgres to allow no password (not recommended in production).
4. After changing `.env`, recreate the app so it gets the new `DATABASE_URL`:  
   `docker-compose up -d --force-recreate app`
