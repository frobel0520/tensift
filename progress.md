# Tensift Progress

Updated: 2026-10-28 (UTC).

## Current status

Production is deployed from main `f60e0f391aa4bd132df14b9b80b1ae968a5ae18b`. [Deploy](https://github.com/frobel0520/tensift/actions/runs/40158087553) and [2026-10-28 daily production smoke](https://github.com/frobel0520/tensift/actions/runs/40639890227) succeeded. These checks do not establish maintenance-mode health bypass or a complete database catalog.

[Batch 6 / PR #20](https://github.com/frobel0520/tensift/pull/20) merged on 10/03; main contains 85 families / 255 locale records through 2026-11-21. [Seed run37135703571](https://github.com/frobel0520/tensift/actions/runs/37135703571) is now independently checked: the remote apply job generated 255 puzzles, executed 9496 queries and reported D1 seed applied. This establishes that seed operation, not a fresh full catalog readback. Today's three-locale smoke passed. [Security PR #23](https://github.com/frobel0520/tensift/pull/23) is merged and deployed.

The hardened Harbor middleware [PR #19](https://github.com/frobel0520/tensift/pull/19) remains closed without merging. GitHub refused reopening because its head has no common history with current main; no force push or history rewrite was attempted. A current-base generated repair, including Workers-compatible manual redirect handling, passed six artifact regressions and is prepared for a new compliant commit. Main still has the old middleware. Ad serving remains disabled; no completed AdSense re-review evidence was found.

## Pending

- [ ] 【高】Verify remote D1 coverage for all locales through 2026-11-21 using the existing read-only/dry-run path; do not seed or reset action receipts merely to inspect.
- [ ] 【中】Arrange independent blind playtests and record results in content/playtest; author review is not a blind pass. Enable strict-blind only when evidence supports it.
- [ ] 【中】Maintain the daily publishing checks and add the next reviewed batch before the first authored gap, 2026-11-22. The earlier 10/05 batch-6 deadline is superseded.
- [ ] 【高】Review the unmerged middleware hardening separately and test production /api/health while maintenance is enabled in an agreed test window; no maintenance toggle was performed in this audit.
- [ ] 【低】Owner decision: request AdSense re-review if still desired; approval is not guaranteed and ad serving stays disabled.
- [ ] 【中】Resolve remaining source/rights review and production free-plan/billing confirmation in docs/deploy-readiness.md; deployment success does not settle these conditions.

## Deferred decisions

Guest accounts/cross-device streaks, image share cards, analytics and re-enabling advertising remain proposals or deferred choices. They are not active implementation tasks. LinkedIn remains a discovery channel; direct Games Hub submission is not available.

## History

The previous handoff is retained at [artifacts/session-summaries/Progress.md](artifacts/session-summaries/Progress.md). This root document is the current Harbor source. Old 50-family schedules and the unmerged batch-6 statement are superseded above; no new seed, deployment, billing or advertising action is implied.

