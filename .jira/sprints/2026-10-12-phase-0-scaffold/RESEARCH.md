# Research: 2026-10-12-phase-0-scaffold

**Date**: 2026-10-12
**Domain**: frontend/game-scaffold (Vite + React + TypeScript + Phaser, test and deploy tooling)
**Confidence**: MEDIUM
**Valid until**: 2026-10-19 (fast-moving toolchain; see Metadata)

## Summary

The repo has no code yet. Its only tracked files are `CLAUDE.md`, a 2-line `README.md`, `LICENSE`, `docs/GAME_SPEC.md` and `.jira/` (`git ls-files`). Every file Phase 0 needs is new. Spec section 6 (`docs/GAME_SPEC.md:275-308`) fixes the target tree. The Phase 0 row (`:356`) lists everything the scaffold must deliver: template, TypeScript, Zustand, Vitest, Playwright, lint, docs, a test hook stub and an auto-deploy preview. Its gate is `npm test` plus `npm run e2e` green, and a preview link that opens on a phone. The standing rules apply from the first commit:
- pure-TS engine
- Phaser displays and reports only
- React renders and dispatches only
- one bus and one store
- seeded RNG only
- one save/load module (`CLAUDE.md:26-37`)

**The main finding is a conflict with a locked decision.** Phaser's official `phaserjs/template-react-ts` has shipped **Phaser 4.0.0** on `main` since 2026-04-10. The spec locks **Phaser 3** (`docs/GAME_SPEC.md:157`). The last Phaser 3 state of the template is commit `9759ec1` (2025-05-23, `"phaser": "^3.90.0"`). The v4 bump (`e15eaec`) changed only `package.json`, so the bridge code (`PhaserGame.tsx`, `EventBus.ts`, scenes) is the same either way. Both `npm create @phaserjs/game` and a plain clone fetch `main`. Phaser 3.90.0 (2025-05-23) is the last 3.x release, and Phaser's own blog says "there's no reason to start on Phaser 3". Per `CLAUDE.md:20`, changing a locked decision means stopping to ask the owner.

The template is a starting point, not a finished scaffold. Several of its defaults break the standing rules and have to be deleted:
- demo `App.tsx` calls scene methods directly and uses `Math.random()`
- branded text and Phaser-logo assets appear on screen
- `log.js` sends telemetry on every `dev`/`build`
- a dead `.eslintrc.cjs`, and no `lint` or `test` script
- a fixed 1024×768 landscape canvas with no `scale` setting
- tooling about two major versions behind (Vite 6, TS 5.7, ESLint 9)

Zustand 5's `persist` has the right extension points (`version`, `migrate`, a custom `StateStorage`), but it does not catch errors when writing. A `DEV`-gated test hook does not exist in any production build, previews included. Vitest's default file pattern also picks up Playwright's spec files.

**Primary recommendation:** before writing plans, get the owner to rule on Phaser 3 vs 4 and on the four blocking items. The scaffold should come from the template at a specific commit, not from the interactive CLI. Delete the demo code before turning on the lint rules. Route all persistence through one custom `StateStorage` module with try/catch. Gate the test hook so that e2e and the preview get exactly what the gate requires.

## Architectural Responsibility Map

Seeded from research-codebase.md; tiers follow the spec's split.

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| `GameState` shape and unions | Browser/Client: pure TS (`src/engine`) | — | `docs/GAME_SPEC.md:201-247, 298`; no framework imports (`CLAUDE.md:26`) |
| Store (Zustand, vanilla `createStore` + `persist`) | Browser/Client: `src/engine` | React binding via `useStore(store, sel)` in `src/ui` | `zustand` root imports React (`Z:src/react.ts:1`); `zustand/vanilla` and `zustand/middleware` don't. Placement is an open question |
| Persistence (`saveGame`/`loadGame`) | Database/Storage: localStorage via one module | `src/engine` | `:178-181`; `CLAUDE.md:36-37`. Swapping in a server should mean editing one file |
| Seeded RNG | Browser/Client: pure TS (`src/engine`) | — | `:170`; `CLAUDE.md:35` |
| Phaser↔React event bus | Browser/Client: `src/game` (template EventBus) | — | `:167, 301`. It imports `phaser`, so engine must not import it |
| World render, scenes, input | Browser/Client: Phaser canvas (`src/game`) | — | `:158, 301` |
| Overlays | Browser/Client: React DOM (`src/ui`) | — | `:159, 302`; styling is [OPEN] |
| Test hook `window.__GOLD_RUN__` | Browser/Client: `src/dev`, dev/test only | — | `:173, 304`; the gate mechanism is an open question |
| Unit tests | Node (Vitest) in `tests/unit` | — | `:306` |
| E2E tests | Headless browser (Playwright) in `tests/e2e` | — | `:307`; `CLAUDE.md:67-69` |
| Static assets + `CREDITS.md` | CDN/Static: `public/assets` | — | `:296, 189`; `CLAUDE.md:86` |
| CI | Infra: GitHub Actions in `.github/` | — | Not in the section 6 tree; justified by the brief (`CLAUDE.md:50`) |
| Preview deploy | Infra/CDN; target [OPEN] | — | `:195, 356` |
| Backend / database | None (excluded) | — | `:152, 409` |

## Codebase

- **Existing:** `CLAUDE.md` (87 lines, standing rules), `docs/GAME_SPEC.md` (436 lines, source of truth), `README.md:1-2`, `LICENSE` (MIT), `.jira/`. There is no root `.gitignore`; only `.jira/.gitignore:5-10` exists, scoped to `.jira/`. So `node_modules/`, `dist/`, `test-results/` and `playwright-report/` are currently not ignored.
- **Would change / create:**
  - `package.json`, `src/{engine,systems,content,game,ui,minigames,dev}`, `tests/{unit,e2e}`, `public/assets/` (+ `CREDITS.md` if any asset is kept), `.github/workflows/`, root `.gitignore`
  - `docs/ARCHITECTURE.md` and `docs/CONTENT_GUIDE.md` (`:293-294`; the Phase 0 row says "docs")
  - `README.md` (candidate: run instructions)
- **Reference-only:** `docs/GAME_SPEC.md`, `CLAUDE.md`, `BRIEF.md`.

What Phase 0 fills vs only creates (`docs/GAME_SPEC.md:295-307`):

| Directory | Phase 0 content |
|---|---|
| `src/engine/` | Store skeleton, seeded RNG, `saveGame`/`loadGame`. Beats and effects come later |
| `src/game/` | The template's Phaser side and EventBus (`:167`, "the template's EventBus") |
| `src/ui/` | The template's React side, as an empty overlay shell |
| `src/dev/` | Test hook stub. The dev panel is milestone 1 (`:399`) |
| `src/systems/`, `src/content/`, `src/minigames/` | Directories only (Phase 1, 2 and 5) |
| `tests/unit/`, `tests/e2e/` | At least one passing test each; the e2e test goes through `window.__GOLD_RUN__` |

Required scripts: `npm run dev`, `npm test`, `npm run e2e` (`:385`; `CLAUDE.md:64`). "Lint" is required by `:356`, but no script name is fixed.

**Spec tensions that affect layout. The planner must resolve these; they are not settled here:**
1. **Store vs purity.** `src/engine` holds the "store" and must be "pure TS" (`:298`), but engine must not import React (`CLAUDE.md:26-27`). The patterns research shows `zustand/vanilla` + `zustand/middleware` satisfy this. The React hook would then live outside engine.
2. **Persist vs a single save module.** Zustand persist (`:168, 178`) vs "all save/load through `saveGame`/`loadGame`" (`:180, 386`). The custom `StateStorage` seam (`Z:src/middleware/persist.ts:7-11`) can be that module.
3. **Two version fields.** `GameState.version: 1` (`:209`) and persist's envelope `{ state, version }` (`Z:persist.ts:13-16`).
4. **Previews vs deploys.** `:195` says "auto-deploy on merge" while the Phase 0 row (`:356`) says "preview". Is it per-PR previews, deploy from main, or both?
5. **Tests live at the top level** in `tests/` (`:305-307`), not next to the code. Both tools' file patterns must match.

## Patterns & conventions

There is no repo code to imitate, so the reference patterns come from the template (`phaserjs/template-react-ts@c726597`, cited `T:`) and from zustand 5.0.15 source (cited `Z:`).

- **To imitate:**
  - **Mount-once bridge.** `T:src/PhaserGame.tsx:20-48` creates the game in `useLayoutEffect` behind `game.current === null` and calls `game.destroy(true)` on cleanup. Keep it; the brief forbids hand-rolling this.
  - **Scene-ready handshake.** Scenes emit `'current-scene-ready'` from `create()` (`T:src/game/scenes/Game.ts:29`), and `PhaserGame` updates the ref (`T:src/PhaserGame.tsx:50-74`).
  - **Boot seam.** `StartGame(parent)` (`T:src/game/main.ts:25-29`) is a clean entry point for boot code.
  - **Module-level `EventBus`** (`T:src/game/EventBus.ts:1-4`), which the spec names explicitly. It has no types; adding a typed event map would satisfy "types over strings" (`CLAUDE.md:48`).
  - **Vanilla store.** `createStore` from `zustand/vanilla` + `persist` + a custom `StateStorage`, read in React through `useStore(store, selector)`. Use `useShallow` for object selectors (`Z:docs/reference/hooks/use-shallow.md:269-271`).
  - **Boundary enforcement.** ESLint `no-restricted-imports`, scoped to `src/engine/**` and `src/systems/**`, banning `phaser`, `react`, `react-dom`, `zustand` (root), `../game/**` and `../ui/**`. Add `no-restricted-properties` for `Math.random`. Optionally, a separate engine tsconfig with `types: []` and no DOM lib to catch the global `Phaser` namespace, which lint can't see.
  - **Test hook loading.** Put a dynamic `import('./dev/testHook')` inside a statically replaced env branch, so production never emits the chunk. A CI step can then grep `dist/` for `__GOLD_RUN__`.
  - **Driving the hook from Playwright.** Use `page.evaluate` and have the hook return plain JSON snapshots. Use `page.addInitScript` to seed or clear storage, or to stub `Storage.prototype.setItem` so it throws. That covers the blocked-storage case (`:179`).
- **To deliberately not imitate (template code):**
  - Direct component-to-scene calls: `scene.changeScene()` and `scene.moveLogo()` (`T:src/App.tsx:18-22, 32-42`). They violate `CLAUDE.md:31`.
  - React adding sprites and tweens to the scene (`T:src/App.tsx:53-71`). It violates `CLAUDE.md:28`.
  - `Math.random()` at `T:src/App.tsx:67`. Delete it **before** turning on the lint rule.
  - The global `Phaser.Math.Between` with no import (`T:src/App.tsx:56`). Phaser 3 sets `global.Phaser`, and import-based lint rules don't see it.
  - Hardcoded on-screen strings, including "support@phaser.io" (`T:src/game/scenes/Game.ts:23`, `MainMenu.ts:23`). They violate `CLAUDE.md:41`.
  - Phaser-branded `public/assets/{bg,logo,star}.png`. They aren't CC0, and brands aren't allowed (`CLAUDE.md:73-79, 86`).
  - A fixed 1024×768 canvas with no `scale` (`T:src/game/main.ts:10-23`). It fights "portrait mobile first" (`:151`).
  - The `log.js` telemetry (`T:log.js:10-15`), the legacy `.eslintrc.cjs`, and the `manualChunks` object form (`T:vite/config.prod.mjs`).

## Standard Stack

Versions from the npm registry on 2026-10-12 (research-external.md).

### Core

| Library | Version | Purpose | Why Standard |
|---|---|---|---|
| phaser | 3.90.0 (spec-locked) / 4.2.1 (latest) | Game canvas, tilemaps, scenes | Spec-locked engine. **Major version is the owner's call** |
| react / react-dom | 19.3.0 (template `^19.0.0`) | Overlays | Spec-locked |
| vite | 8.3.4 (template `^6.3.1`) | Dev server and build | Template base. Upgrading has traps (see Pitfalls) |
| typescript | 6.0.3 / 5.9.3 (template `~5.7.2`) | Types | `latest` is 7.0.2, but typescript-eslint peers `<6.1.0` |
| zustand | 5.0.15 | Store + `persist` | Spec-locked (`:168`) |
| vitest | 5.0.4 | Unit tests | Needs Node ≥22.12 and Vite ≥6.4; no ancestor config lookup |
| @playwright/test | 1.64.0 | E2E | `webServer`, `devices[]`; adds `--enable-unsafe-swiftshader` to Chromium |
| eslint + typescript-eslint | 10.12.0 + 8.71.2 | Lint | Flat config. The global CLAUDE.md verification step runs `npx eslint` |

### Supporting

| Library | Version | Purpose | When to Use |
|---|---|---|---|
| eslint-plugin-react-hooks | 7.1.1 | Hooks and React Compiler rules | With ESLint (`configs.flat.recommended`) |
| eslint-plugin-react-refresh | 0.5.7 | HMR-safe exports | With ESLint |
| @vitejs/plugin-react | 6.1.2 (template ^4.3.4) | React in Vite | v6 requires Vite 8 |
| pure-rand | (unverified) | Seeded PRNG | If an RNG library is wanted. LOW confidence; confirm the API before using |
| jsdom / happy-dom | 30.1.2 / 21.0.1 | DOM in unit tests | Only if unit tests touch the DOM; engine tests use `node` |
| motion | 14.1.0 | Overlay animation | Not Phase 0. "Framer Motion" is now `motion` (`motion/react`) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|---|---|---|
| ESLint flat config | oxlint 1.87.0 | The create-vite default since 2026-06-15 (vitejs/vite#22638), and faster. But the global CLAUDE.md verification runs `npx eslint`, and folder-scoped `no-restricted-imports` parity is unverified |
| Template toolchain as shipped | Upgrade to Vite 8 / TS 6 / ESLint 10 in Phase 0 | Upgrading avoids starting on EOL ESLint 9 (EOL 2026-08-06). It requires rewriting `manualChunks` and moving off terser |
| `npm create @phaserjs/game` | `degit`/clone at a pinned commit | The CLI is interactive and always fetches `main`. degit is non-interactive and pinnable |
| `eslint` `no-restricted-imports` | `eslint-plugin-boundaries` / `import/no-restricted-paths` | Not evaluated |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Phaser/React mount and lifecycle | A custom canvas mount | Template `PhaserGame.tsx` + `game/main.ts` | Brief constraint. Already handles the StrictMode guard and destroy |
| Phaser↔React pub/sub | A new emitter | Template `EventBus` (eventemitter3) | Spec names it (`:167`) |
| Persist, versioning, migration | `subscribe` → `localStorage` code | `persist` + `version`/`migrate` + custom `StateStorage` | Hydration, envelope and migrate hooks already exist (`Z:persist.ts:183-232`) |
| E2E server lifecycle | Start/wait shell scripts | Playwright `webServer` + `use.baseURL` | Readiness, reuse, teardown |
| Mobile viewport and touch | Manual viewport hacks | Playwright `devices['Pixel 7']` etc. | Correct `isMobile`, `hasTouch`, DPR |
| PR preview links and comments | A custom deploy-comment bot | Provider Git integration or `rossjrw/pr-preview-action` v1.8.1 | Depends on the [OPEN] target |
| Tiled parsing (if Tiled is chosen) | A custom parser | `load.tilemapTiledJSON` | Built in, with known limits (see Pitfalls) |

**Key insight:** the template supplies the integration. The work is deleting what breaks the rules and adding guards (lint, a storage wrapper, test separation) around what it doesn't cover.

## Common Pitfalls

### Scaffolding with today's template installs Phaser 4

- **What goes wrong:** `npm create @phaserjs/game@latest` or a clone of `main` yields `phaser@4.0.0`, against the locked Phaser 3 (`:157`).
- **Why it happens:** the template moved to v4 on 2026-04-10 (`e15eaec`). The CLI 302-redirects to `main.zip`.
- **How to avoid:** get the owner's decision first. For v3, use `degit phaserjs/template-react-ts#9759ec1` or pin `"phaser": "3.90.0"`. (The patterns research cited `2624f84`, the commit just before the merge `9759ec1`; both have `^3.90.0`. `9759ec1` is the last Phaser 3 state on `main`, verified via the GitHub API.)
- **Warning signs:** `npm ls phaser` shows 4.x; `roundPixels` behaves differently.

### StrictMode double mount: two games and leaked listeners

- **What goes wrong:** in dev, setup→cleanup→setup briefly runs two `Phaser.Game` instances and two canvases. Scene `EventBus.on` listeners from the first instance survive. Test hook install code runs twice.
- **Why it happens:** React runs effects twice in dev. `Game.destroy()` only takes effect on the next frame (`phaser@3.90.0 src/core/Game.js:716,732-738`). `EventBus` is module-level and outlives the game.
- **How to avoid:** scenes remove their listeners on shutdown, and the hook install is idempotent and always reads the current game.
- **Warning signs:** duplicate event handling, or two `<canvas>` elements in dev only.

### `removeListener(event)` with no handler wipes every listener

- **What goes wrong:** the template's cleanup `EventBus.removeListener('current-scene-ready')` (`T:src/PhaserGame.tsx:72`) silently removes any other subscriber, such as a test hook readiness listener.
- **Why it happens:** eventemitter3 calls `clearEvent` when `fn` is absent (`eventemitter3@5 index.js:258-260`).
- **How to avoid:** always pass the handler reference.
- **Warning signs:** the hook never sees "ready" after an HMR reload or remount.

### Zustand `persist` writes are unguarded

- **What goes wrong:** a `QuotaExceededError` or `SecurityError` throws out of the store's `set()`. When storage is unavailable, persist warns on every `set`. Bumping the version without a `migrate` silently drops the save.
- **Why it happens:** `createJSONStorage` only wraps `getStorage()` (`Z:persist.ts:36-41`). `setItem` is called directly (`:56-57, 221-234`). A version mismatch with no `migrate` logs `console.error` and discards the state (`:288`).
- **How to avoid:** use one custom `StateStorage` with try/catch on every method, and always supply `migrate`. Test with `setItem` stubbed to throw (`page.addInitScript`).
- **Warning signs:** uncaught exceptions in private browsing, or saves vanishing after a version bump.

### Every `set()` is a full synchronous localStorage write

- **What goes wrong:** writing `world.x/y` (`:212`) to the store on every frame while the player walks means a `JSON.stringify` and `setItem` per frame.
- **Why it happens:** persist writes the partialized full state on every set (`Z:persist.ts:221-234`).
- **How to avoid:** use `partialize`, throttle saves, or keep per-frame position out of the persisted slice. This is a Phase 1 concern, but the save module's shape decides it.
- **Warning signs:** frame drops while walking on low-end phones.

### A `DEV`-gated test hook does not exist in any build

- **What goes wrong:** `window.__GOLD_RUN__` is missing from previews and from `vite build --mode test` output. Even `--mode development` keeps `DEV` false.
- **Why it happens:** `import.meta.env.DEV` is statically false whenever `NODE_ENV=production` (vite.dev env-and-mode).
- **How to avoid:** either e2e runs against `vite dev`, or the gate is `MODE` or a custom `VITE_*` flag. Either way, CI checks the production `dist/` has no `__GOLD_RUN__`.
- **Warning signs:** e2e passes locally and fails against a build, or the hook turns up in the prod bundle.

### Vitest picks up Playwright specs

- **What goes wrong:** `npm test` tries to run `tests/e2e/*.spec.ts` and fails.
- **Why it happens:** the default patterns overlap (`**/*.{test,spec}.?(c|m)[jt]s?(x)`). There is no root `vite.config`, so Vitest needs its own config. Vitest 5 doesn't look in parent directories for one. Setting `exclude` replaces the default list.
- **How to avoid:** a `vitest.config.ts` with `include: ['tests/unit/**']`, plus Playwright `testDir: 'tests/e2e'`. If you set `exclude`, spread `configDefaults.exclude` into it.
- **Warning signs:** an `@playwright/test` import error inside a Vitest run.

### Template lint and build configs break silently on upgrade

- **What goes wrong:**
  - ESLint 9/10 ignores `.eslintrc.cjs`.
  - Vite 8 rejects the object form of `manualChunks`, and renames `rollupOptions` to `rolldownOptions`.
  - Bare `npm i -D typescript` pulls TS 7, which typescript-eslint doesn't support.
  - Adding `"type": "module"` breaks the CJS `log.js`.
- **Why it happens:** the template is two major versions behind its tools.
- **How to avoid:** write a fresh flat `eslint.config.js`, pin TS (`~6.0` or `~5.9`), and delete or rename `log.js` before switching to ESM.
- **Warning signs:** `eslint .` reports nothing on obviously bad code, or the Vite build errors on `manualChunks`.

### Type-checking misses tests; JSON types widen

- **What goes wrong:**
  - `tsc --noEmit` skips `tests/`, because the template only includes `src` (`T:tsconfig.json:24`).
  - JSON imports type `"zone": "mine_site"` as `string`, not `ZoneId`.
- **How to avoid:** add `tests` to a tsconfig `include`. Load content through a typed validator that narrows.
- **Warning signs:** type errors in tests only show up at runtime.

### Previews may not open on a phone

- **What goes wrong:** Vercel Deployment Protection redirects to a Vercel login. Netlify Free pauses **all** sites when credits run out.
- **How to avoid:** if Vercel is chosen, check protection settings. If Netlify, account for credit use. Cloudflare Pages and GitHub Pages previews are public by default.
- **Warning signs:** the gate check ("opens on a phone") fails while desktop works when logged in.

### Headless WebGL (resolved; noted for awareness)

The patterns research flagged that Chromium dropped the automatic SwiftShader fallback, which could push Phaser `AUTO` to Canvas in CI. The external research verified that Playwright 1.64 passes `--enable-unsafe-swiftshader` to every Chromium launch (`chromium.ts:377-378`), so WebGL works headless. This only applies to Chromium projects.

## SOTA Updates

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| Phaser 3 template | Phaser 4.0.0 template (latest 4.2.1) | 2026-04-10 | Conflicts with the locked spec. v4 notes: renderer rewritten, `roundPixels` defaults to `false`, Canvas renderer deprecated, standard API "should work transparently" |
| ESLint 9 + eslintrc | ESLint 10, flat config only | 10.0.0 on 2026-02-06; v9 EOL on 2026-08-06 | The template's `.eslintrc.cjs` is dead |
| ESLint in create-vite React templates | oxlint by default | 2026-06-15 (vitejs/vite#22638) | Linter choice is open |
| Vite 6 + Rollup + terser | Vite 8 (Rolldown + Oxc, Lightning CSS) | 8.0.0 on 2026-03-12 | `manualChunks` object form removed; terser no longer default |
| Vitest 3/4 | Vitest 5 | 5.0.0 on 2026-09-03 | Node ≥22.12; no ancestor config lookup; mocks cleared by default |
| TypeScript 5.x | TS 7.0.2 `latest` | 2026 | typescript-eslint supports `<6.1.0` only |
| `framer-motion` | `motion` (`motion/react`) | — | The spec says "Framer Motion"; not Phase 0 |
| Zustand v4 persist | v5: no initial write at creation; selectors returning new objects loop | v5 | Use `useShallow` |

**Deprecated:** the template's `.eslintrc.cjs`, the `manualChunks` object form, the terser-by-default assumption, and the `create-phaser-game` npm package (a different, stale 2022 package).

## Risks & unknowns

- **Phaser major version.** The spec locks v3, the official template is v4, and v3 has had no release in 17 months. Is the lock kept (pin `9759ec1` / `3.90.0`) or changed? This needs the owner's ruling, because it changes a locked decision (`CLAUDE.md:20`).
- **Four blocking items** (map authoring, deploy target, overlay styling, perspective). The brief says to research them, not pick. Can Phase 0 plans be written before they're decided? Deploy target blocks the gate directly (`:356`). Styling affects the overlay shell. Map authoring and perspective only touch the Phaser `scale` config in Phase 0.
- **Test hook gate.** If it is `DEV`, e2e must run on the dev server and previews have no hook or dev panel. If it is a flag, the build needs a non-production mode and a CI check that the hook is absent from prod. Which?
- **Toolchain upgrade scope.** Keep the template's Vite 6 / TS 5.7 / ESLint 9 (ESLint 9 is EOL), or upgrade in Phase 0? Upgrading touches `vite/config.prod.mjs`.
- **RNG reproducibility across reloads.** `GameState` has only `seed` (`:210`), with no cursor. Persist a cursor or generator state, or derive each roll from `(seed, key)`? This affects the "starting point" state model (`:199`) and the [OPEN] share/replay codes (`:183`).
- **Template telemetry.** Is `log.js` acceptable in CI and agent runs? The sandbox rule (`:23`) is about player-facing behaviour, so this is the owner's call.
- **Unverified.**
  - Whether root-absolute `/style.css` and `/favicon.png` in `index.html` (`T:index.html:5,7`) resolve under a GitHub Pages subpath with `base: './'`.
  - Whether Vercel turns on Authentication by default for new Hobby projects.
  - Whether `pure-rand`'s state-serialization API fits the save model.

## Open questions for planner

**Blocking items from the brief (owner decision; do not pick):**
- **Map authoring** ([OPEN], `docs/GAME_SPEC.md:194`). The spec recommends code/JSON.
  - Code/JSON 2D arrays: agent-authorable and easy to diff; the same grid feeds pure-TS pathfinding; one layer per array-built map; no visual preview.
  - Tiled: visual editing, object layers and collision properties; a GUI agents can't drive; Phaser rejects external tilesets and compressed layers; GID/`firstgid` JSON is noisy to diff; interactables risk having two sources of position.
  - Also possible: hand-written Tiled-format JSON, CSV, LDtk (no official loader).
- **Deploy target** ([OPEN], `:195`). Per-PR previews, deploy on merge to main, or both (`:195` vs `:356`)?
  - Vercel Hobby: native PR previews; non-commercial only; possible login wall.
  - Netlify Free: previews cost 0 credits; production deploy costs 15; all sites pause when credits run out.
  - Cloudflare Pages: free, 500 builds per month, public previews; Pages is being positioned behind Workers.
  - GitHub Pages: free, `GITHUB_TOKEN` only; previews need `rossjrw/pr-preview-action` and "deploy from branch" mode; no fork PRs.
- **Overlay styling** ([OPEN], `:196`). Every option except runtime CSS-in-JS has zero runtime cost.
  - Vanilla CSS: the template baseline.
  - CSS Modules: built in, scoped; the template's own modernisation PR #9 adopts them.
  - Tailwind v4.3: `@tailwindcss/vite`, long class strings in TSX.
  - vanilla-extract: typed styles, an extra plugin.
  - Runtime CSS-in-JS: per-render cost over the canvas; styled-components is in maintenance mode.
- **Top-down perspective** ([CONFIRM], `:161`; written in unmarked at `:34, 187, 389`).
  - Orthogonal top-down: simplest grid; trivial tile↔screen conversion.
  - ¾ RPG view: same tilemap, plus y-sorting.
  - Isometric: supported for Tiled maps since Phaser 3.50; needs a pure coordinate helper.
  - Side view is a poor fit. Click-through scenes are the spec's own fallback.

**Raised by research:**
- **Phaser 3 or Phaser 4?** If 3: scaffold from `9759ec1` or pin `3.90.0`.
- **Toolchain:** keep the template's versions or upgrade (Vite 8, TS 6.0 pinned below 6.1, ESLint 10)?
- **Linter:** ESLint flat config or oxlint?
- **Test hook gate:** `import.meta.env.DEV` (dev server only) or a `MODE`/`VITE_*` flag? Should previews expose the hook or the dev panel? Must CI prove the hook is absent from the production build?
- **Store placement:** vanilla `createStore` in `src/engine` with the React binding in `src/ui`?
- **Save module:** is `saveGame`/`loadGame` the custom `StateStorage` passed to `persist`, or a wrapper around persist? Which version field is the source of truth: persist's envelope `version`, `GameState.version`, or one derived from the other?
- **RNG:** library (`pure-rand`) or a small in-repo PRNG? How does reproducibility survive a save and reload: a cursor, or keyed derivation?
- **Boundary enforcement:** lint only (`no-restricted-imports` + `no-restricted-properties`), or a separate engine tsconfig too?
- **Test hook stub in Phase 0:** what does it expose with no world yet (e.g. `getState()` snapshot, `ready` flag)?
- **Template leftovers:** delete the demo scenes, `App.tsx` demo, assets and `log.js`? If any asset stays, `public/assets/CREDITS.md` is required.
- **Canvas:** what portrait `scale` config replaces the fixed 1024×768? It depends partly on the perspective decision.
- **Docs:** does Phase 0 write `docs/ARCHITECTURE.md` and `docs/CONTENT_GUIDE.md`?
- **Title:** the working title ("Gold Run", `:419`) in `<title>` and `package.json`?
- **Playwright projects:** Chromium-only (Pixel), or WebKit too (iPhone presets need a WebKit install in CI)?

## Sources

### Primary (HIGH confidence)

- `docs/GAME_SPEC.md:1-436`, `CLAUDE.md:1-87`, `BRIEF.md`, `git ls-files`: repo state and rules (research-codebase.md).
- github.com/phaserjs/template-react-ts @ `c726597` (cloned) plus history `2624f84`, `9759ec1`, `e15eaec` (GitHub API, verified by the orchestrator): `src/PhaserGame.tsx`, `src/App.tsx`, `src/game/EventBus.ts`, `src/game/main.ts`, scenes, `src/main.tsx`, `tsconfig*.json`, `vite/config.*.mjs`, `.eslintrc.cjs`, `log.js`, `index.html`, `public/style.css`, README, PRs #3 and #9.
- github.com/phaserjs/create-game: `phaser-creator/index.js` and the phaser.io 302 redirect to `main.zip`.
- github.com/pmndrs/zustand v5.0.15: `src/middleware/persist.ts`, `src/index.ts`, `src/react.ts`, `src/middleware.ts`, and the docs `persist.md`, `persisting-store-data.md`, `use-shallow.md`, `create-store.md`, `migrating-to-v5.md`.
- github.com/phaserjs/phaser: v4 `MIGRATION-GUIDE.md`, `CHANGELOG-v3.50.md:887`, and v3.90.0 `src/core/Game.js`, `src/tilemaps/ParseToTilemap.js`, `parsers/tiled/ParseTilesets.js`, `ParseTileLayers.js`. Also https://phaser.io/news/2026/05/phaser-3-vs-phaser-4.
- unpkg: eventemitter3@5 `index.js:254-260`; phaser@3.90.0 `src/phaser.js:87-89`, `src/events/EventEmitter.js:8`.
- npm registry (`npm view`, 2026-10-12): every version, date, peer dependency and engine in the Standard Stack.
- Vite `docs/guide/env-and-mode.md` and `migration.md`; create-vite `template-react-ts`.
- Vitest v5.0.0 release notes and `packages/vitest/src/defaults.ts`; vitest.dev `config/include` and `config/exclude`.
- playwright.dev `test-webserver`, `ci`, `emulation`, `evaluating`, `class-testconfig`. Playwright source `chromium.ts:377-378` and `deviceDescriptorsSource.json`.
- eslint.org `no-restricted-imports`, `no-restricted-properties`, and the v10.0.0 release post (which settles the external research's unverified claim that eslintrc was removed).
- `eslint-plugin-react-hooks` README; react.dev StrictMode.
- vercel.com docs (Hobby plan, deployment protection), netlify.com pricing and credits docs, developers.cloudflare.com Pages previews and limits, the `rossjrw/pr-preview-action` README (v1.8.1).
- motion.dev upgrade guide; kenney.nl/assets/tiny-town (CC0).

### Secondary (MEDIUM confidence)

- Chromium SwiftShader deprecation: blink-dev thread and `swiftshader.md`. Consistent with Playwright's source comment.
- Phaser 3.52 tilemap factory docs and the phaser@4.2.1 `skills/tilemaps/SKILL.md` (mixed versions).
- TypeScript issues #49055 and #26552 (JSON imports have no `as const`).
- GitHub Releases API for action majors (checkout v7, setup-node v7, cache v6, upload-artifact v7, deploy-pages v5, wrangler-action v4.1.3, actions-netlify v4.0.0), Tiled 1.12.2 and LDtk 1.5.3.
- styled-components maintenance status (maintainer posts).
- rhian.rbind.io tutorial on GitHub Pages PR previews (agrees with the action README).

### Tertiary (LOW confidence)

- `pure-rand` API and state serialization: README summary only.
- Vercel Authentication on by default for new Hobby projects: community knowledge.
- Netlify Free "operational credits" pauses, Jul–Sep 2026: forum user reports.
- "Cloudflare Pages in maintenance mode": a third-party blog.
- Code/JSON `ARRAY_2D` maps being orthogonal-only: inferred from parser paths.
- Root-absolute `index.html` links under a GitHub Pages subpath: untested.
- Vitest `node` environment failing on an engine module that imports Phaser: inferred.

## Metadata

**Research scope:**
- Focus areas covered: codebase, patterns, external.
- Sections omitted: none.
- Contradictions resolved during synthesis:
  1. **Phaser 3 template commit.** Patterns cited `2624f84`; external cited `9759ec1`. The GitHub API shows both on 2025-05-23, with `9759ec1` a merge on top of `2624f84`. Both have `^3.90.0`. `9759ec1` is the last Phaser 3 state on `main`.
  2. **SwiftShader WebGL risk.** Flagged as possible by patterns; resolved by external's source-verified Playwright flag.
  3. **ESLint 10 dropping eslintrc.** External marked it unverified; patterns cites the official v10 release post. Treated as HIGH.
  4. **Store "in engine" vs no-React.** Codebase flagged it as unresolved; patterns showed `zustand/vanilla` + `zustand/middleware` don't import React. This is a viable answer, not a decision.

**Confidence breakdown:**
- Codebase findings: HIGH. The repo is tiny, and every claim was read directly with line citations.
- Patterns & conventions: HIGH. Taken from cloned template and zustand source. Some enforcement claims (the Vitest node tripwire) are inferred.
- Standard stack: MEDIUM. Versions are HIGH (registry). Major-version choice, linter choice and the deploy free-tier terms are moving targets or owner calls.
- Pitfalls: HIGH. Most are source-verified (persist, eventemitter3, Game.destroy, Vite env, Vitest globs, Playwright flags).
- **Overall MEDIUM:** core facts are HIGH, but a locked-decision conflict (Phaser 3 vs 4) and four owner-blocked items mean the recommended approach can't be confirmed yet.

**Valid-until reasoning:** 7 days. Several libraries had a major release in the last six months (Vitest 5 on 2026-09-03, Vite 8, ESLint 10, TS 7), and the free-tier terms of the deploy providers are shifting (Netlify credits). Re-check versions and deploy pricing if planning slips past 2026-10-19.

---

*Sprint: 2026-10-12-phase-0-scaffold*
*Research completed: 2026-10-12*
*Next step: `/jira:plan`*
