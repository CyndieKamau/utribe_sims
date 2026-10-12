# Brief: 2026-10-12-phase-0-scaffold

**Created:** 2026-10-12
**Source:** user-prompt
**Issue:** none

## Statement

Phase 0 — scaffold a repo any agent can run. Read docs/GAME_SPEC.md sections 5 (technical decisions), 6 (repo structure) and the Phase 0 row of section 7.

Must end up supporting: Vite + React + TypeScript with Phaser 3 in the hybrid setup from Phaser's official Vite + React template (use that template as the starting point, do not hand-roll the integration), Zustand with persist middleware, Vitest for unit tests, Playwright for e2e driven through a dev-only window.__GOLD_RUN__ test hook rather than canvas coordinates, linting, GitHub Actions CI, and an auto-deploy preview.

Gate: npm test and npm run e2e pass on the empty shell, and a preview link opens on a phone.

## Constraints

- Use Phaser's official Vite + React template as the starting point; do not hand-roll the Phaser/React integration.
- E2E tests drive the game through the dev-only `window.__GOLD_RUN__` hook, never canvas coordinates.
- Four decisions are still [OPEN] in the spec and block this phase — research the options, do not pick: map authoring (Tiled vs code/JSON), deploy target, styling approach for the React overlays, and confirmation of the top-down perspective.

## Out of scope

- Project scaffolding only. No game content, no zones, no beats, no dialogue.
