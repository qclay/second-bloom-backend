# Docker Production: Database Auth Fix (P1000)

If you see:

- **Prisma:** `P1000: Authentication failed … the provided database credentials for postgres are not valid`
- **PostgreSQL:** `FATAL: password authentication failed for user "postgres"`

the app is using a different password than the one stored in the existing PostgreSQL data volume. PostgreSQL only sets the password when the database is first created; later changes to `POSTGRES_PASSWORD` in `.env` do not update the existing DB.

## Fix without losing data

Sync the PostgreSQL password with the credentials your app uses.

1. **Set credentials in production `.env`:**

   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_password_here
   POSTGRES_DB=second_bloom
   ```

   Use a strong password for `POSTGRES_PASSWORD`. The app gets its `DATABASE_URL` from these vars via docker-compose.

2. **Update the password inside the running PostgreSQL** (connects via local socket, so no auth is needed):

   ```bash
   docker exec -it second-bloom-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'your_secure_password_here';"
   ```

   Use the **exact same** value as `POSTGRES_PASSWORD` in step 1. If the password contains special characters, wrap it in single quotes; inside the shell you may need to escape `'` as `'\''`.

3. **Restart the app** so it reconnects with the new password:

   ```bash
   docker-compose restart app
   ```

After this, the app and PostgreSQL use the same credentials and P1000 should stop.

## Fresh deploy (data can be lost)

Only if the DB has no important data:

1. Set `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` in `.env` as above.
2. Remove the DB volume and start again:

   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

The new volume will be initialized with the credentials from `.env`.

## Checklist

- [ ] `.env` has `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` set.
- [ ] `ALTER USER postgres WITH PASSWORD '…'` used the same value as `POSTGRES_PASSWORD`.
- [ ] App was restarted after changing the password.
