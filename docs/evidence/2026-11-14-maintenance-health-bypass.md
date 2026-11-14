# Production Maintenance Gate & `/api/health` Bypass Evidence

- **Date / Window**: 2026-11-14 12:24 UTC (2026-11-14 20:24 Asia/Taipei)
- **Target Origin**: `https://tensift.pages.dev`
- **Harbor Config Source**: `https://harbor-1wk.pages.dev/api/v1/public/runtime-config?project=tensift`
- **Related Change**: Middleware repair PR #25 (merged & deployed in [Deploy 40799560966](https://github.com/frobel0520/tensift/actions/runs/40799560966))
- **Middleware Config**: `functions/_middleware.js` (`BAKED_EXEMPT_PATHS = ["/api/health"]`, `CACHE_TTL_SECONDS = 30`)

## Summary

Verified in an agreed production maintenance window that:
1. Enabling Harbor Maintenance Gate blocks normal page requests (`GET /`) with `HTTP/1.1 503 Service Unavailable`, `Cache-Control: no-store`, and `Retry-After: 300`.
2. Exempt path `GET /api/health` bypasses the gate and returns `HTTP 200` with `status: "ok"` and `puzzleCatalogVersion: "d1"`.
3. Disabling Harbor Maintenance Gate restores `GET /` to `HTTP 200` after the 30-second edge cache TTL.

## Sanitized Verification Output

### 1. Before enabling maintenance (Baseline)

```text
GET https://tensift.pages.dev/
-> HTTP 200

GET https://tensift.pages.dev/api/health
-> HTTP 200
{"status":"ok","release":"local","puzzleCatalogVersion":"d1","requestId":"a4fe7441-7b14-4702-84d4-a3a1b6ea4397"}
```

### 2. During maintenance (`maintenance.enabled = true`)

```text
GET https://tensift.pages.dev/
-> HTTP/1.1 503 Service Unavailable
Date: Sat, 14 Nov 2026 12:24:23 GMT
Content-Type: text/html; charset=utf-8
Cache-Control: no-store
Retry-After: 300
Server: cloudflare
(NEL/Report-To headers redacted)

GET https://tensift.pages.dev/api/health
-> HTTP 200
{"status":"ok","release":"local","puzzleCatalogVersion":"d1","requestId":"8afde9e6-7c6e-4023-8806-40ac0f8b4cc0"}
```

### 3. After disabling maintenance (Recovery)

```text
GET https://tensift.pages.dev/
-> HTTP 200

GET https://tensift.pages.dev/api/health
-> HTTP 200
{"status":"ok","release":"local","puzzleCatalogVersion":"d1","requestId":"ac7c510d-48d3-464e-8532-71859fe99c24"}
```
