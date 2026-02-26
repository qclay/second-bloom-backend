# Observability: logs, errors, performance, metrics

This document describes how the backend is set up for **logging**, **error tracking**, **performance tracing**, and **metrics**, and how to use them for analysis and debugging.

---

## 1. Logs (Winston)

- **Library:** `nest-winston` + `winston`.
- **Development:** Pretty-printed console output (timestamp, level, message, meta).
- **Production:** **JSON** lines to stdout so log aggregators (Datadog, Axiom, Loki, CloudWatch, etc.) can parse and index by `service`, `environment`, `requestId`, `userId`, `context`, etc.
- **Request correlation:** Every log from interceptors and the exception filter includes `requestId` (and often `userId`) in `meta`. Set `X-Request-ID` on the request to reuse the same ID across services.

**Using logs elsewhere:** Ship stdout (e.g. Docker logs, Kubernetes stdout) to your log backend. No extra app code needed; ensure `NODE_ENV=production` so output is JSON.

---

## 2. Error tracking & performance (Sentry)

- **Library:** `@sentry/node` + `@sentry/profiling-node`.
- **Config:** `SENTRY_DSN`, `SENTRY_ENABLED=true`, and optional env (see `.env.example`). Sentry is initialized in `SentryService` with:
  - **Express integration** – per-request transactions and spans for HTTP.
  - **Prisma integration** – spans for DB queries.
  - **Profiling** – optional profiling for sampled transactions.
- **Errors:** Unhandled and 5xx errors are captured in `AllExceptionsFilter` and sent to Sentry with `requestId` and `userId` tags. `setupExpressErrorHandler` is registered in `main.ts` when Sentry is enabled so any error that reaches Express is also captured.
- **Performance:** With `tracesSampleRate` > 0 (e.g. `0.1` in production), Sentry receives transactions and spans (HTTP + Prisma). Use **Sentry → Performance / Traces** to see slow endpoints and DB calls.
- **Request ID:** Set as tag `request_id` on every request (see `RequestIdInterceptor`) so you can correlate Sentry events with logs.

**Env (optional):** `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_PROFILES_SAMPLE_RATE` (or use defaults in `sentry.config.ts`).

---

## 3. Metrics (Prometheus)

- **Library:** `prom-client`.
- **Endpoint:** `GET /api/v1/metrics` (or `/metrics` if excluded from global prefix). No auth by default; protect or restrict in production.
- **Metrics exposed:**
  - Default Node metrics (CPU, event loop, etc.).
  - `http_request_duration_seconds`, `http_requests_total`, `http_request_errors_total` (method, route, status_code).
  - `database_query_duration_seconds`, `database_queries_total` (if used).
  - Cache hits/misses, memory usage (see `MetricsService`).
- **Scraping:** Point Prometheus at `http://<host>:<PORT>/api/v1/metrics` (or the correct path). Use Grafana for dashboards and alerts.

---

## 4. Quick reference

| Need              | Where to look / use                          |
|-------------------|-----------------------------------------------|
| Why did this request fail? | Sentry Issues (filter by `request_id` or user). |
| Slow endpoints    | Sentry Performance / Traces, or Prometheus `http_request_duration_seconds`. |
| Logs for a request| Log aggregator: search by `requestId` (or `request_id`). |
| Overall traffic   | Prometheus `http_requests_total`, Grafana.    |
| Errors rate       | Sentry Issues, or Prometheus `http_request_errors_total`. |

---

## 5. How to verify it’s working

### Logs (Winston)

1. **Development (pretty logs)**  
   Run the app and send any request. You should see lines like:
   ```text
   2025-02-17 12:00:00 [info]: Incoming request - GET /api/v1/health {"context":"LoggingInterceptor","requestId":"...","userId":...}
   ```
   If `requestId` appears in the meta, request correlation is working.

2. **Production (JSON logs)**  
   Run with `NODE_ENV=production` and send a request. Each log line should be a single JSON object, e.g.:
   ```bash
   NODE_ENV=production npm run start
   curl -s http://localhost:3000/api/v1/health
   ```
   Check the server stdout: one or more lines should be valid JSON with `level`, `message`, `timestamp`, `service`, `environment`, and any `meta`.

### Sentry (errors and performance)

1. **Enable Sentry**  
   In `.env`: `SENTRY_DSN=https://...@sentry.io/...` and `SENTRY_ENABLED=true`. Restart the app.

2. **Trigger a test error**  
   Call the debug route (it always throws):
   ```bash
   curl -v http://localhost:3000/api/v1/debug-sentry
   ```
   You should get a 500 response. Within a few minutes, in Sentry: **Issues** → new issue with message containing “Observability test error”. Open it and confirm you see `request_id` in tags.

3. **Performance / traces**  
   With Sentry enabled, send a few normal requests (e.g. `GET /api/v1/health`, `GET /api/v1/`). In Sentry go to **Performance** (or **Traces**) and confirm transactions for those routes and, if you use Prisma, DB spans.

### Metrics (Prometheus)

1. **Scrape endpoint**  
   With the app running:
   ```bash
   curl -s http://localhost:3000/api/v1/metrics
   ```
   You should get Prometheus text format with metrics such as `http_requests_total`, `http_request_duration_seconds`, and default Node metrics.

2. **After a few requests**  
   Hit a few endpoints (e.g. `/api/v1/`, `/api/v1/health`) then fetch `/api/v1/metrics` again. Counts and histograms for those routes should increase.

### Health (sanity check)

- `GET /health` or `GET /api/v1/health` (depending on your setup) should return 200 and a health payload. Use this to confirm the app is up before testing logs, Sentry, and metrics.

---

## 6. Optional next steps

- **Log shipping:** Send stdout to Axiom, Datadog Logs, Grafana Loki, or CloudWatch Logs (e.g. via sidecar or agent). No code change; production logs are already JSON.
- **Alerts:** Configure Sentry alerts for new issues or spike in errors; Prometheus/Grafana alerts on high latency or error rate.
- **Uptime / health:** Use existing `GET /health` (or your health route) with an external monitor; combine with metrics for availability and latency.
