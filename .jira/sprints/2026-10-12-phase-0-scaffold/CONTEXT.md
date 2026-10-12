---
sprint: 2026-10-12-phase-0-scaffold
created: 2026-10-12
status: planned
---

# Context: 2026-10-12-phase-0-scaffold

User's locked decisions for this sprint. D-01..D-09 were answered by the owner in the planning session. Once written here, decisions are NON-NEGOTIABLE for downstream agents.

## Phase boundary

**Delivers (Phase 0 of `docs/GAME_SPEC.md` section 7):** a repo any agent can run. Phaser's official Vite + React + TypeScript template (Phaser 4) reshaped into the section 6 layout, with the toolchain upgraded, template demo code removed, Zustand store + persist routed through one save module, seeded RNG, ESLint with architecture-boundary rules, Vitest unit tests, Playwright e2e driven through the dev-only `window.__GOLD_RUN__` hook, GitHub Actions CI, Cloudflare Pages per-PR previews, and `docs/ARCHITECTURE.md` + `docs/CONTENT_GUIDE.md`.

**Sprint goal (measurable, used verbatim as `goal:` in every plan):** On the empty Phaser 4 shell, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` all exit 0 locally and in the GitHub Actions CI run for the sprint PR, the production build contains no `__GOLD_RUN__`, and the PR's Cloudflare Pages preview URL opens on a phone (owner-verified).

**Does not deliver:** any game content: no zones, maps, tiles, beats, dialogue, NPCs, character select, dev panel, or player-readable strings. No real wallet, payment or blockchain anything.

## Decisions

- **D-01: Phaser 4.** Use the latest Phaser 4.x, not Phaser 3. This replaces the spec's earlier "Phaser 3" lock, with the owner's approval (the spec has already been updated). Scaffold from `phaserjs/template-react-ts` `main` with a non-interactive route (`degit` or `git clone`), never the interactive `npm create @phaserjs/game` CLI. Phaser 4's `roundPixels` defaults to `false`. Agents must not assume Phaser 3 behaviour.
- **D-02: Deploy target is Cloudflare Pages via its Git integration.** Production deploys from `main`. Every PR gets a public preview URL (`<hash>.<project>.pages.dev`) that opens on a phone. Creating the Cloudflare account/project and connecting the GitHub repo is a **manual owner step**. Agents cannot do it, and plans must say so and document the exact settings.
- **D-03: Overlay styling uses CSS Modules** (`*.module.css`, built into Vite).
- **D-04: Maps are authored as code/JSON 2D arrays.** Arrays hold **named tile constants**, never bare numbers. One `tiles.ts` defines the tile enum and each tile's walkability, and maps reference it. Interactables (e.g. mine site, NPC positions, assay office) live in the same map module that exports the grid, as named coordinates. Scene files must not hold a second source of truth. **Phase 0 has no maps or content.** This sprint only records the convention in the docs, for Phase 1. Do not invent tile types or game content.
- **D-05: Top-down (orthogonal) perspective is confirmed.**
- **D-06: Test hook gate.** The gate is `import.meta.env.DEV || import.meta.env.VITE_GOLD_RUN_DEV === 'true'`.
  - The dev server always has the hook.
  - The Cloudflare Pages *Preview* environment sets `VITE_GOLD_RUN_DEV=true`, so previews carry the hook and, later, the dev panel. Production never sets the flag.
  - The hook is loaded with a dynamic `import()` inside the gate.
  - CI builds without the flag and fails if `__GOLD_RUN__` appears anywhere in `dist/`.
  - E2E runs against the Vite dev server.
  - Public previews exposing the hook are accepted, because this is a sandboxed prototype. Previews count as "dev/test builds" under spec line 173.
- **D-07: Upgrade the toolchain in Phase 0.**
  - Versions: Vite 8, TypeScript `~6.0` (below typescript-eslint's `<6.1` peer cap), `@vitejs/plugin-react` 6, `eslint-plugin-react-hooks` 7.
  - Rewrite the template's `manualChunks` object form so it works under Vite 8.
- **D-08: Linter is ESLint 10 with flat config (not oxlint).**
  - Folder-scoped `no-restricted-imports` for `src/engine/**` and `src/systems/**` bans `phaser`, `react`, `react-dom`, the `zustand` root entry, and the `game/` and `ui/` directories.
  - `no-restricted-properties` bans `Math.random`.
- **D-09: Delete template code and assets that violate repo rules:**
  - demo code (direct scene calls from React, `Math.random`)
  - branded text and assets
  - hardcoded on-screen strings
  - `log.js` telemetry

## Claude's discretion

Areas the owner delegated. Plans cite these as `CD-XX`.

- **CD-01 Store placement.** Create the store with `createStore` from `zustand/vanilla` plus `persist` from `zustand/middleware` in `src/engine/store.ts`. Neither entry imports React. React components will read it with `useStore(gameStore, selector)` (plus `useShallow` for object selectors) from a hook in `src/ui/`. That hook is added together with its first consumer in Phase 1. Phase 0 has no React component that reads game state.
- **CD-02 Save module.** `src/engine/save.ts` is the one save/load module. It exports:
  - `SAVE_KEY`
  - `loadGame(name)`, `saveGame(name, value)`, `clearSave(name)`. Every `localStorage` access is wrapped in try/catch. A failed read returns `null`; a failed write or remove is a no-op.
  - `saveStorage: StateStorage`, built from those three functions.

  The store passes `storage: createJSONStorage(() => saveStorage)` to `persist`. Swapping in a server later means editing `save.ts` only. Because the storage object always exists, persist never falls into its warn-on-every-set path.
- **CD-03 Version source of truth.** `SAVE_VERSION = 1` lives in `src/engine/state.ts`. `GameState.version` is typed `typeof SAVE_VERSION`. persist's `version` option reads the same constant. `migrate` is always supplied, so a save is never dropped silently. Phase 0 policy: any persisted version other than `SAVE_VERSION` is replaced with a fresh initial state.
- **CD-04 Phase 0 state shape.** `GameState` is `{ version: typeof SAVE_VERSION; seed: number }`, and the only action is `newRun(seed: number)`. The spec's full state model (beat, world, player, stats, npcs, batch, flags) and its unions arrive in Phase 1 alongside their first consumers. `partialize` persists only the data fields, never actions.
- **CD-05 RNG.** Use a small in-repo PRNG in `src/engine/rng.ts`: mulberry32, with FNV-1a 32-bit keyed derivation.
  - Exports: `deriveSeed(seed, key)`, `createRng(seed)`, which returns a `() => number` in `[0, 1)`, and `freshSeed()`.
  - Each roll stream is derived from `(seed, stable key)`, so no cursor is persisted and reloads stay reproducible.
  - `freshSeed()` uses `crypto.getRandomValues`. It is the only entropy source and is used only to pick a new run's seed.
  - Algorithm constants are named.
  - No `pure-rand`; its API was LOW confidence in the research.
- **CD-06 Test hook surface.** `window.__GOLD_RUN__` is `{ hookVersion: 1, isReady(): boolean, getState(): { version: number; seed: number }, newRun(seed: number): void }`.
  - Every return value is plain JSON.
  - Install is idempotent, so the StrictMode double mount is safe.
  - `isReady()` turns true when the bus emits the scene-ready event. The listener is registered with a named handler reference.
  - The hook is installed **before** the React root renders: `src/main.tsx` awaits the gated dynamic import, then renders. That way the ready event can't be missed.
- **CD-07 Static gate replacement.** A committed root `.env` sets `VITE_GOLD_RUN_DEV=false`, so Vite always replaces the key statically and the dead branch, along with its chunk, is dropped. Real environment variables (the Cloudflare Preview env) override `.env`. The CI `dist/` grep is the safety net.
- **CD-08 Portrait canvas.**
  - The Phaser config uses `scale.mode = Phaser.Scale.RESIZE` and `autoCenter = Phaser.Scale.CENTER_BOTH`, inside a container of `100vw × 100dvh`. The template's fixed 1024×768 is removed.
  - The background colour is a named constant.
  - `roundPixels` and `pixelArt` are **not** set in Phase 0. They depend on the art-style `[OPEN]` and are set in Phase 1 when the first tileset lands.
- **CD-09 Playwright.**
  - Projects: Chromium only. `mobile` uses `devices['Pixel 7']`; `desktop` uses `devices['Desktop Chrome']`.
  - `testDir: 'tests/e2e'`. `webServer` runs `npm run dev` with `url: 'http://localhost:8080'` and `reuseExistingServer: !process.env.CI`. `use.baseURL` is the same URL.
  - `workers: process.env.CI ? 1 : undefined`.
  - Browser binaries are not cached in CI (per Playwright guidance).
  - WebKit/iPhone projects are deferred. Real-phone behaviour is covered by the owner-verified preview check.
- **CD-10 Boundary enforcement is lint-only**, plus Vitest's `node` environment as an incidental tripwire. There is no separate engine tsconfig, to stay under the simplicity ceiling. A unit test (`tests/unit/boundaries.test.ts`) asserts the lint rules fire, so they can't silently rot.
- **CD-11 Typed bus events.** `src/game/EventBus.ts` keeps the template emitter and adds `export const GameEvent = { SceneReady: 'current-scene-ready' } as const` and its value-union type. Call sites use `GameEvent.SceneReady`, never the bare string. Every `removeListener`/`off` passes the handler reference.
- **CD-12 Layout.**
  - `src/main.tsx` stays the entry point. The template's `App.tsx` and `PhaserGame.tsx` move to `src/ui/`.
  - One scene, `src/game/scenes/Boot.ts`, emits `GameEvent.SceneReady` and draws nothing.
  - Global reset CSS moves from `public/style.css` to `src/ui/global.css`, imported by `src/main.tsx`. Component styles use `App.module.css` (D-03).
  - Empty spec directories (`src/systems`, `src/content`, `src/minigames`) are kept with `.gitkeep`.
  - `public/assets/CREDITS.md` is created with an empty credits table.
- **CD-13 Docs.**
  - `docs/ARCHITECTURE.md` describes the layers, bus, store, save module, RNG, test-hook gate, and the D-04 map convention.
  - `docs/CONTENT_GUIDE.md` covers content-as-JSON locations and the D-04 map-authoring convention. It **points to** `CLAUDE.md` "Content rules" for voice and banned words rather than copying the list (one source of truth).
- **CD-14 Naming.** The package name is `gold-run` and `<title>` is `Gold Run`. No title text is drawn on screen.
- **CD-15 Node.** `.nvmrc` = `24` (Cloudflare Pages and `actions/setup-node` both read it). `package.json` sets `"engines": { "node": ">=22.12" }` (Vitest 5 floor).
- **CD-16 Template pin.** Resolve the `main` SHA with `git ls-remote` at scaffold time and degit that exact SHA. Record the SHA in `EXECUTION.md` and in the README credits, which also carry the template's MIT copyright notice.
- **CD-17 Scripts.**
  - `dev`: `vite --config vite/config.dev.mjs`
  - `build`: `vite build --config vite/config.prod.mjs`
  - `typecheck`: `tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.node.json`
  - `lint`: `eslint .`
  - `test`: `vitest run`
  - `e2e`: `playwright test`

  `package.json` and `package-lock.json` are owned by Plan I only; every dependency is installed there.
- **CD-18 TS configs.**
  - `tsconfig.json` covers `src` with `types: ["vite/client"]`.
  - `tsconfig.node.json` covers `tests/**`, `vitest.config.ts` and `playwright.config.ts` with `types: ["node"]`.

  Both are strict.

## Deferred ideas

Plans MUST NOT implement these.

- Share/replay codes (spec `[OPEN]`) → future; not adopted
- Setting names (town, region, river, currency) → owner, later
- Audio → not discussed; future
- Final art style; `roundPixels` / `pixelArt` config → Phase 1, with the first tileset
- `tiles.ts` tile enum, map modules, interactable coordinates (D-04 convention) → Phase 1
- Typed runtime-validating loader for `src/content` JSON → Phase 1, with the first content file
- Full `GameState` model and `RoleId`/`ZoneId`/`BeatId`/`Origin` unions → Phase 1
- React store hook (`src/ui/useGameStore.ts`) → Phase 1, with its first consumer
- Save throttling / keeping per-frame `world.x/y` out of persisted writes → Phase 1, when movement exists
- Dev panel → Phase 1 (milestone 1)
- WebKit / iPhone Playwright projects → future, if CI budget allows
- Migrating Cloudflare Pages to Workers Static Assets → future; only if Pages becomes a problem
- `motion` (Framer Motion) and `html-to-image` → Phase 5
- Separate engine tsconfig (`types: []`, no DOM lib) → only if lint proves insufficient

## Canonical references

- `docs/GAME_SPEC.md` sections 5–7: technical decisions, repo layout, Phase 0 row and gate
- `CLAUDE.md`: standing rules, architecture rules, definition of done, autonomy, content rules
- `.jira/sprints/2026-10-12-phase-0-scaffold/RESEARCH.md`: synthesis; pitfalls (StrictMode, `removeListener`, persist writes, DEV gate, Vitest globs, Vite 8 `manualChunks`)
- `.jira/sprints/2026-10-12-phase-0-scaffold/research-patterns.md`: template and zustand source citations
- `.jira/sprints/2026-10-12-phase-0-scaffold/research-external.md`: versions, Playwright CI, Cloudflare Pages
- https://github.com/phaserjs/template-react-ts (`main`): starting point
- https://developers.cloudflare.com/pages/configuration/preview-deployments/: preview behaviour
- https://vite.dev/guide/env-and-mode: env replacement and DEV semantics
- Phaser 4 skills shipped in `node_modules/phaser/skills/`: prefer these over recalled Phaser 3 APIs
