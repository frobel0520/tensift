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
- Results can be shared without spoilers using the device share sheet or a clipboard fallback.

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

## Deployment

The branching model is `main` plus short-lived feature branches. Every change
reaches `main` through a pull request, which runs the `CI` workflow.

Merging to `main` then runs the `Deploy` workflow: it repeats every CI gate
(content validation, type check, tests, build, bundle-leak scan) and then
publishes the verified `dist/` to the Cloudflare Pages project `tensift` as a
production deployment. `main` is covered by `Deploy` rather than `CI`, so the
gates never run twice for one commit.

Required repository configuration (Settings > Secrets and variables > Actions):

| Kind | Name | Value |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | A Cloudflare API token with the `Cloudflare Pages: Edit` and `D1: Edit` permissions on this account |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | The Cloudflare account ID that owns the `tensift` Pages project and D1 database |

Until both Cloudflare credentials exist, the workflow runs every verification
gate and then skips deployment with a notice. AdSense build variables are no
longer deployment prerequisites: ad serving is deliberately disabled during
publisher-content remediation. Never put credentials in a `VITE_*` variable.

Manual `npm run cf:deploy` from a workstation still works and is the fallback if
Actions is unavailable.

### Seeding content from CI

Content is production data, so it is never written on push. The
`Seed content to D1` workflow is manual (Actions > Seed content to D1 > Run
workflow) and takes a `mode` input:

- `dry-run` (default) validates every file under `content/puzzles/**` and
  uploads the generated `tensift-seed.sql` as a run artifact. It does not touch
  the database.
- `apply` does the same, then applies D1 migrations and seeds the remote
  `tensift` database.

The seed replaces each puzzle by `puzzleId` (delete then insert), so it is
idempotent for the records present in `content/` and leaves any other record
untouched. To require a human approval before `apply`, add required reviewers to
the `production` environment in repository settings.

### Scheduled checks

Publishing needs no cron. The `today` query selects on
`publish_date = <current UTC date> AND status IN ('scheduled','published')`, so
a scheduled record becomes playable on its own date. Scheduling is used for
verification and for content supply instead.

| Workflow | Schedule | Fails when |
|---|---|---|
| `Daily production smoke` | 00:15 UTC daily | `/api/health` is not `ok`/`d1`, or any of the three locales has no playable puzzle for today's UTC date, or the safe DTO carries an answer field |
| `Content alarm` | 01:00 UTC Mondays, and on any PR touching `content/puzzles/**` or `content/playtest/**` | Fewer than 14 consecutive complete days of authored content remain from today, or a puzzle family scheduled from 2026-09-28 onward has no recorded ambiguity review |

Both can be run on demand from the Actions tab. GitHub emails the repository
owner when a scheduled run fails, which is the notification path for both.

Run them locally with:

```powershell
npm run smoke:production
npm run check:runway
npm run check:playtest
```

`smoke:production` accepts `--base-url` to point at a preview deployment;
`check:runway` accepts `--min-days` and `--date`; `check:playtest` accepts
`--date`, `--author-review-from`, `--blind-lead-days`, and `--strict-blind`.

Runway is measured as the number of days from today with a complete locale set,
stopping at the first gap — not the total file count, because one missing locale
is the day the daily release breaks. The date comes from each file's
`publishDate` field, not its filename: several filenames carry a different date
than the record inside them.

### Ambiguity guard

A puzzle only works if the intended grouping is the dominant reading of its ten
items, and no schema can prove that. `content/playtest/<familyId>.json` carries
the review instead: which item was tested against which rival group, and why the
intended group wins.

The guard has two strengths on purpose. Author review is a hard failure for any
family publishing on or after `2026-09-28`; the thirty families before that date
are the pre-existing backlog and are listed on every run without failing it.
Blind playtesting — the only check that catches readings the author cannot see —
is reported as debt for any family within seven days of release, and becomes a
failure under `--strict-blind`. Turn that flag on (`strict_blind` in the
workflow dispatch inputs) once blind testing is actually running; today no
family has a blind pass, so it would fail every run.

A blind pass needs at least two testers recorded in `blindPlaytest.testers`.

## Publisher content and AdSense

Ad serving is disabled on gameplay and editorial pages. The ad component, its
`VITE_ADSENSE_*` build variables and the ad-network CSP allowances have been
removed; any leftover `VITE_ADSENSE_*` values are ignored. Ownership metadata
and the existing `/ads.txt` Function remain; keep the `ADSENSE_PUBLISHER_ID`
Function variable for verification.

`/learn/{locale}/how-to-play`, `/archive`, `/about`, and `/privacy` are complete
server-rendered HTML pages for `en`, `zh-Hans`, and `es-419`. Selected historical
explanations live at `/learn/{locale}/archive/{countries|animals|instruments}`.
These routes work without JavaScript and D1. Use Pages Dev, not Vite alone, to
preview them. `/sitemap.xml` lists only available pages and is linked by robots.txt.

The explicitly selected records and original editorial copy live in
`server/editorial/`. Add each article in all three languages with reasoning,
limitations and references; do not automatically turn every scheduled record
into a thin article. A selected answer becomes public only after its UTC
`publishDate`, using the server clock. Never import this catalog into `src/`.
`scan:bundle` still scans the entire browser artifact without exemptions.
`build:functions` separately verifies the server bundle outside `dist/`.

Before enabling ads again, review placements, implement any required consent
management and update the privacy notice. Ownership verification is not ad
approval. These changes do not guarantee AdSense acceptance; request review
only after the deployed content and account requirements have been checked.

The animal-covering wording correction also requires a D1 content update to
affect the live game. Merging a frontend deployment alone does not seed D1.

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
