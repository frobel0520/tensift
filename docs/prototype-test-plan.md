# Hidden-Rule Grouping Game — Prototype Test Plan

| Item | Value |
|---|---|
| Version | 0.2 Draft — Multilingual |
| Date | 2026-08-28 |
| Product language | English／简体中文／Español |
| Test artifact language | `en`／`zh-Hans`／`es-419`; Traditional Chinese facilitator notes |
| Purpose | Validate the game loop before SA and implementation |

## 1. Questions This Prototype Must Answer

1. Can players infer that all four groups come from one shared classification dimension?
2. Does a fixed `1 / 2 / 3 / 4` capacity layout provide useful deduction rather than arbitrary trial and error?
3. Is full-board submission comfortable on mobile?
4. Is `X of 10 are in the correct group` enough feedback to support a second attempt?
5. Does the one-item group feel deducible by elimination?
6. Can puzzle authors reliably produce one defensible solution without a second plausible partition?
7. Are labels, instructions, feedback, and puzzle assumptions natural and fair in each locale?

## 2. Fixed Prototype Baseline

- Visible theme.
- Ten shuffled item cards.
- Four unlabeled zones with 1, 2, 3, and 4 slots.
- One hidden dimension shared by every group.
- Full board must be filled before `Check` becomes available.
- Checks are unlimited.
- One optional hint is available at any time during the puzzle.
- Results reveal the dimension, group labels, correct mapping, explanation, and sources.

## 3. Feedback Variants

### Variant A — Exact count only

After an incorrect check:

> 6 of 10 items are in the correct group.

No item or row is identified. This is the current recommendation.

### Variant B — Per-zone count

Each zone shows only how many items are correctly placed, for example `2 / 4 correct`.

Risk: likely reveals too much and turns later checks into mechanical swaps.

### Variant C — Count plus optional hint

Use Variant A. Let the player choose when to use:

> Place one random item in its correct row and lock it.

The hint does not reveal the dimension or group label. Record when the player chooses to use it.

## 4. Test Design

### Round 1 — Paper or clickable low-fidelity test

- 5–8 English-capable testers who did not author the puzzles.
- Each tester plays the tutorial plus four puzzles.
- Rotate puzzle order to reduce learning bias.
- First half uses Variant A; second half may use Variant C when stuck.
- Variant B is tested only with 2–3 players as a comparison because it has high spoiler risk.

### Round 2 — Mobile interaction test

- 3–5 testers on at least one iPhone-class and one Android-class viewport.
- Compare drag-and-drop with tap item → tap zone.
- Test keyboard-only interaction separately on desktop.

## 5. Measures and Gates

| Measure | Prototype Gate |
|---|---:|
| Tutorial completion without facilitator help | 100% |
| Player can restate the core rule after tutorial | ≥ 80% |
| Normal-puzzle solve rate without using the hint | 40–80% |
| Players still stuck after using the hint | < 20% |
| Median completion time | 2–5 minutes |
| Median fairness rating | ≥ 4 / 5 |
| Reports of a second equally valid complete solution | 0 |
| Players who understand reveal explanation | ≥ 80% |
| Mobile sessions blocked by drag interaction | 0 |
| One-item group described as pure guessing | < 25% |

If solve rate is above 80%, increase ambiguity or reduce feedback. If below 40%, simplify item labels or replace the puzzle. Compare when players voluntarily use the one-time hint.

## 6. Observation Sheet

For every session record:

```text
tester_id:
device:
puzzle_id:
feedback_variant:
time_to_first_check:
checks_used:
hint_used:
solved:
player_rule_guess:
fairness_1_to_5:
second_solution_reported:
misunderstood_items:
interaction_problem:
notes:
```

Do not collect names, email addresses, or other personal data for this prototype.

## 7. Draft English Puzzle Pack

These are prototype fixtures, not production-approved content. Every puzzle still requires source and ambiguity review.

### P01 — Tutorial: Countries

- Visible theme: `Countries`
- Hidden dimension: `Continent`
- 1 — Oceania: `New Zealand`
- 2 — Africa: `Kenya`, `Egypt`
- 3 — Asia: `Japan`, `India`, `Thailand`
- 4 — Europe: `France`, `Italy`, `Germany`, `Spain`
- Purpose: teach the one-dimension rule with familiar labels.
- Risk: continent conventions can vary for transcontinental countries; selected items avoid that boundary.

### P02 — Animals

- Visible theme: `Animals`
- Hidden dimension: `Animal class`
- 1 — Amphibian: `Frog`
- 2 — Reptile: `Turtle`, `Snake`
- 3 — Bird: `Eagle`, `Penguin`, `Owl`
- 4 — Mammal: `Dog`, `Whale`, `Bat`, `Elephant`
- Purpose: easy semantic classification.

### P03 — Musical Instruments

- Visible theme: `Musical Instruments`
- Hidden dimension: `Instrument family`
- 1 — Percussion: `Drum`
- 2 — Woodwind: `Flute`, `Clarinet`
- 3 — Brass: `Trumpet`, `Trombone`, `Tuba`
- 4 — String: `Violin`, `Cello`, `Harp`, `Guitar`
- Risk: instrument-family taxonomies must use a stated conventional source.

### P04 — Animals

- Visible theme: `Animals`
- Hidden dimension: `Number of legs as an adult`
- 1 — 0 legs: `Eel`
- 2 — 2 legs: `Chicken`, `Ostrich`
- 3 — 4 legs: `Dog`, `Horse`, `Elephant`
- 4 — 6 legs: `Ant`, `Bee`, `Beetle`, `Butterfly`
- Purpose: test a numerical visual rule.
- Risk: damaged animals and larval stages are excluded by the wording `as an adult`.

### P05 — Chemical Elements

- Visible theme: `Chemical Elements`
- Hidden dimension: `Period in the periodic table`
- 1 — Period 1: `Hydrogen`
- 2 — Period 2: `Carbon`, `Oxygen`
- 3 — Period 3: `Sodium`, `Magnesium`, `Chlorine`
- 4 — Period 4: `Potassium`, `Iron`, `Copper`, `Bromine`
- Purpose: test a knowledge-heavy but objective puzzle.

### P06 — Fruit

- Visible theme: `Fruit`
- Hidden dimension: `Typical outer color in the pictured variety`
- 1 — Red: `Red Delicious apple`
- 2 — Yellow: `Banana`, `Lemon`
- 3 — Orange: `Orange`, `Tangerine`, `Persimmon`
- 4 — Green: `Lime`, `Avocado`, `Honeydew`, `Green grape`
- Purpose: test the original visual concept.
- Risk: must use explicit varieties and controlled illustrations; text-only presentation remains ambiguous.

### P07 — Words for Animals

- Visible theme: `Animal Words`
- Hidden dimension: `Number of letters`
- 1 — 3 letters: `Cat`
- 2 — 4 letters: `Lion`, `Bear`
- 3 — 5 letters: `Tiger`, `Horse`, `Shark`
- 4 — 6 letters: `Rabbit`, `Monkey`, `Jaguar`, `Donkey`
- Purpose: test a linguistic rule that does not require outside knowledge.
- Risk: alternate semantic groupings must be checked during blind testing.

### P08 — Everyday Objects

- Visible theme: `Everyday Objects`
- Hidden dimension: `Typical room`
- 1 — Kitchen: `Toaster`
- 2 — Bathroom: `Toothbrush`, `Shower curtain`
- 3 — Bedroom: `Pillow`, `Nightstand`, `Alarm clock`
- 4 — Office: `Stapler`, `Printer`, `Desk chair`, `Paper shredder`
- Purpose: test functional classification.
- Risk: several items can appear in multiple rooms; replace any item challenged by testers.

## 8. Puzzle Review Checklist

Before a prototype puzzle is shown to testers:

- [ ] Exactly ten unique items.
- [ ] Group capacities are exactly 1, 2, 3, and 4.
- [ ] All four labels are values of one dimension.
- [ ] No item fits two canonical groups under the stated dimension.
- [ ] Labels use international English where possible.
- [ ] Images, if any, show the intended variety or state.
- [ ] A reveal sentence explains why every item belongs.
- [ ] Objective claims have a source.
- [ ] Rights notes exist for every shipped visual.
- [ ] Another person attempted to find a second full solution.

## 9. Initial Naming Screen

This is a quick web collision screen, not trademark or domain clearance.

| Candidate | Initial result | Recommendation |
|---|---|---|
| `Tensift` | No obvious puzzle-game collision found in the initial search | Lead working name |
| `Quartition` | No obvious exact game collision; spelling and pronunciation may be difficult | Backup |
| `Ten Into Four` | Descriptive and search-clean, but less brandable | Backup/tagline |
| `Hidden Sort` | Clear but generic and weakly ownable | Internal descriptor only |
| `One Rule` | Existing iOS puzzle game with hidden-rule positioning | Reject |
| `Sortique` | Existing color-sort mobile game | Reject |
| `Fourmation` | Existing board/mobile games and company name | Reject |
| `Tenfold` | Multiple existing games | Reject |

Recommended temporary combination:

> **Tensift**  
> Ten items. Four groups. One hidden rule.

Final naming requires a separate domain, app-store, social-handle, repository, and relevant trademark-database check before public launch.

## 10. Exit Criteria

Proceed to SA only when:

1. At least five people completed the tutorial.
2. At least four non-tutorial puzzles were tested.
3. A feedback variant and hint policy were selected with evidence.
4. No retained puzzle has a reported second valid solution.
5. Tap-to-place is confirmed as a first-class control, not merely an accessibility fallback.
6. The product owner accepts the remaining content-authoring and visual-rights risks.
