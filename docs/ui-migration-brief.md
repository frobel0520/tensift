# Tensift UI migration brief

## Mode

Redesign · Preserve. The approved single-file prototype is the visual and interaction reference; the production UI changes the data source and state boundary without changing the game rules.

## Preserve

- Warm paper background, serif Tensift wordmark, editorial hierarchy, and compact outlined controls.
- Four unlabeled rows with capacities 1 / 2 / 3 / 4, right-aligned slot groups, and card-based placement.
- Positive `Attempts` wording, unlimited checks, one locked Hint, explicit Reveal answer, and closable/Escape-safe result dialog.
- English, Simplified Chinese, and Latin American Spanish locale switching.
- Mobile tap-to-place plus desktop drag-and-drop and keyboard focus states.

## Improve

- Replace inline answer-bearing fixture data with the safe API client and server-authoritative check/hint/reveal calls.
- Persist only public session state under `tensift:v1:session:{locale}:{puzzleId}`.
- Add loading, retryable error, disabled, checking, solved, revealed, and empty-board states.
- Keep row and item semantics explicit for screen readers and announce feedback through `aria-live`.

## Remove

- Prototype-only puzzle switcher and inline archive data from the browser bundle.
- Prototype-only “next puzzle” navigation; the production surface serves one daily puzzle.
- Direct DOM mutation and answer mapping in the client.

## Protected contracts

The `/api/*` paths, public DTO fields, row capacities, check-count feedback, one-use hint, reveal close behavior, locale values, and local session key format must remain compatible with the system design.

## Design read and dials

- Artifact: mobile-first daily puzzle board with a reveal dialog.
- Audience: global casual puzzle players, primarily phone and laptop.
- Visual language: editorial puzzle desk — paper grid, ink outlines, serif display type, one warm accent.
- Mode: preserve.
- Visual variance: 3/10.
- Motion intensity: 2/10.
- Information density: 6/10.
- Asset dependence: 1/10 (text/emoji-first).
- Brand fidelity: 9/10.

## Highest-risk change

Connecting a production client to D1 while ensuring answer fields remain absent from the initial response and browser bundle.

## Rollback / fallback

The root `index.html` remains the approved prototype reference. If the API is unavailable, the app keeps the current session in memory and offers retry; it does not silently substitute fixture answers in production.
