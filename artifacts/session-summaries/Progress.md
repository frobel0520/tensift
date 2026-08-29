# Tensift Progress

Last updated: 2026-08-29 (Asia/Taipei)

## Current status

Prototype approved; SD implementation is complete; the Cloudflare Pages production deployment is live. The project is in post-deploy validation and business-model discussion.

## Completed

- React + TypeScript + Vite + Cloudflare Pages Functions skeleton.
- Puzzle domain engine, validator fixtures, API contracts, D1 repository and migrations.
- Three locales: `en`, `zh-Hans`, and `es-419`.
- Three theme modes: original paper (`paper`, default), `light`, and `dark`; language defaults to English unless a saved locale preference exists.
- Gameplay flow: unlimited checks, one-use hint, reveal modal, local session restore, keyboard/tap/drag interactions.
- Nine seeded D1 records (three puzzle families × three locales).
- Unit, contract, typecheck, build, bundle-leak scan, local Pages smoke tests.
- Top-of-page Google AdSense integration: responsive slot, public-ID validation, dev placeholder, CSP allowlist, and a fail-closed `/ads.txt` Function; production client/slot and publisher configuration are deployed, pending Google review before monetization.
- CI cross-platform fix: seed CLI test now uses the runner's native path format instead of a hard-coded Windows path.
- CI is green after upgrading `actions/checkout` and `actions/setup-node` to their Node 24 runtime releases; the earlier Node 20 deprecation annotation is cleared.
- Public GitHub repository: https://github.com/frobel0520/tensift
- Cloudflare Pages production URL: https://tensift.pages.dev
- Initial deployment commit: `4b9155f`.

## Verified deployment

- `/` returns HTTP 200 with security headers.
- `/api/health` returns HTTP 200 and reports D1 catalog version `d1`.
- `check`, `hint`, and `reveal` endpoints respond correctly in production.
- `reveal` responses use `Cache-Control: no-store`.
- `/ads.txt` returns the configured Google direct-seller line with HTTP 200.

## Pending / decision needed

- Seeded puzzles are still `draft`; the first `publishDate` is `2026-09-01`. Until a puzzle is published, `/api/v1/puzzles/today` correctly returns `PUZZLE_NOT_FOUND`.
- Business direction: keep the owned site as the canonical product; use LinkedIn posts and score sharing for discovery. Direct submission to LinkedIn Games Hub is not currently available.
- Share cards are deferred for now.
- Ad direction: the top-of-page banner slot and `ads.txt` are live. Remaining work is AdSense site/account approval, privacy/consent review, and monitoring the first live fill; future Direct Upload builds must inject the public Vite IDs locally.
- Next feature under discussion: guest play plus authenticated cross-device streaks. Proposed sign-in options are Google OAuth and email + password; passwordless magic link remains a future option.
- Build a reviewed content buffer (target: 30 puzzles) before committing to a daily publishing cadence.
- Optional: connect GitHub push events to Cloudflare Pages automatic builds; current deployment was performed directly with Wrangler.

## Known risks

- No account or server-side session; local streaks are not competitive-grade records.
- Content ambiguity and second-solution risk remain the largest product risks.
- Ads are integrated and configured but may not monetize until Google account/site approval; analytics, privacy/consent, and release-content operations are not yet implemented.
- A top banner must reserve stable height and remain clearly distinct from game controls to avoid accidental ad clicks and layout shift.
