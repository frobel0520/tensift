# Tensift Prototype Approval

Approved: 2026-08-29  
Scope: `index.html` multilingual gameplay prototype

## Frozen decisions

1. The board contains ten items and four unlabeled rows with capacities 1, 2, 3, and 4.
2. The hidden rule is one shared objective classification dimension.
3. Players may check an entirely filled board unlimited times.
4. The interface reports the positive `Attempts` count; the successful check is included.
5. One `Hint` is available at any time. It randomly places and locks one item in its correct row.
6. `Reveal answer` is placed in the right column, aligned with the bottom action row on desktop.
7. The result dialog has a close button and closes with Escape.
8. The first locales are English (`en`), Simplified Chinese (`zh-Hans`), and neutral Latin American Spanish (`es-419`).
9. Locale content is authored per language; language-sensitive puzzles are not mechanically translated.
10. The Tweaks panel and experimental feedback modes are removed from the product baseline.

## Accepted prototype location

`C:\Users\ytwei\Projects\tensift\index.html`

## Next phase

The next work package is SA / production design: domain model, locale-aware puzzle schema, answer-leakage boundary, API contracts, privacy and analytics decisions, and deployment architecture. Core gameplay changes require a new ADR after this approval.
