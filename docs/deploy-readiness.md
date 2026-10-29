# Tensift deploy-readiness checklist

Updated: 2026-10-29. The site is deployed; ad serving remains disabled and AdSense re-review is unverified. Current progress is [progress.md](../progress.md). This checklist separates completed engineering/readback from human, billing and production-policy acceptance.

## Current deployment and catalog evidence

- Production: https://tensift.pages.dev, Cloudflare Pages with D1 binding. No paid custom domain is required; the actual account plan/billing is still unverified.
- Main contains 85 authored families / 255 locale records through 2026-11-21. The October 3 seed run37135703571 applied 255 records. That historical seed is not a new whole-database inventory.
- Fresh remote audit [40801570799](https://github.com/frobel0520/tensift/actions/runs/40801570799) independently verified all 72 date/locale groups from October29 through November21: exactly one scheduled row each, missing=[], one SELECT /149 rows read. Do not seed or reset receipts merely to inspect coverage.
- Supported locales are `en`, `zh-Hant` and `es-419`. Historical zh-Hans routes below the old baseline are not instructions for new records.
- Current-base Harbor middleware #25 is merged and [Deploy40799560966](https://github.com/frobel0520/tensift/actions/runs/40799560966) succeeded. Daily production smoke is separate from maintenance-mode health-bypass acceptance, which remains untested.
- #27 prepared seven new families /21 localized candidates for November22–28 outside the production catalog/seed. #29 completed author factual/unit, locale and original-copy/source review, with210 assignments and eight factual-corruption regressions. All remain draft; blind testers=0. The November22 release gap is still open.

## Local engineering checks

Run from the repository root using the existing package scripts:

```sh
npm ci
npm run validate:puzzles
npm run typecheck
npm test
npm run build
npm run scan:bundle
node --experimental-strip-types scripts/check-candidate-batch.mjs
node scripts/check-candidate-facts.mjs
```

For local HTTP testing, use an isolated Wrangler/D1 state; do not reset an unknown local database or run remote seed as a smoke test. Health must return status ok with puzzleCatalogVersion d1. Today's endpoint must return only the safe DTO. Reveal is the answer-bearing response and must use Cache-Control no-store. Verify locale/session isolation, same-receipt hint idempotency and localStorage resume. Existing automated/fixture evidence does not replace complete mobile/assistive-technology or independent blind feedback.

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
