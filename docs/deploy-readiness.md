# Tensift deploy-readiness checklist

Status: deployed to production; the first daily release is live, with monetization approval remaining
Target: Cloudflare Pages project `tensift` → `https://tensift.pages.dev`

## Services and accounts

| Service | Required for v1 | Current state | What remains before deploy |
|---|---:|---|---|
| Cloudflare Pages | Yes | Project `tensift` deployed at `https://tensift.pages.dev` | Keep the Wrangler deploy path or create a new Git-integrated project if automatic Pages builds are later required |
| Cloudflare D1 | Yes | Database `tensift` exists, is bound in `wrangler.toml`, and contains a fifty-day release window (150 records across three locales; the fifth batch is authored but not yet seeded) | Keep the daily publishing/review process and seed only approved release records |
| GitHub | Recommended | Public repository and green Actions workflow are configured | Add branch protection when the release process is finalized |
| Custom domain / registrar | No | Not needed | `tensift.pages.dev` avoids domain purchase and keeps Cloudflare out of the player-facing name |
| Analytics | No for v1 | Not connected | Add only after a privacy decision and a consent/retention review |
| Error monitoring | No for v1 | Not connected | Optional follow-up; do not add a client secret to the bundle |
| Google AdSense | Optional revenue | Production slot and `ads.txt` are configured; site/account review is pending | Complete Google approval and privacy/consent review; re-inject public Vite IDs for each future Direct Upload build |

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

The current remote catalog contains a thirty-day release window in all three locales: Countries is `published` for 2026-08-29; Animals, Musical Instruments, Natural Landmarks, Vehicles, At Home, Sports, Animal Habitats, Food, World Landmarks, Fruits, The Human Body, Vegetables, World Cities, Languages, Breakfast, Everyday Tools, Materials, Wheeled Things, Fictional Characters, Clothing, Animal Coverings, World Foods, Beverages, Sports Equipment, Trees, Home Appliances, School and Office, Global Brands, and Animal Movement are `scheduled` for 2026-08-30 through 2026-09-27 respectively. The production `today` endpoint returns the Countries puzzle for the current UTC date.

For each upcoming release, for each locale:

1. Complete blind playtesting and source/rights review.
2. Move exactly one puzzle per locale to `scheduled` or `published` for the intended UTC date.
3. Confirm the locale has a matching `UNIQUE (locale, publish_date)` record.
4. Run the safe projection and bundle scans again; no solution fields may appear in `dist/`.
5. Record the release date and rollback puzzle status in the change review.

Do not publish content by changing the client or by adding answer fixtures to the browser bundle.

The second-batch content revision keeps the same release dates while replacing the Languages groups with Hellenic/Germanic/Indo-Aryan/Romance language families, and replacing Rice pudding, Tuk-tuk, and Pedicab with more direct alternatives. Re-run blind playtesting for these three families before their scheduled dates.

The third batch keeps the existing cadence and adds Clothing, Animal Coverings, World Foods, Beverages, Sports Equipment, Trees, Home Appliances, School and Office, Global Brands, and Animal Movement through 2026-09-27. Trees now uses common settings/associations instead of botanical types; Global Brands uses soft drink, car, fast-food, and sportswear industries; the 2026-09-27 slot was revised from Animal Diets to Animal Movement while retaining the existing public puzzle IDs for an in-place D1 replacement. Re-run blind playtesting for these everyday associations before their scheduled dates.

The fourth batch runs 2026-09-28 to 2026-10-07 and adds Shapes, Animal Legs, Jobs and Workplaces, Tastes, Weather, Furniture, Birds, Cooking Methods, Around Town, and Sources of Light. It is the first batch written against the ambiguity ledger under `content/playtest/`, so each family records the items that were tested against a rival group and the replacement to make if blind testers split. The batch was seeded to remote D1 on 2026-09-05 (dry-run, then apply: no pending migrations, 4450 queries, 12327 rows written), and production smoke passed afterwards.

The fifth batch runs 2026-10-08 to 2026-10-17 and adds Sea Creatures, Herbs and Spices, Farm Animals, Sweet Treats, Containers, Ways to Send a Message, Fabrics, Ball Games, Things in the Sky, and Ways to Pay. Every family carries an ambiguity ledger under `content/playtest/`, and each ledger names the replacement to make if blind testers split. The batch is authored and passing every local gate but is **not yet seeded to remote D1**; run the `Seed content to D1` workflow (dry-run, then apply) before 2026-10-08.

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
