# Tensift deploy-readiness checklist

Updated: 2026-11-15. Tensift has been finalized as a **300-level pure-static standalone edition** (PR #42, merged to `main`). Gameplay runs 100% client-side from static locale bundles (`src/data/catalog-{en,zh-Hant,es-419}.json`), so D1 seeding, daily runway checks, and `scan:bundle` are superseded for gameplay. Ad serving remains disabled and AdSense re-review is unverified. Current progress is [progress.md](../progress.md).

## Current deployment and catalog evidence

- Production: https://tensift.pages.dev, deployed as a static Cloudflare Pages site (`dist/`), with Pages Functions (`functions/`) serving editorial pages, `/api/health`, and Harbor maintenance middleware.
- `main` contains **300 curated general-audience families / 900 locale records** (`en`, `zh-Hant`, `es-419`), compiled into `src/data/catalog-{en,zh-Hant,es-419}.json` via `scripts/build-static-catalog.ts`.
- Supported locales are `en`, `zh-Hant` and `es-419`. Historical `zh-Hans` routes below the old baseline are not instructions for new records.
- Current-base Harbor middleware #25 is merged and maintenance-mode `/api/health` bypass was verified on 2026-11-14 (`docs/evidence/2026-11-14-maintenance-health-bypass.md`).

## Local engineering checks

Run from the repository root using the existing package scripts:

```sh
npm ci
npm run validate:puzzles
npm run typecheck
npm test
npm run build
npm run build:functions
```

To regenerate static client bundles after editing `content/puzzles/**`:

```sh
node --experimental-strip-types scripts/build-static-catalog.ts
```

*(Historical note: prior to PR #42, daily D1 seeding, `npm run scan:bundle`, and `check:runway` were required for the server-authoritative daily edition; those D1/runway notes below are retained as historical context.)*

## Content release conditions

For each family and locale:

1. Retain source/provenance and complete the relevant rights review. The new author review covers only the21 candidates; it is not a legal opinion or a blanket clearance for all older articles/puzzles.
2. Obtain independent blind playtests, record actual results under content/playtest and keep strict-blind disabled until evidence supports it. Author checks and automated factual checks are not blind passes.
3. Promote only reviewed records to one scheduled/published record per locale/date. Keep drafts outside the production loader; preserve the UTC date and UNIQUE(locale,publish_date) contract.
4. Run safe projection/bundle scans and record the release/rollback plan. Do not expose solutions in browser fixtures.
5. Remote seed is a separately controlled operation: it replaces records by puzzleId and clears their action receipts. Do not seed a live day merely to validate or inspect it.

Candidate-specific rival interpretations and source-review scope are in [author-review.md](../content/candidates/batch-7/author-review.md). Older content's unresolved rights/provenance and blind-test debt remain open; the historical batch descriptions are not approval evidence.

## CI, publication and remaining external conditions

The existing CI workflow verifies PR/push changes with Node22, content/schema checks, TypeScript, tests, build and the unchanged answer-leak scan. A separate existing Deploy workflow repeats the required checks before publishing main; automatic publication already exists. Do not create a second Pages project or configure new credentials merely because the older checklist said there was no deploy job. Reuse each repository's existing reviewed bindings, never a global key or another repository's token, and never expose secrets through VITE_*.

Still pending:

- Production account plan/free-limit/billing confirmation; hosting success does not establish zero fees.
- Independent blind tests and localized player feedback, including the new batch before promotion.
- Remaining older-content source/rights evidence; no all-site clearance is claimed here.
- Agreed production maintenance window to verify /api/health bypass/fail-open.
- Owner decision on optional AdSense re-review. Ownership metadata/ads.txt remain, advertising stays off. Re-enabling ads requires a separate placement/privacy/consent review; do not restore the gameplay banner just to submit a review.
- Optional analytics/error monitoring/custom domain or branch-protection choices remain separate decisions, not prerequisites to repeat a successful deployment.

## Rollback and history

Redeploy the last known-good frontend for a bad artifact. Retire the affected content record and publish the reviewed replacement rather than deleting the record and losing session/audit identity. Record the intended rollback before a controlled content update.

The [previous readiness document](https://github.com/frobel0520/tensift/blob/298a7541941b0e9707951817dbc41a26b78d4813/docs/deploy-readiness.md) preserves the thirty/fifty-day catalogs, batch history, CR-11 local/production evidence and then-current route names. Those historical counts, "Countries is today's puzzle" and "no deploy job yet" are superseded above. This documentation change does not deploy, seed, reset receipts, change billing or enable advertising.
