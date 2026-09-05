# Tensift Progress

Last updated: 2026-09-05 (Asia/Taipei)

## Current status

Prototype approved; SD implementation is complete; the Cloudflare Pages production deployment is live and now runs from CI on every push to `main`. A forty-day content buffer is authored across all three locales, with 33 complete days of runway from 2026-09-05 and the first gap at 2026-10-08; all forty days are seeded in remote D1. Every family from 2026-09-28 onward now carries an ambiguity review ledger, enforced in CI; blind playtesting remains the open risk.

## Completed

- React + TypeScript + Vite + Cloudflare Pages Functions skeleton.
- Puzzle domain engine, validator fixtures, API contracts, D1 repository and migrations.
- Three locales: `en`, `zh-Hans`, and `es-419`.
- Three theme modes: original paper (`paper`, default), `light`, and `dark`; language defaults to English unless a saved locale preference exists.
- Gameplay flow: unlimited checks, one-use hint, reveal modal, local session restore, keyboard/tap/drag interactions.
- Result sharing: the reveal modal now offers localized, spoiler-free sharing through the Web Share API with a clipboard fallback; shared links always point to `https://tensift.pages.dev`.
- One hundred and twenty seeded D1 records (forty puzzle families × three locales), replacing the planned Space puzzle with At Home and extending the reviewed release buffer across four batches.
- Latest content refinement: Trees now uses common settings/associations; Global Brands uses soft drinks, cars, fast food, and sportswear; the 2026-09-27 Animal Diets slot is now Animal Movement with stable public puzzle IDs for in-place D1 replacement.
- Remote D1 was reseeded after the refinement; the revised 2026-09-23, 2026-09-26, and 2026-09-27 records each have all three locales and remain scheduled.
- Fourth content batch (2026-09-28 to 2026-10-07): Shapes, Animal Legs, Jobs and Workplaces, Tastes, Weather, Furniture, Birds, Cooking Methods, Around Town, and Sources of Light, in all three locales. Thirty new files, taking the authored buffer to forty families and the runway to 33 days. Seeded to remote D1 on 2026-09-05 through the `Seed content to D1` workflow: dry-run first (120 puzzles generated, no database touched, apply job correctly skipped), then apply (no pending migrations, 4450 queries, 12327 rows written, database 0.74 MB). Production smoke passed afterwards.
- Ambiguity guard (`scripts/check-playtest.mjs`, `content/playtest/`): each puzzle family carries a ledger naming the items that were tested against a rival group and why the intended group wins. Author review is a hard CI failure for families publishing from 2026-09-28 onward; the thirty earlier families are reported as backlog without failing, so the guard could land without rewriting released content. Blind playtesting is reported as debt within seven days of release and only fails under `--strict-blind`, because no family has a blind pass yet and enforcing it today would fail every run. The ledger check also verifies referentially that every item and rival group id exists in the puzzle, and that a rival is never the item's own group.
- Bundle-leak scan now matches authored answer values on word boundaries instead of as bare substrings. The Tastes group label `Sour` is a substring of the existing UI string `Sources`, which failed the scan on correct content; a real leak ships the value as its own string literal, so the surrounding quotes still provide the boundaries. Verified both ways against the built bundle before merging.
- The `Content runway alarm` workflow is now `Content alarm` (`.github/workflows/content-alarm.yml`) and runs both checks; the ledger step runs even when the runway step fails, since a short buffer and an unreviewed puzzle are separate problems.
- Latest content commit `4d2502a` is pushed to GitHub; CI run `33258104785` passed validation, type checking, tests, Pages build, and bundle-leak scan.
- Unit, contract, typecheck, build, bundle-leak scan, local Pages smoke tests.
- Top-of-page Google AdSense integration: responsive slot, public-ID validation, dev placeholder, CSP allowlist, and a fail-closed `/ads.txt` Function; production client/slot and publisher configuration are deployed, pending Google review before monetization.
- CI cross-platform fix: seed CLI test now uses the runner's native path format instead of a hard-coded Windows path.
- CI is green after upgrading `actions/checkout` and `actions/setup-node` to their Node 24 runtime releases; the earlier Node 20 deprecation annotation is cleared. `actions/upload-artifact` was bumped from v4 to v7 for the same reason: v6 is the release that moves the runtime to Node 24, and v7 only adds an optional direct-upload mode on top, so the seed workflow's inputs are unchanged.
- Deployment automation (2026-09-05): `Deploy` workflow repeats every CI gate on a push to `main`, then publishes `dist/` to Cloudflare Pages. AdSense public IDs are injected from repository variables, replacing the per-build local injection that a Direct Upload previously required. Deploy runs #1 and #2 both succeeded; the deployed bundle keeps the live ad slot and matches the hash of the last manual deployment.
- Deploy is fail-closed on configuration: if any of `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `VITE_ADSENSE_CLIENT_ID` or `VITE_ADSENSE_TOP_SLOT` is unset, every gate still runs but the deployment step is skipped with a job-summary notice. A missing Cloudflare credential would only fail a run, but a missing AdSense identifier would publish a build with the live ad slot silently switched off.
- Scheduled `Daily production smoke` (UTC 00:15): asserts `/api/health`, and for all three locales that `today` returns HTTP 200 with `publishDate` equal to the current UTC date, 10 items, 4 rows, and no `solution` / `hiddenDimension` / `explanation` in the safe DTO. Publishing itself needs no cron: the `today` query selects on `publish_date = <current UTC date> AND status IN ('scheduled','published')`.
- Scheduled `Content alarm` (UTC 01:00 Mondays, plus any PR touching `content/puzzles/**` or `content/playtest/**`): fails below 14 consecutive complete days, and fails on a family scheduled from 2026-09-28 onward with no ambiguity review. Runway is measured to the first gap, not by file count, because one missing locale is the day the daily release breaks; dates are read from each file's `publishDate` field, not its filename, which does not always agree.
- Manual `Seed content to D1` workflow: `dry-run` validates and uploads the generated SQL as an artifact; `apply` is a separate job on the `production` environment that applies migrations and seeds remote D1. Wrangler skips its confirmation prompt in non-interactive CI, so no extra flag is needed.
- Branching model fixed as `main` plus short-lived feature branches; the dangling `dev` references in the workflows were removed. Branch protection on `main` requires a pull request and a passing `Validate, test, build` check, without requiring approvals (single maintainer) and without blocking administrator bypass (emergency escape hatch).
- Repository configuration in place: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as secrets, `VITE_ADSENSE_CLIENT_ID` and `VITE_ADSENSE_TOP_SLOT` as variables.
- Public GitHub repository: https://github.com/frobel0520/tensift
- Cloudflare Pages production URL: https://tensift.pages.dev
- Daily release window (UTC), in `en`, `zh-Hans`, and `es-419`: Countries published 2026-08-29; Animals scheduled 2026-08-30; Musical Instruments scheduled 2026-08-31; Natural Landmarks scheduled 2026-09-01; Vehicles scheduled 2026-09-02; At Home scheduled 2026-09-03; Sports scheduled 2026-09-04; Animal Habitats scheduled 2026-09-05; Food scheduled 2026-09-06; World Landmarks scheduled 2026-09-07; Fruits scheduled 2026-09-08; The Human Body scheduled 2026-09-09; Vegetables scheduled 2026-09-10; World Cities scheduled 2026-09-11; Languages scheduled 2026-09-12; Breakfast scheduled 2026-09-13; Everyday Tools scheduled 2026-09-14; Materials scheduled 2026-09-15; Wheeled Things scheduled 2026-09-16; Fictional Characters scheduled 2026-09-17.
- Daily release window (UTC), in `en`, `zh-Hans`, and `es-419`: Clothing scheduled 2026-09-18; Animal Coverings scheduled 2026-09-19; World Foods scheduled 2026-09-20; Beverages scheduled 2026-09-21; Sports Equipment scheduled 2026-09-22; Trees scheduled 2026-09-23; Home Appliances scheduled 2026-09-24; School and Office scheduled 2026-09-25; Global Brands scheduled 2026-09-26; Animal Movement scheduled 2026-09-27.
- Daily release window (UTC), in `en`, `zh-Hans`, and `es-419`: Shapes scheduled 2026-09-28; Animal Legs scheduled 2026-09-29; Jobs and Workplaces scheduled 2026-09-30; Tastes scheduled 2026-10-01; Weather scheduled 2026-10-02; Furniture scheduled 2026-10-03; Birds scheduled 2026-10-04; Cooking Methods scheduled 2026-10-05; Around Town scheduled 2026-10-06; Sources of Light scheduled 2026-10-07.
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
- Keep expanding the buffer beyond the current 40 puzzle families. With the fourth batch in, the runway alarm now fires on the Monday around 2026-09-21, which is the working deadline for the fifth batch.
- Blind playtesting for second-solution ambiguity is still not done for any of the forty families. The ledger now makes that debt visible on every alarm run and records the author-side review, but author review is the author grading their own work: it catches the alternates you can see, not the ones a fresh player finds. Recruit two testers per family, record the result in `content/playtest/`, then turn on `--strict-blind`.
- Highest-risk items flagged during author review, in order: the thunderstorm in Weather (2026-10-02), the bookshelf/table boundary in Furniture (2026-10-03), the whole of Cooking Methods (2026-10-05, every method involves some oil or water in practice), the train station in Around Town (2026-10-06), and the school nurse in Jobs and Workplaces (2026-09-30). Each ledger records the replacement to make if blind testers split.

## Known risks

- No account or server-side session; local streaks are not competitive-grade records.
- Content ambiguity and second-solution risk remain the largest product risks.
- Some new rules are intentionally everyday interpretations (usual room, usual venue, or main ingredient); blind playtesting should confirm that each has one dominant answer.
- The second batch adds color, plant-part, grain, language-family, material-source, wheel-count, and character-type rules. Languages now uses Hellenic, Germanic, Indo-Aryan, and Romance families; Breakfast replaces Rice pudding with Rice bread, and Wheeled Things replaces Tuk-tuk/Pedicab with more descriptive options. These still need the same second-solution review before their release dates.
- The third batch adds Clothing, Animal Coverings, World Foods, Beverages, Sports Equipment, Trees, Home Appliances, School and Office, Global Brands, and Animal Movement. Trees now uses common settings/associations instead of botanical types; Global Brands uses soft drink, car, fast-food, and sportswear industries; the 2026-09-27 slot was revised from Animal Diets to Animal Movement while retaining the existing public puzzle IDs for an in-place D1 replacement. Blind playtesting should confirm the everyday associations.
- The fourth batch is the first content written against the ambiguity ledger, so each family has a recorded fallback: sleet for the thunderstorm, a filing cabinet for the bookshelf, a relabeled group for the train station, a surgeon for the nurse, pickles for the plain yogurt. Cooking Methods is the hardest of the ten and may need to move later in the schedule.
- Ads are integrated and configured but may not monetize until Google account/site approval; analytics, privacy/consent, and release-content operations are not yet implemented.
- A top banner must reserve stable height and remain clearly distinct from game controls to avoid accidental ad clicks and layout shift.
