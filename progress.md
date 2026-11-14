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

## Catalog Expansion (500 Families / 1,500 Records through 2028-01-10)

On branch `feature/20261114-catalog-500-families`, the production puzzle catalog has been expanded from 85 families (255 locale records through `2026-11-21`) to **500 families / 1,500 trilingual puzzle JSON files** (`en`, `zh-Hant`, `es-419`), continuously scheduled through **`2028-01-10`** (423 complete days of runway from `2026-11-14`):
- **Stage 0 (Incremental D1 Seeding)**: Added optional `--from-date` / `--to-date` flags to `scripts/seed-puzzles.ts` and corresponding `from_date` / `to_date` `workflow_dispatch` inputs to `.github/workflows/seed-content.yml` so remote Cloudflare D1 seeding can be run incrementally without exceeding the D1 Free daily 100,000-row write limit (dry-run verified: 1,500 full / 1,245 incremental from `2026-11-22`).
- **Stage 1 (`batch-7` Promotion)**: Promoted `content/candidates/batch-7` (families 86–92, `2026-11-22` to `2026-11-28`) from `"draft"` to `"scheduled"` in `content/puzzles/` with corresponding `content/playtest/<familyId>.json` ledgers.
- **Stage 2 (Batches 8–21)**: Authored and validated 408 new families (families 93–500, `2026-11-29` to `2028-01-10`) across sciences, engineering, computing, mathematics, geography, arts, linguistics, history, civics, culinary, sports, medicine, and everyday standards.
- **Playtest & Source Status**: All 470 enforced `content/playtest/*.json` ledgers (from `2026-09-28` onward) record `authorReview.verdict: "pass"` with concrete `checkedAlternates` and `blindPlaytest.status: "pending"` (`testers: 0`). `audit-content-sources.mjs` reports `citationCompleteness: "complete"` and `familiesWithGaps: 0` across all 1,500 files. Remote D1 remains seeded only through `2026-11-21` until incremental `seed-content.yml` runs are triggered after merge.

## Pending

- [x] 【高】Remote D1 coverage through 2026-11-21 verified in audit40801570799: 72 expected date/locale groups, exactly one scheduled row each; missing=[]; SELECT1/read149, no seed or action receipt reset.
- [ ] 【中】Arrange independent blind playtests and record results in content/playtest; author review is not a blind pass. Enable strict-blind only when evidence supports it.
- [ ] 【中】After merging `feature/20261114-catalog-500-families`, run incremental `seed-content.yml` (`from_date: 2026-11-22` in manageable date chunks) to populate remote D1 beyond `2026-11-21`. (Local repo catalog is now covered through `2028-01-10`.)
- [x] 【高】Middleware repair #25 is merged/deployed; production `/api/health` bypass verified during agreed maintenance window on 2026-11-14 12:24 UTC (`/` returned 503 with `Retry-After: 300`, `/api/health` returned 200 OK, restored `/` to 200). See [docs/evidence/2026-11-14-maintenance-health-bypass.md](docs/evidence/2026-11-14-maintenance-health-bypass.md).
- [ ] 【低】Owner decision: request AdSense re-review if still desired; approval is not guaranteed and ad serving stays disabled.
- [ ] 【中】Resolve remaining source/rights review and production free-plan/billing confirmation in docs/deploy-readiness.md; deployment success does not settle these conditions.

## Deferred decisions

Guest accounts/cross-device streaks, image share cards, analytics and re-enabling advertising remain proposals or deferred choices. They are not active implementation tasks. LinkedIn remains a discovery channel; direct Games Hub submission is not available.

## History

The previous handoff is retained at [artifacts/session-summaries/Progress.md](artifacts/session-summaries/Progress.md). This root document is the current Harbor source. Old 50-family schedules and the unmerged batch-6 statement are superseded above; no new seed, deployment, billing or advertising action is implied.


