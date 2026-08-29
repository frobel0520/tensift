# Tensift

Tensift is a multilingual hidden-rule sorting puzzle. The browser app serves one daily puzzle, while Cloudflare Pages Functions keep the canonical answer in D1.

## Prototype rules

- Ten familiar items share one visible topic.
- Sort them into four unlabeled rows with capacities 1, 2, 3, and 4.
- Every row is produced by the same hidden classification dimension.
- Fill the board before checking the arrangement.
- Checks are unlimited; the interface records total attempts.
- One Hint may be used at any time. It places and locks one item in the correct row.
- Reveal answer is always available from the lower-right button.

## Languages

- English (`en`)
- Simplified Chinese (`zh-Hans`)
- Latin American neutral Spanish (`es-419`)

Each locale currently includes three prototype puzzles: Countries, Animals, and Musical Instruments.

## Run locally

Install dependencies and use the Vite app for front-end-only work:

```powershell
npm install
npm run dev
```

For the real same-origin Pages Function + local D1 flow, build first and run Wrangler Pages Dev:

```powershell
npm run db:migrate:local
npm run db:seed:local
npm run build
npm run cf:dev
```

The app is served at `http://localhost:8788/` by Pages Dev. The root [`index.html`](index.html) remains the approved prototype reference and is not the production entry point.

## Project documents

The `docs` directory contains the approved project plan, prototype test plan, pilot puzzle pack, SA / production design, and system design package.

## Current status

Prototype approved on 2026-08-29. The TypeScript/Vite/Cloudflare implementation, D1 repository, API routes, client state machine, session persistence, and responsive UI are now in place. Deployment is intentionally not performed yet; release readiness and service setup are documented in [`docs/deploy-readiness.md`](docs/deploy-readiness.md).

SA / production design draft: [`docs/sa-production-design.md`](docs/sa-production-design.md). The implementation-level design is [`docs/system-design.md`](docs/system-design.md). The authoring contract is [`docs/puzzle.schema.json`](docs/puzzle.schema.json); proposed architecture decisions are recorded in [`docs/adr-0001-server-authoritative-answer-boundary.md`](docs/adr-0001-server-authoritative-answer-boundary.md) and [`docs/adr-0002-locale-authored-content.md`](docs/adr-0002-locale-authored-content.md).

## Production app

The Vite/React app lives in `app/` and imports typed contracts from `shared/`. Pages Functions expose the D1-backed health, today, check, hint, and reveal contracts. Production build output is flattened to `dist/index.html` for Cloudflare Pages. The client never ships solution groups; answers are returned only by the explicit reveal request.

The Cloudflare Pages Function entry points are under `functions/`; D1 migrations are under `migrations/`. The `DB` binding in `wrangler.toml` points to the configured `tensift` database. The first content batch contains three draft puzzle families (Countries, Animals, Musical instruments) in all three locales; they still need blind playtesting before release.

### D1 migration and puzzle seed

The checked-in `wrangler.toml` contains the `DB` binding for the configured `tensift` database. Use an environment-specific Wrangler config when targeting another database.

Apply the checked-in schema to a local Wrangler D1 database, then generate and import the normalized puzzle records:

```powershell
npm run db:migrate:local
npm run seed:puzzles
# inspect .wrangler/tensift-seed.sql, then apply it when ready
npm run db:seed:local
```

`seed:puzzles` is a dry run by default. It validates every file under `content/puzzles/**/*.json` and writes `.wrangler/tensift-seed.sql`; it does not modify any database. The `db:seed:local` and `db:seed:remote` shortcuts use the database name `tensift`. For another binding, use the explicit form:

```powershell
npm run seed:puzzles -- --database <database-name> --local
npm run seed:puzzles -- --database <database-name> --remote
```

Remote execution is intentionally opt-in and requires an authenticated Wrangler session plus a real D1 binding. Do not run it until the migration and generated SQL have been reviewed.

Approved baseline:

- Ten items in four unlabeled rows with capacities 1 / 2 / 3 / 4.
- Unlimited attempts; the counter uses positive “Attempts” wording.
- One Hint available at any time; it places and locks one item in the correct row.
- Reveal answer is aligned in the right column and can be closed with the close button or Escape.
- English, Simplified Chinese, and neutral Latin American Spanish locale switching.
- No Tweaks panel; feedback is the exact total of correctly grouped items.
