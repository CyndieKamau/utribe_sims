# Gold Run — standing rules

Browser-based 2D game prototype. A playable vertical slice, not a full game.

**Read before starting any work:** `docs/GAME_SPEC.md` (design source of truth), `.jira/STATE.md`
(progress), and the active sprint's `CONTEXT.md` (locked decisions). If this file conflicts with
`GAME_SPEC.md` on design, the spec wins. If it conflicts with the global `~/.claude/CLAUDE.md` on
process, this file wins — see below.

## Autonomy in this repo

This is a throwaway prototype on a personal repo. It is meant to be built by agents working
unattended, so the global directives **Plan and Build Are Separate Steps** and **Phased Execution**
do not apply here:

- Inside an approved `NN-PLAN.md`, implement all of its tasks without pausing for approval between
  them. The plan was the approval.
- Do not stop to ask whether to continue to the next task in the same plan. Finish the plan, record
  the outcome in `EXECUTION.md`, and stop there.
- Still stop and ask when a locked decision (`D-XX`) would have to change, when the work would go
  outside the plan's **Out of scope**, or when an `[OPEN]` item in the spec blocks progress. Never
  silently resolve an `[OPEN]` or `[CONFIRM]`.

## Architecture — non-negotiable

- **Game logic lives in pure TypeScript** under `src/engine` and `src/systems`. It must not import
  Phaser or React, and must be unit-testable in isolation.
- **Phaser only displays and reports.** Scenes read from the store and emit interaction events
  ("player reached dig spot"). They never decide outcomes, roll dice, or mutate game state.
- **React only renders and dispatches.** No game rules in components.
- **One event bus** between Phaser and React, plus the shared Zustand store. No direct calls from a
  scene into a component or vice versa.
- **Batch history is append-only.** Gaps, weight drift and assay outcome are *derived* by pure
  functions, never stored as fields.
- **Seeded RNG only.** No bare `Math.random()` anywhere — runs must be reproducible from the seed.
- **All save/load goes through one module.** Swapping in a server later must mean editing that file
  and nothing else. Game state is plain versioned JSON.

## Code quality

- **No hardcoded content.** Dialogue, events, NPC definitions, interactables, maps and region-pack
  strings live in `src/content` as JSON. A string a player can read does not belong in a `.tsx` or
  a scene file.
- **No magic numbers.** Cash amounts, stat deltas, thresholds and event odds are named constants or
  JSON config, so balancing never requires hunting through logic.
- **Build reusable components, but only on the second use.** Extract a shared component when
  something is genuinely needed twice — not speculatively for a single use.
- **Types over strings.** Use the `RoleId`, `ZoneId`, `BeatId` and status unions from the spec.
  No loose string literals for things with a defined set of values.
- Match the file layout in section 6 of the spec. New top-level directories need a reason.

## Skills to use

- **`react-best-practices`** — apply when writing or reviewing any React overlay. 45 rules covering
  re-renders, memoisation, bundle size and rendering cost. The overlays sit on top of a running
  canvas, so wasted re-renders cost frames.
- **`tdd`** — engine and systems work is pure TypeScript with no UI. Write the test first.
- **`debug`** — use before proposing a fix for any failing test or unexpected behaviour. Root cause
  first, not symptom patching.
- **`grill`** — stress-test a design before committing to it when a decision looks load-bearing.

## Definition of done

A task is done when `npm test` and `npm run e2e` both pass, the Gherkin predicates the plan claimed
via `effects:` are actually covered by tests, and nothing outside the plan's **Files** list changed.

The world is a canvas, so end-to-end tests drive the game through the dev-only test hook
(`window.__GOLD_RUN__`) rather than clicking pixels. Never add a test that depends on canvas
coordinates.

## Content rules

These words must never appear on screen: *provenance*, *chain of custody*, *compliance*,
*blockchain*, *tokenization*, *immutable*, *proof of reserve*. Concepts are shown through
consequences, never named or explained.

No calls to action, outbound links, sign-ups, or brand mentions in gameplay. No real wallet,
token, payment or blockchain functionality — the build is fully sandboxed.

Write clear, informal, youthful English. No slang, pidgin, dialect or local-language phrases. The
setting is fictional and specific, never a real country and never "generic Africa". Character voice
comes from personality, not vocabulary.

## Assets

Placeholder art is CC0 only (Kenney.nl and similar). Every asset's source and licence goes in
`public/assets/CREDITS.md` at the time it is added, not later.
