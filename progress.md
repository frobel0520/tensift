# Tensift Progress

Updated: 2026-10-29 (Asia/Taipei).

## Current status

Middleware repair PR #25 is merged and production Deploy [40799560966](https://github.com/frobel0520/tensift/actions/runs/40799560966) succeeded from `035f5029b1c55fc39e95ca30b3d6eaa5e2449fdc`. The earlier [Deploy](https://github.com/frobel0520/tensift/actions/runs/40158087553) and [2026-10-28 daily production smoke](https://github.com/frobel0520/tensift/actions/runs/40639890227) succeeded. Maintenance-mode health bypass remains untested. Fresh remote catalog readback is recorded below.

[Batch 6 / PR #20](https://github.com/frobel0520/tensift/pull/20) merged on 10/03; main contains 85 families / 255 locale records through 2026-11-21. [Seed run37135703571](https://github.com/frobel0520/tensift/actions/runs/37135703571) is now independently checked: the remote apply job generated 255 puzzles, executed 9496 queries and reported D1 seed applied. This establishes that seed operation, a historical seed record. Fresh audit [40801570799](https://github.com/frobel0520/tensift/actions/runs/40801570799), 2026-10-29 01:37 UTC, independently verified all 72 date/locale groups through November 21: exactly one scheduled record each, no missing groups, one SELECT / 149 rows read. Today's three-locale smoke passed. [Security PR #23](https://github.com/frobel0520/tensift/pull/23) is merged and deployed.

The hardened Harbor middleware [PR #19](https://github.com/frobel0520/tensift/pull/19) remains closed without merging. GitHub refused reopening because its head has no common history with current main; no force push or history rewrite was attempted. The current-base repair is now merged via PR #25 and deployed; six artifact regressions and full CI passed. Production maintenance-mode bypass remains untested. Ad serving remains disabled; no completed AdSense re-review evidence was found.

## Candidate batch and audit preparation

Seven new families / 21 localized draft candidates for November 22–28 are isolated in `content/candidates/batch-7`. Schema and cross-locale solution IDs pass; independent blind testing and localized reader feedback remain pending. These drafts are excluded from the production catalog and seed loader. The runway check now excludes draft/reviewed/retired records; 12 local regressions passed. The catalog audit retains Owner/main and production-environment guards and can run automatically only when its own workflow file changes on main; no seed or receipt reset occurs.

## Pending

- [x] 【高】Remote D1 coverage through 2026-11-21 verified in audit40801570799: 72 expected date/locale groups, exactly one scheduled row each; missing=[]; SELECT1/read149, no seed or action receipt reset.
- [ ] 【中】Arrange independent blind playtests and record results in content/playtest; author review is not a blind pass. Enable strict-blind only when evidence supports it.
- [ ] 【中】Maintain the daily publishing checks and add the next reviewed batch before the first authored gap, 2026-11-22. The earlier 10/05 batch-6 deadline is superseded.
- [ ] 【高】Middleware repair #25 is merged/deployed; test production /api/health while maintenance is enabled in an agreed test window; no maintenance toggle was performed in this audit.
- [ ] 【低】Owner decision: request AdSense re-review if still desired; approval is not guaranteed and ad serving stays disabled.
- [ ] 【中】Resolve remaining source/rights review and production free-plan/billing confirmation in docs/deploy-readiness.md; deployment success does not settle these conditions.

## Deferred decisions

Guest accounts/cross-device streaks, image share cards, analytics and re-enabling advertising remain proposals or deferred choices. They are not active implementation tasks. LinkedIn remains a discovery channel; direct Games Hub submission is not available.

## History

The previous handoff is retained at [artifacts/session-summaries/Progress.md](artifacts/session-summaries/Progress.md). This root document is the current Harbor source. Old 50-family schedules and the unmerged batch-6 statement are superseded above; no new seed, deployment, billing or advertising action is implied.


