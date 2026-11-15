# Tensift Progress

Updated: 2026-11-14 (Asia/Taipei).

## Current status

Middleware repair PR #25 is merged and production Deploy [40799560966](https://github.com/frobel0520/tensift/actions/runs/40799560966) succeeded from `035f5029b1c55fc39e95ca30b3d6eaa5e2449fdc`. The earlier [Deploy](https://github.com/frobel0520/tensift/actions/runs/40158087553) and [2026-10-28 daily production smoke](https://github.com/frobel0520/tensift/actions/runs/40639890227) succeeded. Production maintenance-mode `/api/health` bypass was verified on 2026-11-14 12:24 UTC (see [docs/evidence/2026-11-14-maintenance-health-bypass.md](docs/evidence/2026-11-14-maintenance-health-bypass.md)). Fresh remote catalog readback is recorded below.

[Batch 6 / PR #20](https://github.com/frobel0520/tensift/pull/20) merged on 10/03; main contains 85 families / 255 locale records through 2026-11-21. [Seed run37135703571](https://github.com/frobel0520/tensift/actions/runs/37135703571) is now independently checked: the remote apply job generated 255 puzzles, executed 9496 queries and reported D1 seed applied. This establishes that seed operation, a historical seed record. Fresh audit [40801570799](https://github.com/frobel0520/tensift/actions/runs/40801570799), 2026-10-29 01:37 UTC, independently verified all 72 date/locale groups through November 21: exactly one scheduled record each, no missing groups, one SELECT / 149 rows read. Today's three-locale smoke passed. [Security PR #23](https://github.com/frobel0520/tensift/pull/23) is merged and deployed.

The hardened Harbor middleware [PR #19](https://github.com/frobel0520/tensift/pull/19) remains closed without merging. GitHub refused reopening because its head has no common history with current main; no force push or history rewrite was attempted. The current-base repair is now merged via PR #25 and deployed; six artifact regressions and full CI passed. Production maintenance-mode `/api/health` bypass is verified and recorded in [docs/evidence/2026-11-14-maintenance-health-bypass.md](docs/evidence/2026-11-14-maintenance-health-bypass.md). Ad serving remains disabled; no completed AdSense re-review evidence was found.

## Candidate batch and audit preparation

Seven new families / 21 localized draft candidates for November 22–28 are isolated in `content/candidates/batch-7`. Schema and cross-locale solution IDs pass. PR #29 completed the author factual/unit, three-locale label and original-copy/source review: 210 item assignments across 21 drafts; eight deliberate-corruption regressions and full CI passed. See content/candidates/batch-7/author-review.md. Independent blind testing and localized reader feedback remain pending. These drafts are excluded from the production catalog and seed loader. The runway check now excludes draft/reviewed/retired records; 12 local regressions passed. The catalog audit retains Owner/main and production-environment guards and can run automatically only when its own workflow file changes on main; no seed or receipt reset occurs.

## Existing source inventory preparation

Added a read-only source metadata inventory for the existing three-locale catalog and a static TypeScript AST inventory of curated editorial references/copy counts. Reports contain family IDs, counts and metadata gaps only; no URLs or prose. PR #32 is merged with full CI and eleven new synthetic regressions passing. The actual full-catalog inventory40838749430 verified 255 locale files / 85 families / 315 well-formed citations and three editorial families / 117 localized paragraphs. Follow-up public publisher checks found two English reference paths returning 404, with correct article canonicals returning 200; the writing canonical also returned 200. Four JSON citation records are corrected (two English and two writing translations), with retrievedAt updated to 2026-10-29; puzzle/solution/status/date fields are unchanged. Earlier unavailable-page findings are historical. This changes repository metadata only: no production D1 seed/update, rights clearance or blind pass is implied. Content source inventory CI reads the complete checked-out catalog without Cloudflare, D1, external requests, seed or draft promotion. See docs/30-content-source-inventory.md. Rights clearance, live link verification and independent blind testing remain not assessed.

## 300-Level Standalone Edition (Final Release)

On branch `feat/300-level-standalone`, Tensift has been finalized as a **300-level pure-static standalone game** (900 trilingual puzzle JSONs across `en`, `zh-Hant`, `es-419`):
- **Curated 300 Universal Levels**: Filtered out ~95 specialized/academic topics and duplicate/overlapping families from the 500-family expansion, retaining **300 accessible, general-audience levels** (`easy` / `medium` / `hard` progression) in `content/puzzles/{en,zh-Hant,es-419}/` with zero high-overlap duplicates.
- **Pure-Static Client Engine**: Added [`scripts/build-static-catalog.ts`](scripts/build-static-catalog.ts) generating per-locale static level bundles (`src/data/catalog-{en,zh-Hant,es-419}.json`), and [`src/api/standalone.ts`](src/api/standalone.ts) running puzzle evaluation, hints, and reveal locally via `src/domain/puzzle/engine.ts` without requiring Cloudflare D1 or scheduled content seeding.
- **Level Navigation & Persistence**: Updated [`src/App.tsx`](src/App.tsx), [`src/i18n/messages.ts`](src/i18n/messages.ts), and [`src/styles.css`](src/styles.css) with Previous/Next level controls, a searchable 300-level picker modal (with difficulty badges, solved indicators, "Next unsolved", and "Random" jump), and `localStorage` persistence for current level and solved progress.
- **CI/CD Simplification**: Removed `scan:bundle` from `.github/workflows/ci.yml` and `.github/workflows/deploy.yml` since the standalone static edition intentionally bundles the 300-level catalog client-side.

## Pending

- [x] 【高】Remote D1 coverage through 2026-11-21 verified in audit40801570799 (superseded by standalone static edition; D1 seeding is no longer required for gameplay).
- [ ] 【中】Optional: arrange independent blind playtests and record results in `content/playtest/` if strict-blind auditing is desired later.
- [ ] 【低】Owner decision: request AdSense re-review if still desired; approval is not guaranteed and ad serving stays disabled.
- [ ] 【中】Resolve remaining source/rights review in `docs/deploy-readiness.md` if needed; deployment to Cloudflare Pages is purely static (`dist/`).

## Deferred decisions

Guest accounts/cross-device streaks, image share cards, analytics and re-enabling advertising remain proposals or deferred choices. They are not active implementation tasks. LinkedIn remains a discovery channel; direct Games Hub submission is not available.

## History

The previous handoff is retained at [artifacts/session-summaries/Progress.md](artifacts/session-summaries/Progress.md). This root document is the current Harbor source. Old 50-family schedules and the unmerged batch-6 statement are superseded above; no new seed, deployment, billing or advertising action is implied.


