# ADR-0002: Locale-authored puzzle content

- Status: Proposed
- Date: 2026-08-29
- Scope: content model and localization

## Context

Tensift launches in English, Simplified Chinese, and neutral Latin American Spanish. Some hidden rules are language-sensitive, and a direct translation can change spelling, cultural familiarity, or the uniqueness of the solution.

## Decision

Represent each locale as an explicit `LocalePuzzle` record. Factual puzzles may share a `puzzleFamilyId`, but labels, explanations, sources, rights notes, and difficulty review are authored per locale. Language-sensitive puzzles get independent item and solution records. The runtime never silently falls back to another locale.

## Consequences

- Content work is larger than machine translation, but review and fairness are explicit.
- A daily date can have three locale-specific puzzle IDs while preserving one public theme family.
- Missing translation is a release-blocking content error, not a runtime fallback case.

## Review gate

Confirm whether the first content batch should share factual mappings across all locales or intentionally vary them. Either choice remains compatible with the schema; the decision affects authoring throughput and blind-test coverage.

