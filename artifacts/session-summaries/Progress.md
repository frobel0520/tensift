# Tensift Progress

Last updated: 2026-08-29 (Asia/Taipei)

## Current status

Prototype approved; SD implementation is complete; the Cloudflare Pages production deployment is live with the first daily release active. A twenty-day content buffer is now seeded in D1 across all three locales.

## Completed

- React + TypeScript + Vite + Cloudflare Pages Functions skeleton.
- Puzzle domain engine, validator fixtures, API contracts, D1 repository and migrations.
- Three locales: `en`, `zh-Hans`, and `es-419`.
- Three theme modes: original paper (`paper`, default), `light`, and `dark`; language defaults to English unless a saved locale preference exists.
- Gameplay flow: unlimited checks, one-use hint, reveal modal, local session restore, keyboard/tap/drag interactions.
- Sixty seeded D1 records (twenty puzzle families × three locales), replacing the planned Space puzzle with At Home and extending the reviewed release buffer by ten more puzzles.
- Unit, contract, typecheck, build, bundle-leak scan, local Pages smoke tests.
- Top-of-page Google AdSense integration: responsive slot, public-ID validation, dev placeholder, CSP allowlist, and a fail-closed `/ads.txt` Function; production client/slot and publisher configuration are deployed, pending Google review before monetization.
- CI cross-platform fix: seed CLI test now uses the runner's native path format instead of a hard-coded Windows path.
- CI is green after upgrading `actions/checkout` and `actions/setup-node` to their Node 24 runtime releases; the earlier Node 20 deprecation annotation is cleared.
- Public GitHub repository: https://github.com/frobel0520/tensift
- Cloudflare Pages production URL: https://tensift.pages.dev
- Daily release window (UTC), in `en`, `zh-Hans`, and `es-419`: Countries published 2026-08-29; Animals scheduled 2026-08-30; Musical Instruments scheduled 2026-08-31; Natural Landmarks scheduled 2026-09-01; Vehicles scheduled 2026-09-02; At Home scheduled 2026-09-03; Sports scheduled 2026-09-04; Animal Habitats scheduled 2026-09-05; Food scheduled 2026-09-06; World Landmarks scheduled 2026-09-07; Fruits scheduled 2026-09-08; The Human Body scheduled 2026-09-09; Vegetables scheduled 2026-09-10; World Cities scheduled 2026-09-11; Languages scheduled 2026-09-12; Breakfast scheduled 2026-09-13; Everyday Tools scheduled 2026-09-14; Materials scheduled 2026-09-15; Wheeled Things scheduled 2026-09-16; Fictional Characters scheduled 2026-09-17.
- Latest direct Pages deployment alias: https://90c478fb.tensift.pages.dev
- Initial deployment commit: `4b9155f`.

## Verified deployment

- `/` returns HTTP 200 with security headers.
- `/api/health` returns HTTP 200 and reports D1 catalog version `d1`.
- `check`, `hint`, and `reveal` endpoints respond correctly in production.
- `reveal` responses use `Cache-Control: no-store`.
- `/ads.txt` returns the configured Google direct-seller line with HTTP 200.
- `/robots.txt` allows crawlers with HTTP 200.
- `/api/v1/puzzles/today` returns the published Countries puzzle with HTTP 200 for all three locales; the safe DTO does not expose `solution` or `hiddenDimension`.
- The release commit `76f2bba` has a successful GitHub Actions CI run.

## Pending / decision needed

- The first daily release is live for 2026-08-29, with nineteen additional records scheduled through 2026-09-17. Maintain the UTC publishing job and verify each release before it becomes playable.
- Business direction: keep the owned site as the canonical product; use LinkedIn posts and score sharing for discovery. Direct submission to LinkedIn Games Hub is not currently available.
- Share cards are deferred for now.
- Ad direction: the top-of-page banner slot and `ads.txt` are live. Remaining work is AdSense site/account approval, privacy/consent review, and monitoring the first live fill; future Direct Upload builds must inject the public Vite IDs locally.
- Next feature under discussion: guest play plus authenticated cross-device streaks. Proposed sign-in options are Google OAuth and email + password; passwordless magic link remains a future option.
- Keep expanding the reviewed content buffer beyond the current 20 puzzle families to sustain the daily publishing cadence.
- Optional: connect GitHub push events to Cloudflare Pages automatic builds; current deployment was performed directly with Wrangler.

## Known risks

- No account or server-side session; local streaks are not competitive-grade records.
- Content ambiguity and second-solution risk remain the largest product risks.
- Some new rules are intentionally everyday interpretations (usual room, usual venue, or main ingredient); blind playtesting should confirm that each has one dominant answer.
- The second batch adds color, plant-part, grain, language-family, material-source, wheel-count, and character-type rules. Languages now uses Hellenic, Germanic, Indo-Aryan, and Romance families; Breakfast replaces Rice pudding with Rice bread, and Wheeled Things replaces Tuk-tuk/Pedicab with more descriptive options. These still need the same second-solution review before their release dates.
- Ads are integrated and configured but may not monetize until Google account/site approval; analytics, privacy/consent, and release-content operations are not yet implemented.
- A top banner must reserve stable height and remain clearly distinct from game controls to avoid accidental ad clicks and layout shift.
