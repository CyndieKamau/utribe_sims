---
sprint: 2026-10-12-phase-0-scaffold
plan: III
wave: II
goal: On the empty Phaser 4 shell, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` all exit 0 locally and in the GitHub Actions CI run for the sprint PR, the production build contains no `__GOLD_RUN__`, and the PR's Cloudflare Pages preview URL opens on a phone (owner-verified).
worktree: false             # shared tree; see Commit safety
branch: jira/2026-10-12-phase-0-scaffold
issue: none
depends_on: [I]
parallel_with: [II]
files_modified:
  - vitest.config.ts
  - src/engine/rng.ts
  - src/engine/save.ts
  - src/engine/state.ts
  - src/engine/store.ts
  - src/engine/.gitkeep
  - tests/unit/rng.test.ts
  - tests/unit/save.test.ts
  - tests/unit/store.test.ts
  - tests/unit/.gitkeep
covers:
  - CD-01
  - CD-02
  - CD-03
  - CD-04
  - CD-05
  - GOAL: npm test exits 0
  - "RESEARCH: vanilla createStore + persist + custom StateStorage; React reads via useStore(store, sel)"
  - "RESEARCH: persist setItem is unguarded; wrap every storage method in try/catch"
  - "RESEARCH: always supply migrate; version mismatch without migrate silently drops the save"
  - "RESEARCH: two version fields (GameState.version vs persist envelope) need one source of truth"
  - "RESEARCH: RNG reproducibility across reloads: cursor vs keyed derivation"
  - "RESEARCH: Vitest picks up Playwright specs; set include to tests/unit"
  - "RESEARCH: Vitest 5 does not look up ancestor configs; needs its own vitest.config.ts"
  - "RESEARCH: persist writes full state on every set; partialize the persisted slice"
effects:
  - STO-01
  - STO-02
  - STO-03
  - STO-04
---

# Plan III: Pure-TS engine core: Vitest, seeded RNG, save module, persisted store

**Sprint goal:** On the empty Phaser 4 shell, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` all exit 0 locally and in the GitHub Actions CI run for the sprint PR, the production build contains no `__GOLD_RUN__`, and the PR's Cloudflare Pages preview URL opens on a phone (owner-verified).

**This plan delivers:**
- `vitest.config.ts`
- `src/engine/rng.ts`: a seeded, keyed RNG
- `src/engine/save.ts`: the single save/load module, safe when storage is blocked
- `src/engine/state.ts`: the versioned Phase 0 state
- `src/engine/store.ts`: a `zustand/vanilla` store persisted through the save module

All of it is test-first, per the `tdd` skill.

## Files

`vitest.config.ts`, `src/engine/{rng,save,state,store}.ts`, `tests/unit/{rng,save,store}.test.ts`. Delete `src/engine/.gitkeep` and `tests/unit/.gitkeep` once real files exist in those directories.

Plan II runs in parallel and owns `eslint.config.js` and `tests/unit/boundaries.test.ts`. Do not touch them.

## Commit safety on the shared tree

The sprint runs on one branch with `worktree: false`. Each executor stages only the paths in its own `files_modified`, by name (`git add <path> ...`), never `git add -A` or `git add .`. Commits from parallel plans in the same wave are made one at a time, never concurrently.

## Tasks

### I. Vitest config and seeded RNG (test first)

- **Files:** `vitest.config.ts`, `tests/unit/rng.test.ts`, `src/engine/rng.ts`
- **Read first:** `package.json`, `tsconfig.node.json`, CONTEXT CD-05, `features/engine-state.feature` (STO-01), `~/.claude/skills/tdd/SKILL.md`, RESEARCH.md pitfall "Vitest picks up Playwright specs".
- **Action:**
  1. `vitest.config.ts`: `import { defineConfig } from 'vitest/config'`, then `export default defineConfig({ test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' } })`. Do not set `exclude`.
  2. Write `tests/unit/rng.test.ts` first, and watch it fail. It covers:
     - identical 100-value sequences from two `createRng(deriveSeed(42, 'npc-traits'))`
     - every value in `[0, 1)`
     - `deriveSeed(42, 'events')` gives a different first-10 sequence
     - `deriveSeed(1, 'a') !== deriveSeed(2, 'a')`
     - `freshSeed()` is an integer with `0 <= n < 2 ** 32`
  3. Implement `src/engine/rng.ts` (CD-05), no imports:
     - Named constants: `FNV_OFFSET_BASIS = 0x811c9dc5`, `FNV_PRIME = 0x01000193`, `MULBERRY_INCREMENT = 0x6d2b79f5`, `UINT32_RANGE = 2 ** 32`.
     - `export type Rng = () => number;`
     - `export function deriveSeed(seed: number, key: string): number`: FNV-1a over the UTF-16 code units of `key`, starting from `FNV_OFFSET_BASIS ^ (seed >>> 0)` and using `Math.imul`. Returns `>>> 0`.
     - `export function createRng(seed: number): Rng`: mulberry32, returning `[0, 1)`.
     - `export function freshSeed(): number`: `crypto.getRandomValues(new Uint32Array(1))[0]`. Add a one-line comment saying this is the only entropy source and it only picks a new run's seed.
     - No `Math.random`.
- **Done when:**
  - `npx vitest run tests/unit/rng.test.ts` exits 0.
  - `grep -c "Math.random" src/engine/rng.ts` = 0.
  - `grep -n "export function deriveSeed\|export function createRng\|export function freshSeed" src/engine/rng.ts` matches 3 lines.
- **Covers:** CD-05, STO-01

### II. The one save/load module (test first)

- **Files:** `tests/unit/save.test.ts`, `src/engine/save.ts`
- **Read first:** CONTEXT CD-02, RESEARCH.md pitfall "Zustand persist writes are unguarded", `research-patterns.md` "Patterns — store and save module", zustand `StateStorage` type (`node_modules/zustand/middleware/persist.d.ts`), `docs/GAME_SPEC.md` "Saving and future backend".
- **Action:**
  1. Write `tests/unit/save.test.ts` first. Use `vi.stubGlobal('localStorage', fake)` with:
     - (a) a `Map`-backed fake: `saveGame('k', 'v')` then `loadGame('k') === 'v'`; `clearSave('k')` then `loadGame('k') === null`.
     - (b) a fake whose `getItem`/`setItem`/`removeItem` all `throw new DOMException('blocked', 'SecurityError')`: none of the three functions throws, and `loadGame` returns `null`.
     - (c) `vi.stubGlobal('localStorage', undefined)`: same as (b).
     - Unstub with `vi.unstubAllGlobals()` in `afterEach`.
  2. Implement `src/engine/save.ts`:
     - `export const SAVE_KEY = 'gold-run:save';`
     - `export function loadGame(name: string): string | null`
     - `export function saveGame(name: string, value: string): void`
     - `export function clearSave(name: string): void`
     - Each function reads `globalThis.localStorage` **inside** its `try` (in browsers, the getter itself can throw) and returns `null` or no-ops in `catch`.
     - `export const saveStorage: StateStorage = { getItem: loadGame, setItem: saveGame, removeItem: clearSave };` with `import type { StateStorage } from 'zustand/middleware'`.
     - A header comment of 1–2 lines: this file is the only place that touches persistence; swapping in a server means editing only this file.
     - No other module may reference `localStorage`.
- **Done when:**
  - `npx vitest run tests/unit/save.test.ts` exits 0.
  - `grep -rn "localStorage" src | grep -v "src/engine/save.ts"` finds nothing.
- **Covers:** CD-02, STO-03 (save-level half)

### III. Versioned state and the persisted vanilla store (test first)

- **Files:** `tests/unit/store.test.ts`, `src/engine/state.ts`, `src/engine/store.ts`
- **Read first:** `src/engine/save.ts`, `src/engine/rng.ts`, CONTEXT CD-01/CD-03/CD-04, `features/engine-state.feature` (STO-02..04), zustand docs `persist.md` and `create-store.md` (in `node_modules/zustand/` or GitHub), RESEARCH.md "Two version fields".
- **Action:**
  1. Write `tests/unit/store.test.ts` first, with a `Map`-backed `localStorage` stub per test:
     - **STO-02:** `createGameStore({ initialSeed: () => 1 })`, then `getState().newRun(1234)`. A second `createGameStore()` over the same stub has `getState().seed === 1234` and `version === 1`. The stub has exactly one key, `'gold-run:save'`, and `JSON.parse` of its value equals `{ state: { version: 1, seed: 1234 }, version: 1 }`. That proves `partialize` excludes actions.
     - **STO-03:** with the throwing stub, `createGameStore()` and `newRun(77)` don't throw, `getState().seed === 77`, and `loadGame(SAVE_KEY)` (i.e. `loadGame('gold-run:save')`) returns `null`.
     - **STO-04:** pre-seed the stub with `'gold-run:save' = '{"state":{"version":0,"seed":5},"version":0}'`. `createGameStore({ initialSeed: () => 7 })` gives state `{ version: 1, seed: 7 }` with no throw.
  2. `src/engine/state.ts`:
     - `export const SAVE_VERSION = 1;`
     - `export interface GameState { version: typeof SAVE_VERSION; seed: number }`
     - `export function createInitialState(seed: number): GameState`
  3. `src/engine/store.ts` (CD-01):
     - imports: `createStore` from `'zustand/vanilla'`; `persist` and `createJSONStorage` from `'zustand/middleware'`
     - types: `export interface GameActions { newRun(seed: number): void }`, `export type GameStore = GameState & GameActions`, `export interface GameStoreOptions { initialSeed?: () => number }`
     - `export function createGameStore(options: GameStoreOptions = {})` builds the store with `persist(…, { name: SAVE_KEY, version: SAVE_VERSION, storage: createJSONStorage(() => saveStorage), partialize: ({ version, seed }) => ({ version, seed }), migrate: () => createInitialState(seed()) })`, where `seed = options.initialSeed ?? freshSeed`
     - comment on `migrate`: Phase 0 policy, any other version starts fresh (CD-03)
     - `newRun(seed)` sets `createInitialState(seed)`
     - `export type GameStoreApi = ReturnType<typeof createGameStore>;`
     - `export const gameStore = createGameStore();`
     - no React, no `zustand` root import
- **Done when:**
  - `npx vitest run tests/unit` exits 0 with `rng`, `save` and `store` test files passing (plus `boundaries` if Plan II has landed).
  - `grep -rn "from 'zustand'" src/engine` finds nothing.
  - `npx eslint src/engine tests/unit/rng.test.ts tests/unit/save.test.ts tests/unit/store.test.ts` exits 0 once `eslint.config.js` exists (Plan II, same wave). If it doesn't exist yet, Plan V's gate re-checks.
  - `npm run typecheck` exits 0.
- **Covers:** CD-01, CD-03, CD-04, STO-02, STO-03, STO-04, GOAL: npm test exits 0

## Nyquist criteria for this plan

- [ ] Same seed+key gives an identical sequence; a different key gives a different one; values are in [0,1); `freshSeed` is uint32 (STO-01)
- [ ] A save written by one store instance is hydrated by the next, through key `gold-run:save` with a `{state:{version,seed},version}` envelope (STO-02)
- [ ] Throwing or missing storage never throws out of `createGameStore` or `newRun` (STO-03)
- [ ] A version-0 save is replaced by a fresh version-1 state (STO-04)
- [ ] `localStorage` is referenced only in `src/engine/save.ts`

## Out of scope

- The React store hook (`useStore(gameStore, …)` in `src/ui`), deferred to Phase 1 per CD-01.
- The full spec `GameState` (beat, world, player, stats, npcs, batch, flags) and the `RoleId`/`ZoneId`/`BeatId`/`Origin` unions. Phase 1 (CD-04).
- Save throttling and keeping per-frame position out of persisted writes. Phase 1.
- Any `src/systems` code, content loaders, `tiles.ts`.
- The test hook and e2e (Plan IV), `eslint.config.js` and `tests/unit/boundaries.test.ts` (Plan II).

## Risks accepted in this plan

- `freshSeed()` uses `crypto.getRandomValues`, a non-seeded source. Accepted: it only picks a new run's seed, and every in-run roll derives from that seed.
- The migrate policy "any other version starts fresh" discards old saves. Acceptable while no v0 save exists in the wild. Phase 1 replaces it with real migrations once the state shape grows.
- Node 24+ may expose its own experimental `localStorage` global. Tests always stub it explicitly, so behaviour doesn't depend on the Node build.
