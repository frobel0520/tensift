# ADR-0001: Server-authoritative answer boundary

- Status: Proposed
- Date: 2026-08-29
- Scope: production API and puzzle storage

## Context

The prototype can keep its answer in local JavaScript, but a production daily game should not accidentally ship the hidden dimension or group membership in the initial bundle. The game has no accounts or trusted leaderboard, so this is a casual anti-leak requirement rather than a cryptographic anti-cheat system.

## Decision

Store complete locale puzzle records in a private Cloudflare D1 binding. A Worker constructs a safe puzzle DTO for the initial request and reads the solution only for `check`, `hint`, and explicit `reveal` operations. Keep checked-in JSON fixtures for local development, but never import authoring records into the browser bundle.

## Alternatives considered

1. **Static JSON only:** lowest operational cost, but answer data is downloadable and contradicts the leakage requirement.
2. **Client-side answer with obfuscation:** does not provide meaningful protection and complicates debugging.
3. **Authenticated sessions:** stronger abuse controls, but out of scope for the no-account MVP.

## Consequences

- Adds a Worker and D1 migration/seed step to deployment.
- Makes safe DTO projection and API contract tests mandatory.
- A determined player can still infer answers through repeated checks or an intentional reveal; rankings would require a new session/auth ADR.

## Review gate

Before implementation, confirm that casual anti-leak protection is worth the D1/Worker complexity. If static-only hosting is selected, update the product promise and release gate explicitly.

