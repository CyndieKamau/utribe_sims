# Architecture

How the code is split today, and the rules new code must follow. The design itself lives in
`docs/GAME_SPEC.md`; the standing rules for contributors live in `CLAUDE.md`.

## Layers

| Folder | Role | May import |
| --- | --- | --- |
| `src/engine` | Store, seeded RNG, game state, save/load. Pure TypeScript. | `zustand/vanilla`, `zustand/middleware`, other engine and systems modules |
| `src/systems` | Game rules derived from state (custody log, assay, events). Pure TypeScript. | Engine and other systems modules |
| `src/content` | JSON content: dialogue, events, NPCs, interactables, maps, region pack. | Nothing; it is data |
| `src/game` | Phaser: boot, scenes, camera, the event bus. | Phaser, engine, systems, content |
| `src/ui` | React overlays and the component that hosts the Phaser game. | React, engine, systems, content, `src/game` |
| `src/minigames` | Small self-contained games (panning first). | Same rules as `src/game` or `src/ui`, depending on which side draws them |
| `src/dev` | Development tooling: the test hook, later the dev panel. | Anything |

Engine and systems code must run without a browser, a canvas or a component tree, so it can be
unit-tested on its own. ESLint enforces this: inside `src/engine` and `src/systems`, importing
`phaser`, `react`, `react-dom`, the root `zustand` entry (which pulls in React), or anything from
`game/`, `ui/` or `dev/` is an error. `tests/unit/boundaries.test.ts` checks that the rule still
fires, so it can't quietly stop working.

The two display layers have narrow jobs:

- **Phaser displays and reports.** Scenes read state from the store and emit interaction events
  such as "player reached the dig spot". They never decide outcomes, roll dice or change game state.
- **React renders and dispatches.** Components show state and call store actions. They hold no
  game rules.

React overlays are styled with CSS Modules (`*.module.css`), which Vite supports without extra
setup. Global resets live in `src/ui/global.css`.

The world is drawn top-down on an orthogonal grid.

## Event bus

`src/game/EventBus.ts` is the one channel between Phaser and React. It is the Phaser template's
event emitter, plus a `GameEvent` object that names every event:

```ts
export const GameEvent = {
    SceneReady: 'current-scene-ready',
} as const;
```

Call sites use `GameEvent.SceneReady`, never the bare string, and new events are added to that
object. Scenes and components never call each other directly; they talk through the bus and the
shared store.

Every `off` or `removeListener` call passes the handler it is removing. Calling `off(event)` without
a handler removes every listener for that event, including ones registered by other parts of the
app. React StrictMode mounts effects twice in development, which makes that mistake easy to hit.

## Store and saving

Game state lives in one Zustand store, created in `src/engine/store.ts` with `createStore` from
`zustand/vanilla` and wrapped in `persist`. Neither entry imports React, so the store stays inside
the engine boundary.

`src/engine/save.ts` is the only file that touches storage. It exports `loadGame`, `saveGame`,
`clearSave` and a `saveStorage` object built from them, which the store hands to `persist`. Every
storage access is wrapped in `try`/`catch`: a failed read returns nothing and a failed write is
ignored, so the game keeps running in private browsing or with storage blocked. Keeping storage in
one file means that moving saves to a server later is a change to that file and nothing else.

`SAVE_VERSION` in `src/engine/state.ts` is the single source of the save format version. The
`version` field of `GameState` is typed from it, and `persist` reads the same constant. A `migrate`
function is always supplied, so an old save is never dropped silently. The current policy: a save
from any other version is replaced with a fresh run. Once real players have saves worth keeping,
`migrate` should upgrade them instead.

Only data fields are persisted, never actions. Game state is plain, versioned JSON so it can be sent
to a server unchanged later.

React components will read the store through `useStore(gameStore, selector)` from
`zustand/react`, using `useShallow` (from `zustand/react/shallow`) when a selector returns an
object. That hook lives in `src/ui` and is added together with the first component that needs it.

## Seeded RNG

`src/engine/rng.ts` provides a small seeded generator (mulberry32) so a run can be replayed from its
seed.

Randomness is derived by key, not by position. `deriveSeed(seed, key)` hashes the run seed with a
stable key, such as the name of an event, and `createRng(derivedSeed)` returns a generator for that
stream. Because each stream is rebuilt from `(seed, key)`, no generator position has to be saved,
and reloading a game replays the same rolls.

`freshSeed()` is the only source of real entropy (`crypto.getRandomValues`), and it is used only to
pick a new run's seed. `Math.random` is banned everywhere by ESLint.

## Test hook

The world is a canvas, so end-to-end tests don't click pixels. They drive the game through
`window.__GOLD_RUN__`, defined in `src/dev/testHook.ts`. `src/main.tsx` loads it only when this
expression is true:

```ts
import.meta.env.DEV || import.meta.env.VITE_GOLD_RUN_DEV === 'true'
```

The hook is loaded with a dynamic `import()` and installed before React renders, so the scene-ready
event can't be missed.

- The dev server always has the hook.
- Pull request previews set `VITE_GOLD_RUN_DEV=true`, so they carry the hook too. This is accepted:
  the build is a sandboxed prototype with nothing to protect.
- Production never sets the flag. A committed `.env` sets it to `false` so Vite replaces it at build
  time and drops the hook's code entirely. CI builds without the flag and fails if `__GOLD_RUN__`
  appears anywhere in `dist`.

The hook currently exposes:

| Member | Returns |
| --- | --- |
| `hookVersion` | `1` |
| `isReady()` | `true` once the first scene has reported it is ready |
| `getState()` | `{ version, seed }` as plain JSON |
| `newRun(seed)` | starts a new run with that seed |

It grows as features need it: teleporting the player, triggering interactions, jumping to a beat.
Every return value stays plain JSON. Tests must never depend on canvas coordinates; if a test needs
to do something, add it to the hook.

## Tooling

- Phaser 4, Vite 8, React 19, TypeScript 6.0, ESLint 10 (flat config), Vitest for unit tests and
  Playwright for end-to-end tests (Chromium on a Pixel 7 profile and desktop).
- Phaser 4 rewrote the renderer, and `roundPixels` now defaults to `false`. Neither `roundPixels`
  nor `pixelArt` is set yet; set both deliberately when the first tileset arrives, since they
  depend on the art style.
- Phaser 4 ships skill notes in `node_modules/phaser/skills`. Prefer them over remembered Phaser 3
  APIs, which have changed in places.
