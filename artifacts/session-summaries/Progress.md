# Tensift Progress

Last updated: 2026-09-05 (Asia/Taipei)

## Current status

Prototype approved; SD implementation is complete; the Cloudflare Pages production deployment is live and now runs from CI on every push to `main`. A thirty-day content buffer is seeded in D1 across all three locales, with 24 complete days of runway remaining from 2026-09-05 and the first gap at 2026-09-28. Content authoring is now the critical path.

## Completed

- React + TypeScript + Vite + Cloudflare Pages Functions skeleton.
- Puzzle domain engine, validator fixtures, API contracts, D1 repository and migrations.
- Three locales: `en`, `zh-Hans`, and `es-419`.
- Three theme modes: original paper (`paper`, default), `light`, and `dark`; language defaults to English unless a saved locale preference exists.
- Gameplay flow: unlimited checks, one-use hint, reveal modal, local session restore, keyboard/tap/drag interactions.
- Result sharing: the reveal modal now offers localized, spoiler-free sharing through the Web Share API with a clipboard fallback; shared links always point to `https://tensift.pages.dev`.
- Ninety seeded D1 records (thirty puzzle families × three locales), replacing the planned Space puzzle with At Home and extending the reviewed release buffer by twenty more puzzles.
- Latest content refinement: Trees now uses common settings/associations; Global Brands uses soft drinks, cars, fast food, and sportswear; the 2026-09-27 Animal Diets slot is now Animal Movement with stable public puzzle IDs for in-place D1 replacement.
- Remote D1 was reseeded after the refinement; the revised 2026-09-23, 2026-09-26, and 2026-09-27 records each have all three locales and remain scheduled.
- Latest content commit `4d2502a` is pushed to GitHub; CI run `33258104785` passed validation, type checking, tests, Pages build, and bundle-leak scan.
- Unit, contract, typecheck, build, bundle-leak scan, local Pages smoke tests.
- Top-of-page Google AdSense integration: responsive slot, public-ID validation, dev placeholder, CSP allowlist, and a fail-closed `/ads.txt` Function; production client/slot and publisher configuration are deployed, pending Google review before monetization.
- CI cross-platform fix: seed CLI test now uses the runner's native path format instead of a hard-coded Windows path.
- CI is green after upgrading `actions/checkout` and `actions/setup-node` to their Node 24 runtime releases; the earlier Node 20 deprecation annotation is cleared.
- Deployment automation (2026-09-05): `Deploy` workflow repeats every CI gate on a push to `main`, then publishes `dist/` to Cloudflare Pages. AdSense public IDs are injected from repository variables, replacing the per-build local injection that a Direct Upload previously required. Deploy runs #1 and #2 both succeeded; the deployed bundle keeps the live ad slot and matches the hash of the last manual deployment.
- Deploy is fail-closed on configuration: if any of `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `VITE_ADSENSE_CLIENT_ID` or `VITE_ADSENSE_TOP_SLOT` is unset, every gate still runs but the deployment step is skipped with a job-summary notice. A missing Cloudflare credential would only fail a run, but a missing AdSense identifier would publish a build with the live ad slot silently switched off.
- Scheduled `Daily production smoke` (UTC 00:15): asserts `/api/health`, and for all three locales that `today` returns HTTP 200 with `publishDate` equal to the current UTC date, 10 items, 4 rows, and no `solution` / `hiddenDimension` / `explanation` in the safe DTO. Publishing itself needs no cron: the `today` query selects on `publish_date = <current UTC date> AND status IN ('scheduled','published')`.
- Scheduled `Content runway alarm` (UTC 01:00 Mondays, plus any PR touching `content/puzzles/**`): fails below 14 consecutive complete days. Runway is measured to the first gap, not by file count, because one missing locale is the day the daily release breaks; dates are read from each file's `publishDate` field, not its filename, which does not always agree.
- Manual `Seed content to D1` workflow: `dry-run` validates and uploads the generated SQL as an artifact; `apply` is a separate job on the `production` environment that applies migrations and seeds remote D1. Wrangler skips its confirmation prompt in non-interactive CI, so no extra flag is needed.
- Branching model fixed as `main` plus short-lived feature branches; the dangling `dev` references in the workflows were removed. Branch protection on `main` requires a pull request and a passing `Validate, test, build` check, without requiring approvals (single maintainer) and without blocking administrator bypass (emergency escape hatch).
- Repository configuration in place: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as secrets, `VITE_ADSENSE_CLIENT_ID` and `VITE_ADSENSE_TOP_SLOT` as variables.
- Public GitHub repository: https://github.com/frobel0520/tensift
- Cloudflare Pages production URL: https://tensift.pages.dev
- Daily release window (UTC), in `en`, `zh-Hans`, and `es-419`: Countries published 2026-08-29; Animals scheduled 2026-08-30; Musical Instruments scheduled 2026-08-31; Natural Landmarks scheduled 2026-09-01; Vehicles scheduled 2026-09-02; At Home scheduled 2026-09-03; Sports scheduled 2026-09-04; Animal Habitats scheduled 2026-09-05; Food scheduled 2026-09-06; World Landmarks scheduled 2026-09-07; Fruits scheduled 2026-09-08; The Human Body scheduled 2026-09-09; Vegetables scheduled 2026-09-10; World Cities scheduled 2026-09-11; Languages scheduled 2026-09-12; Breakfast scheduled 2026-09-13; Everyday Tools scheduled 2026-09-14; Materials scheduled 2026-09-15; Wheeled Things scheduled 2026-09-16; Fictional Characters scheduled 2026-09-17.
- Daily release window (UTC), in `en`, `zh-Hans`, and `es-419`: Clothing scheduled 2026-09-18; Animal Coverings scheduled 2026-09-19; World Foods scheduled 2026-09-20; Beverages scheduled 2026-09-21; Sports Equipment scheduled 2026-09-22; Trees scheduled 2026-09-23; Home Appliances scheduled 2026-09-24; School and Office scheduled 2026-09-25; Global Brands scheduled 2026-09-26; Animal Movement scheduled 2026-09-27.
- Latest direct Pages deployment alias: https://04f256d2.tensift.pages.dev (share-enabled build; canonical URL remains https://tensift.pages.dev).
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
- After the first CI-driven deployment (2026-09-05), production still serves all three locales for the current UTC date, `/ads.txt` still returns the direct-seller line, and the served bundle still contains the AdSense client and slot identifiers.

## Pending / decision needed

- The first daily release is live for 2026-08-29, with twenty-nine additional records scheduled through 2026-09-27. Maintain the UTC publishing job and verify each release before it becomes playable.
- Business direction: keep the owned site as the canonical product; use LinkedIn posts and score sharing for discovery. Direct submission to LinkedIn Games Hub is not currently available.
- Image-based share cards remain deferred; the current share flow is text-first and ready for organic sharing tests.
- Ad direction: the top-of-page banner slot and `ads.txt` are live. Remaining work is AdSense site/account approval, privacy/consent review, and monitoring the first live fill; future Direct Upload builds must inject the public Vite IDs locally.
- Next feature under discussion: guest play plus authenticated cross-device streaks. Proposed sign-in options are Google OAuth and email + password; passwordless magic link remains a future option.
- Keep expanding the reviewed content buffer beyond the current 30 puzzle families. The runway alarm will fail on the Monday around 2026-09-14, roughly thirteen days before the buffer runs out, which is the working deadline for the next batch.
- Blind playtesting for second-solution ambiguity is still not done for any of the thirty puzzle families. This remains the largest product risk and has no automated guard.

## Known risks

- No account or server-side session; local streaks are not competitive-grade records.
- Content ambiguity and second-solution risk remain the largest product risks.
- Some new rules are intentionally everyday interpretations (usual room, usual venue, or main ingredient); blind playtesting should confirm that each has one dominant answer.
- The second batch adds color, plant-part, grain, language-family, material-source, wheel-count, and character-type rules. Languages now uses Hellenic, Germanic, Indo-Aryan, and Romance families; Breakfast replaces Rice pudding with Rice bread, and Wheeled Things replaces Tuk-tuk/Pedicab with more descriptive options. These still need the same second-solution review before their release dates.
- The third batch adds Clothing, Animal Coverings, World Foods, Beverages, Sports Equipment, Trees, Home Appliances, School and Office, Global Brands, and Animal Movement. Trees now uses common settings/associations instead of botanical types; Global Brands uses soft drink, car, fast-food, and sportswear industries; the 2026-09-27 slot was revised from Animal Diets to Animal Movement while retaining the existing public puzzle IDs for an in-place D1 replacement. Blind playtesting should confirm the everyday associations.
- Ads are integrated and configured but may not monetize until Google account/site approval; analytics, privacy/consent, and release-content operations are not yet implemented.
- A top banner must reserve stable height and remain clearly distinct from game controls to avoid accidental ad clicks and layout shift.
