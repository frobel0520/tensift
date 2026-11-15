# Tensift Progress

Updated: 2026-11-15 (Asia/Taipei).

## Current status (300-Level Standalone Edition — Final Release)

Tensift is finalized and merged to `main` (PR #42, commit `be59283`) as a **300-level pure-static standalone game** (900 trilingual puzzle JSONs across `en`, `zh-Hant`, `es-419`). The project is now in **maintenance-only** mode with no ongoing daily content updates:

- **Curated 300 Universal Levels**: Filtered out ~95 specialized/academic topics and duplicate/overlapping families from the 500-family expansion (PR #41 closed/superseded), retaining **300 accessible, general-audience levels** (`easy` / `medium` / `hard` progression) in `content/puzzles/{en,zh-Hant,es-419}/` with zero high-overlap duplicates.
- **Pure-Static Client Engine**: [`scripts/build-static-catalog.ts`](scripts/build-static-catalog.ts) generates per-locale static level bundles (`src/data/catalog-{en,zh-Hant,es-419}.json`), and [`src/api/standalone.ts`](src/api/standalone.ts) runs puzzle evaluation, hints, and reveal locally via `src/domain/puzzle/engine.ts` without requiring Cloudflare D1 or scheduled content seeding.
- **Level Navigation & Persistence**: [`src/App.tsx`](src/App.tsx), [`src/i18n/messages.ts`](src/i18n/messages.ts), and [`src/styles.css`](src/styles.css) provide Previous/Next level controls, a searchable 300-level picker modal (with difficulty badges, solved indicators, "Next unsolved", and "Random" jump), and `localStorage` persistence for current level and solved progress.
- **CI/CD**: Removed `scan:bundle` from `.github/workflows/ci.yml` and `.github/workflows/deploy.yml` since the standalone static edition intentionally bundles the 300-level catalog client-side. All CI gates (`validate:puzzles`, `typecheck`, `test`, `build`, `build:functions`, `check:playtest`) pass on `main`.

## Pending

- [x] 【高】Remote D1 coverage through 2026-11-21 verified in audit 40801570799 (superseded by standalone static edition; D1 seeding is no longer required for gameplay).
- [ ] 【中】Optional: arrange independent blind playtests and record results in `content/playtest/` if strict-blind auditing is desired later.
- [ ] 【低】Owner decision: request AdSense re-review if still desired; approval is not guaranteed and ad serving stays disabled.
- [ ] 【中】Resolve remaining source/rights review in `docs/deploy-readiness.md` if needed; deployment to Cloudflare Pages is purely static (`dist/`).

## Deferred decisions

Guest accounts/cross-device streaks, image share cards, analytics and re-enabling advertising remain proposals or deferred choices. They are not active implementation tasks. LinkedIn remains a discovery channel; direct Games Hub submission is not available.

## Historical milestones (Pre-standalone)

- **Middleware & Health Bypass**: Middleware repair PR #25 merged and deployed (`40799560966`); production maintenance-mode `/api/health` bypass verified on 2026-11-14 (see [docs/evidence/2026-11-14-maintenance-health-bypass.md](docs/evidence/2026-11-14-maintenance-health-bypass.md)). Ad serving remains disabled.
- **Daily Catalog & Audit (Superseded)**: Batch 6 / PR #20 (85 families through 2026-11-21), D1 seed run `37135703571`, and audit `40801570799` (72 date/locale groups) were verified prior to standalone conversion.
- **Batch 7 Candidates**: Seven draft families / 21 localized candidates in `content/candidates/batch-7` completed author review (PR #29); these remain in the repo as reviewed drafts/tests alongside the curated 300-level standalone catalog.
- **Source Inventory**: PR #32 added read-only source metadata inventory (`docs/30-content-source-inventory.md`) and corrected four citation records.

## History

The previous handoff is retained at [artifacts/session-summaries/Progress.md](artifacts/session-summaries/Progress.md). This root document is the current Harbor source.
