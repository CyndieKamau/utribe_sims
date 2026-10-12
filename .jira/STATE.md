---
project: utribe_sims
created: 2026-10-12
last_activity: 2026-10-13
active_sprint: 2026-10-12-phase-0-scaffold
---

# State

Project-wide state for the `jira` workflow. The orchestrator commands keep this current.

## Sprints

<!-- One row per sprint. Most recent first. -->

| Slug | Status | Goal | Outcome |
|------|--------|------|---------|
| 2026-10-12-phase-0-scaffold | done | Scaffold a Vite + React + TS + Phaser repo with tests, lint, CI and phone-openable preview | https://github.com/CyndieKamau/utribe_sims/pull/3 |

Status legend: `researching`, `planned`, `executing`, `verifying`, `done`, `blocked`, `abandoned`.

## Decisions log

<!-- Cross-sprint decisions worth remembering. Each as one bullet with the date and the sprint where it was made. -->

- 2026-10-13 (2026-10-12-phase-0-scaffold) D-01: Phaser 4 instead of the spec's locked Phaser 3 — owner-approved; scaffold from the official template's main.
- 2026-10-13 (2026-10-12-phase-0-scaffold) D-02: Deploy target is Cloudflare Pages with public per-PR previews (resolves spec [OPEN]).
- 2026-10-13 (2026-10-12-phase-0-scaffold) D-03: React overlays styled with CSS Modules (resolves spec [OPEN]).
- 2026-10-13 (2026-10-12-phase-0-scaffold) D-04: Maps are code/JSON 2D arrays of named tile constants; one tiles.ts owns the enum and walkability; interactables are named coordinates in the same map module (resolves spec [OPEN]).
- 2026-10-13 (2026-10-12-phase-0-scaffold) D-05: Top-down orthogonal perspective confirmed (resolves spec [CONFIRM]).
- 2026-10-13 (2026-10-12-phase-0-scaffold) D-06: Test hook gated on DEV or VITE_GOLD_RUN_DEV; previews carry it, production never; CI asserts it is absent from dist/.
- 2026-10-13 (2026-10-12-phase-0-scaffold) D-07: Toolchain upgraded in Phase 0 (Vite 8, TypeScript ~6.0, plugin-react 6, react-hooks 7).
- 2026-10-13 (2026-10-12-phase-0-scaffold) D-08: ESLint 10 flat config with folder-scoped engine/systems import bans and a Math.random ban.
- 2026-10-13 (2026-10-12-phase-0-scaffold) D-09: Template demo code, branded assets and telemetry are deleted.

## Blockers

<!-- Active blockers across all sprints. Resolved blockers move to the Decisions log. -->

- (2026-10-12-phase-0-scaffold) Owner: connect Cloudflare Pages (README settings, VITE_GOLD_RUN_DEV=true on Preview only), open the PR #3 preview on a phone, record the result in EXECUTION.md.
- (2026-10-12-phase-0-scaffold) docs/GAME_SPEC.md section 5 still marks top-down perspective as [CONFIRM] although D-05 confirmed it; owner to update the spec.

## Notes

<!-- Free-form workflow notes, accumulated lessons, links to recurring patterns. -->
