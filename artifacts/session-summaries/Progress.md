# Tensift Progress

Last updated: 2026-08-29 (Asia/Taipei)

## Current status

Prototype approved; SD implementation is complete; the first Cloudflare Pages deployment is live. The project is in post-deploy validation and business-model discussion.

## Completed

- React + TypeScript + Vite + Cloudflare Pages Functions skeleton.
- Puzzle domain engine, validator fixtures, API contracts, D1 repository and migrations.
- Three locales: `en`, `zh-Hans`, and `es-419`.
- Three theme modes: original paper (`paper`, default), `light`, and `dark`; language defaults to English unless a saved locale preference exists.
- Gameplay flow: unlimited checks, one-use hint, reveal modal, local session restore, keyboard/tap/drag interactions.
- Nine seeded D1 records (three puzzle families × three locales).
- Unit, contract, typecheck, build, bundle-leak scan, local Pages smoke tests.
- Public GitHub repository: https://github.com/frobel0520/tensift
- Cloudflare Pages production URL: https://tensift.pages.dev
- Initial deployment commit: `4b9155f`.

## Verified deployment

- `/` returns HTTP 200 with security headers.
- `/api/health` returns HTTP 200 and reports D1 catalog version `d1`.
- `check`, `hint`, and `reveal` endpoints respond correctly in production.
- `reveal` responses use `Cache-Control: no-store`.

## Pending / decision needed

- Seeded puzzles are still `draft`; the first `publishDate` is `2026-09-01`. Until a puzzle is published, `/api/v1/puzzles/today` correctly returns `PUZZLE_NOT_FOUND`.
- Business direction: keep the owned site as the canonical product; use LinkedIn posts and score sharing for discovery. Direct submission to LinkedIn Games Hub is not currently available.
- Share cards are deferred for now.
- Ad direction: reserve a top-of-page banner slot, visually separated from the game board; do not load AdSense until the publisher account, consent flow and CSP allowlist are ready.
- Next feature under discussion: guest play plus authenticated cross-device streaks. Proposed providers are Google OAuth and passwordless email magic links; email/password choice is not yet approved.
- Build a reviewed content buffer (target: 30 puzzles) before committing to a daily publishing cadence.
- Optional: connect GitHub push events to Cloudflare Pages automatic builds; current deployment was performed directly with Wrangler.

## Known risks

- No account or server-side session; local streaks are not competitive-grade records.
- Content ambiguity and second-solution risk remain the largest product risks.
- Ads, analytics, privacy/consent, and release-content operations are not yet implemented.
- A top banner must reserve stable height and remain clearly distinct from game controls to avoid accidental ad clicks and layout shift.
