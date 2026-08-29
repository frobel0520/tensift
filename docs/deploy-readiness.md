# Tensift deploy-readiness checklist

Status: ready for a release review; deployment intentionally not performed  
Target: Cloudflare Pages project `tensift` → `https://tensift.pages.dev`

## Services and accounts

| Service | Required for v1 | Current state | What remains before deploy |
|---|---:|---|---|
| Cloudflare Pages | Yes | Project `tensift` created; `tensift.pages.dev` reserved | Connect the source repository or run the reviewed Wrangler deploy command |
| Cloudflare D1 | Yes | Database `tensift` exists; binding is in `wrangler.toml` | Apply reviewed migrations and seed only the approved release records |
| GitHub | Recommended | No remote repository is configured in this workspace | Create/import the repository, push `main`/`dev`, and enable branch protection + Actions |
| Custom domain / registrar | No | Not needed | `tensift.pages.dev` avoids domain purchase and keeps Cloudflare out of the player-facing name |
| Analytics | No for v1 | Not connected | Add only after a privacy decision and a consent/retention review |
| Error monitoring | No for v1 | Not connected | Optional follow-up; do not add a client secret to the bundle |
| Google AdSense | Optional revenue | Top responsive slot implemented; account and IDs not configured | Obtain AdSense approval, create a display unit, set `VITE_ADSENSE_CLIENT_ID` / `VITE_ADSENSE_TOP_SLOT`, publish `ads.txt`, and review privacy/consent |

No paid custom domain is required for the chosen URL. Cloudflare Pages and D1 are still the hosting/data services behind it; their free-plan limits and current pricing should be checked in the Cloudflare dashboard before launch.

## Local pre-deploy gates

Run these from the project root:

```powershell
npm ci
npm run validate:puzzles
npm run typecheck
npm test
npm run build
npm run scan:bundle
```

For a same-origin Pages Function smoke test, apply the local schema/seed, then serve the built artifact:

```powershell
npm run db:migrate:local
npm run db:seed:local
npm run build
npm run cf:dev
```

Verify manually or with an HTTP client:

- `GET /api/health` returns `status: ok` and `puzzleCatalogVersion: d1`.
- `GET /api/v1/puzzles/today?locale=en` returns a safe DTO only.
- `POST /api/v1/puzzles/{id}/check` accepts a full board and increments attempts client-side.
- A second hint is rejected or returns the same idempotent receipt, never a second placement.
- `POST /api/v1/puzzles/{id}/reveal` is the only answer-bearing response and has `Cache-Control: no-store`.
- Refreshing the page resumes placements, locked hint state, attempts, and locale from localStorage.
- Switching among `en`, `zh-Hans`, and `es-419` loads the matching daily record without mixing sessions.

## Release gate for content

The current remote catalog contains the first nine records as `draft` records, and their dates begin on 2026-09-01. As of 2026-08-29, the production `today` endpoint is therefore expected to return 404 until a release owner schedules or publishes an approved record.

Before launch, for each locale:

1. Complete blind playtesting and source/rights review.
2. Move exactly one puzzle per locale to `scheduled` or `published` for the intended UTC date.
3. Confirm the locale has a matching `UNIQUE (locale, publish_date)` record.
4. Run the safe projection and bundle scans again; no solution fields may appear in `dist/`.
5. Record the release date and rollback puzzle status in the change review.

Do not publish content by changing the client or by adding answer fixtures to the browser bundle.

## Cloudflare Pages settings

If connected to GitHub, use:

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `22`
- Production branch: `main`
- Preview branches: pull requests and `dev`

The checked-in `wrangler.toml` carries the D1 binding. A Pages project environment must have the same `DB` binding in production and preview if preview API smoke tests are expected. Do not put a D1 token or API secret in `VITE_*` variables; Vite embeds those values into the public bundle.

## GitHub setup

The checked-in workflow at `.github/workflows/ci.yml` runs validation, type checking, tests, a Pages build, and the answer-leak scan on pushes and pull requests to `main` and `dev`. It deliberately has no deploy job yet.

Before enabling an automated deploy, decide whether the release process uses:

- Cloudflare’s Git integration (recommended for the first release), or
- a separately reviewed Wrangler deploy job with a narrowly scoped `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secret.

Never use a global API key, commit `.env`, or expose a Cloudflare credential through a `VITE_*` variable.

## Rollback

For a bad frontend artifact, redeploy the last known-good Pages deployment. For bad content, set the affected D1 record to `retired` and publish the reviewed replacement; do not delete the record while investigating because local sessions and audit trails use the puzzle ID.
