# Research: patterns — 2026-10-12-phase-0-scaffold

> Returned as text by the patterns researcher (no write tool in its run); saved verbatim by the orchestrator.

Repo state: there is no application code yet. `git ls-files` shows only `CLAUDE.md`, `LICENSE`, `README.md`, `docs/GAME_SPEC.md` and the `.jira/` workspace. So the "local" patterns come from three places: the standing rules (`CLAUDE.md`, `docs/GAME_SPEC.md`), the upstream template the brief makes the starting point, and the library source behind the locked choices.

- The template was cloned at `phaserjs/template-react-ts@c726597` (2026-04-21). Template citations are written `T:path:line`.
- zustand v5.0.15 was cloned the same way. Zustand citations are written `Z:path:line`.

---

## Summary
- **The template now ships Phaser 4, but the spec locks Phaser 3.** `T:package.json` pins `"phaser": "4.0.0"` (commit e15eaec, 2026-04-10). The last Phaser 3 template commit is 2624f84 (2025-05-23, `"phaser": "^3.90.0"`). Between those two commits the only `src/` change is a comment in `EventBus.ts`, so the bridge code is identical either way. Spec reference: GAME_SPEC.md:157.
- **Several template defaults break the standing rules and must not be copied:**
  - React calls scene methods directly through the ref (`T:src/App.tsx:18-22, 37`).
  - `Math.random()` is used (`T:src/App.tsx:67`).
  - On-screen brand text appears in the scene: "support@phaser.io" (`T:src/game/scenes/Game.ts:23`).
  - Every `dev`/`build` script sends telemetry through `log.js` (`T:package.json` scripts, `T:log.js:10-15`).
  - The ESLint config is in the legacy `.eslintrc.cjs` format and is dead: ESLint 9/10 does not read it, and there is no `lint` script.
- **Zustand's default `createJSONStorage` only catches errors when it first gets the storage object, not during writes.** Writes call `localStorage.setItem` unguarded on every `set()` (`Z:src/middleware/persist.ts:37,57,221-234`). The spec requires all storage access to be wrapped in try/catch (GAME_SPEC.md:179). That points to one custom `StateStorage` that is also the single save/load module.
- **`import.meta.env.DEV` is false in every production build, including previews** (Vite env docs). A test hook gated on DEV exists only on the dev server. Playwright therefore has to run against `vite dev`, or the gate has to be a separate flag. Deploy previews would also have no dev panel.
- **Vitest and Playwright use the same default file glob** (`**/*.{test,spec}.?(c|m)[jt]s?(x)` vs `**/*.@(spec|test).?(c|m)[jt]s?(x)`). Without an explicit `include`, Vitest will try to run `tests/e2e/*.spec.ts`.

## Findings

### Patterns & conventions — Phaser/React bridge (template)
Imitate:
- **EventBus is a module-level Phaser emitter.** `T:src/game/EventBus.ts:1-4` is `new Events.EventEmitter()`. It is untyped and keyed by strings. It imports `phaser`, so anything that imports it pulls in Phaser. Engine code therefore cannot use it.
- **Mount-once guard.** `T:src/PhaserGame.tsx:20-48` creates the game in `useLayoutEffect` behind `game.current === null` and calls `game.destroy(true)` on cleanup. This handles React StrictMode's dev double-mount (`T:src/main.tsx:6`), but the result is create, destroy, create again in dev.
- **Scene-ready handshake.** Each scene must emit `'current-scene-ready'` from `create()` (`T:src/game/scenes/Game.ts:29`, `MainMenu.ts:29`, README "Important" note). `PhaserGame` listens for it and updates the ref (`T:src/PhaserGame.tsx:50-74`).
- **Game factory takes the parent element id.** `StartGame(parent)` (`T:src/game/main.ts:25-29`) is a clean seam for the boot code.

Do not imitate:
- **Direct component-to-scene calls.** `phaserRef.current.scene as MainMenu` followed by `scene.changeScene()` / `scene.moveLogo(cb)` (`T:src/App.tsx:18-22, 32-42`) is exactly what CLAUDE.md:31 forbids. The ref bridge can stay for lifecycle and the test hook; demo calls like these should go.
- **React mutating the scene.** `App.tsx:53-71` adds sprites and tweens from React. That violates CLAUDE.md:28 ("Phaser only displays and reports") in reverse.
- **Runtime reliance on the global `Phaser`.** `T:src/App.tsx:56` calls `Phaser.Math.Between` with no import. This works because Phaser 3 assigns `global.Phaser = Phaser` (unpkg phaser@3.90.0 `src/phaser.js:89`), and the types are a global namespace (`Phaser.Types.Core.GameConfig` in `T:src/game/main.ts:10` without an import). An import-based lint rule will not catch `Phaser.*` used in engine code. See Common Pitfalls.
- **Fixed landscape canvas.** The config is a fixed 1024×768 with no `scale` setting (`T:src/game/main.ts:10-23`), and the container is `100vh` (`T:public/style.css:11`). The spec says "Portrait mobile first" (GAME_SPEC.md:151).
- **Phaser-branded assets.** `public/assets/{bg,logo,star}.png` are Phaser branding, not CC0. They conflict with CLAUDE.md:86 (CC0 only, credited) and the no-brand rule (CLAUDE.md:73-79).

Fitting one bus plus one store into the template. These are options, not a pick:
- **(a)** Scenes emit typed interaction events on EventBus. One subscriber outside `src/engine` turns each event into a store action. React dispatches store actions directly.
- **(b)** Scenes read state with the vanilla store's `subscribe`/`getState`. The store needs no React for that (see below).
- **Typing the bus.** CLAUDE.md:48 ("Types over strings") argues for an event-name union or typed event map. The template's emitter has no generic typing.

### Patterns — store and save module
- **Vanilla store vs React hook.** `zustand` (the root entry) re-exports `react.ts`, which does `import React from 'react'` (`Z:src/index.ts`, `Z:src/react.ts:1`). `zustand/vanilla` `createStore` does not import React (`Z:docs/reference/apis/create-store.md:55`). `zustand/middleware` (`persist`) does not import React either (`Z:src/middleware.ts`). A store under `src/engine` that must not import React (CLAUDE.md:26) therefore implies `createStore` from `zustand/vanilla` plus `persist`. React components then read through `useStore(store, selector)`.
- **What `persist` does with the version and the shape:**
  - Stored data is wrapped in an envelope `{ state, version }` (`Z:src/middleware/persist.ts:13-16`).
  - `migrate(persistedState, version)` runs only when the stored envelope version is a number and differs from `options.version` (`:275`).
  - With no `migrate` function, persist only logs `console.error` and drops the saved state (`:288`).
  - The default `merge` is shallow (`:193`). Nested objects such as `world` and `npcs` are replaced whole (docs `persisting-store-data.md:267`).
- **Two version numbers.** The spec also puts `version: 1` inside `GameState` (GAME_SPEC.md:209, 181). That makes two version fields: the persist envelope and the `GameState` field. One Source of Truth (global CLAUDE.md) applies.
- **Every write is a full synchronous write.** Every `set()` and `api.setState` calls `setItem` with the partialized full state, synchronously (`:221-234`). `createJSONStorage` then runs `JSON.stringify` and `localStorage.setItem` (`:56-57`).
- **Hydration timing.** Hydration with `localStorage` is synchronous at store creation (docs `persisting-store-data.md:485-492`). `skipHydration` and `persist.rehydrate()` exist for manual control (`:288-323`).
- **Storage seam.** A custom `StateStorage` (`getItem`/`setItem`/`removeItem`, `Z:src/middleware/persist.ts:7-11`) is the hook point for "all save/load through one module" (CLAUDE.md:36, GAME_SPEC.md:180). The persist call site stays the same; only the storage object changes. That matches "swapping in a server = editing one file". Async `getItem` is supported, but it makes hydration async (docs `:497-505`).
- **Selectors that return objects.** In Zustand v5, selector objects built fresh on every render cause "Maximum update depth exceeded" (`Z:docs/reference/hooks/use-shallow.md:269-271`). `useShallow` is the documented fix. This matches the `react-best-practices` skill's re-render rules ("Use derived state subscriptions").

### Patterns — pure-TS boundary enforcement
- **ESLint `no-restricted-imports` by folder.** A flat-config override scoped to `src/engine/**` and `src/systems/**` can ban `phaser`, `react`, `react-dom`, `zustand` (root entry), `../game/**` and `../ui/**`. It checks **static imports only, not dynamic `import()`** (eslint.org no-restricted-imports). `allowTypeImports` exists and defaults to false.
- **Compile-time option.** A separate tsconfig for engine/systems with `types: []` and no `DOM` lib would block the global `Phaser` namespace and `window`/`localStorage`, which lint cannot see. The template tsconfig puts everything under one `include: ["src"]` (`T:tsconfig.json:24`).
- **Test-environment tripwire.** Vitest's default `node` environment has no `window`, so an engine module that touches the DOM fails when tested. This is an inference; not tested with Phaser.
- **Third-party boundary plugins** (`eslint-plugin-boundaries`, `import/no-restricted-paths`) are listed for the external researcher, not evaluated here.

### Patterns — seeded RNG and the `Math.random` ban
- **Lint rule.** `no-restricted-properties` with `{ object: "Math", property: "random" }` also catches destructuring (`const { random } = Math`) (eslint.org no-restricted-properties).
- **The template already violates it** at `T:src/App.tsx:67`, so the demo code has to be deleted before the rule is turned on, not after.
- **No cursor in the state model.** The spec says runs must be "reproducible from the seed" (CLAUDE.md:35), but `GameState` has only `seed` (GAME_SPEC.md:210), with no draw counter or generator state. After a save/reload, later draws depend on how many draws happened before. Two pattern options:
  - Persist the generator state or a cursor in `GameState`. This changes the "starting point" model.
  - Derive each roll from `(seed, stable key)` so that no cursor is needed.
- **Library.** `pure-rand` (MIT) offers a pure/immutable API through `purify` (github.com/dubzzz/pure-rand). Library choice belongs to the external focus.

### Patterns — dev-only test hook and Playwright
- **Gating.** Vite replaces `import.meta.env.DEV` statically, and code inside `if (import.meta.env.DEV)` "will be tree-shaken in production builds". `vite build --mode development` still sets `NODE_ENV=production`, so DEV stays false (vite.dev/guide/env-and-mode).
  - Pattern: a dynamic `import('./dev/testHook')` inside the DEV branch means the chunk is never emitted.
  - A static top-level import of a module with side effects is not guaranteed to be dropped.
  - A cheap verification is a CI step that searches `dist/` for `__GOLD_RUN__`.
- **Which server Playwright runs against.** Hook-driven e2e must hit the dev server, or the hook needs a separate opt-in flag (for example a custom `VITE_*` variable or mode). The Playwright `webServer` block (`command`, `url`, `reuseExistingServer: !process.env.CI`, `timeout`) and `use.baseURL` are the documented wiring (playwright.dev/docs/test-webserver). The template dev server runs on port 8080 (`T:vite/config.dev.mjs:11`).
- **Script names.** `npm run dev` sends telemetry through `log.js`. The template's own opt-out is the `dev-nolog`/`build-nolog` scripts or deleting `log.js` (`T:README.md` "About log.js").
- **Driving the hook from tests:**
  - `page.evaluate` accepts serializable arguments and waits for promises (playwright.dev/docs/evaluating). The hook should return plain JSON snapshots, not live store or scene objects.
  - `page.addInitScript` runs before page scripts. Pattern uses: clearing or seeding `localStorage`, and stubbing `Storage.prototype.setItem` to throw so tests cover "works when storage is blocked" (GAME_SPEC.md:179).
- **Double install.** StrictMode's double mount (`T:src/main.tsx:6`, `PhaserGame.tsx:20-48`) means hook install code runs twice in dev. An idempotent install avoids stale references to the destroyed first game.

### Patterns — Vitest coexisting with Playwright
- **Default globs.** Vitest's default `include` is `['**/*.{test,spec}.?(c|m)[jt]s?(x)']` (vitest.dev/config/include, v5.0.4). Playwright's default `testMatch` is `**/*.@(spec|test).?(c|m)[jt]s?(x)`, and its `testDir` defaults to the config file's directory (playwright.dev class-testconfig).
- **Exclude replaces, it does not add.** Setting Vitest `exclude` replaces the defaults. Spread `configDefaults.exclude` from `vitest/config` to keep them (vitest.dev/config/exclude).
- **Separation options:** Vitest `include: ['tests/unit/**']` plus Playwright `testDir: 'tests/e2e'`, or different suffixes per tool. Spec layout: `tests/unit` and `tests/e2e` (GAME_SPEC.md:305-307).
- **No config for Vitest to inherit.** The template keeps its Vite configs in `vite/config.*.mjs`, with no root `vite.config.*` (`T:vite/`). Vitest finds no Vite config, so it needs its own `vitest.config.ts`. `T:tsconfig.node.json:10` includes a `vite.config.ts` that does not exist.
- **Tests are not type-checked.** `T:tsconfig.json:24` includes only `src`, so files under `tests/` fall outside `tsc --noEmit`.

### Patterns — content as JSON with typed loaders
- **JSON types widen.** `resolveJsonModule` is on (`T:tsconfig.json:12`), but JSON imports type string values as `string`, not literal unions. The "import JSON as const" request is still open (TypeScript issues #49055, #32063 via #49055, #26552). As a result, `"zone": "mine_site"` does not narrow to `ZoneId`, and discriminated unions break.
- **Patterns that preserve "Types over strings" (CLAUDE.md:48):** a loader that validates at runtime and narrows the type (schema library or a hand-written guard), or generated `.d.ts` files.
- **Content-only pieces.** Several template strings visible on screen are hardcoded in scenes (`T:src/game/scenes/Game.ts:23`, `MainMenu.ts:23`) and must not survive (CLAUDE.md:41). The empty shell needs no content, but the loader seam and an empty `src/content/` fit Phase 0.

### Don't Hand-Roll (local half)
- **Phaser/React mount and lifecycle.** Keep `T:src/PhaserGame.tsx` and `T:src/game/main.ts`; the brief requires it ("do not hand-roll the integration").
- **Event emitter.** Reuse the template `EventBus` (Phaser's emitter, built on eventemitter3) rather than writing a new pub/sub. Spec: "the template's EventBus" (GAME_SPEC.md:167).
- **Persistence plumbing.** Use `persist` + `createJSONStorage` + a custom `StateStorage` rather than custom `subscribe`-to-`localStorage` code. Versioning and migration hooks already exist (`Z:src/middleware/persist.ts:183-232` docs and impl).
- **Server lifecycle for e2e.** Use Playwright `webServer` rather than custom start/wait scripts.

### Common Pitfalls (local near-misses)
1. **Phaser 4 by default.** Scaffolding with today's template installs `phaser@4.0.0`; npm `latest` is 4.2.1, and 3.90.0 was published 2025-05-23. The spec says Phaser 3.
2. **Removing every listener by accident.** `EventBus.removeListener('current-scene-ready')` with no `fn` argument (`T:src/PhaserGame.tsx:72`) clears **all** listeners for that event. eventemitter3 calls `clearEvent` when `fn` is absent (`eventemitter3@5 index.js:258-260`), and Phaser's emitter wraps eventemitter3 (`phaser@3.90.0 src/events/EventEmitter.js:8`). A second subscriber to the same event, such as a test-hook readiness listener, would be removed silently.
3. **Leaking listeners.** The module-level EventBus outlives `game.destroy(true)`. Scenes that call `EventBus.on` in `create()` without `off` on shutdown leak listeners across scene restarts and StrictMode's dev remount.
4. **Uncaught storage write errors.** `createJSONStorage` catches only `getStorage()` failures (`Z:...persist.ts:36-41`). A quota or security error during `setItem` throws out of the store's `set()`. When storage is entirely unavailable, persist logs a warning on **every** `set` (`:208-216`).
5. **A localStorage write per movement frame.** Each `set` serializes and writes the whole state (`:221-234`). Writing `world.x/y` (GAME_SPEC.md:212) into the store every frame during walking means a synchronous localStorage write per frame.
6. **Saves dropped on version change.** If the version is bumped with no `migrate` function, the save is discarded with only a console error (`:288`).
7. **Previews lack the hook and dev panel.** All deploy targets serve production builds, so a DEV gate removes the hook from previews. The dev panel (GAME_SPEC.md:174) would be missing too, unless it uses a different gate.
8. **Dead ESLint config.** `T:.eslintrc.cjs` is not read by ESLint 9 or 10. v10 removed eslintrc entirely, and v9.x reached end of life on 2026-08-06 (eslint.org v10 release post). The template also has no `lint` script.
9. **Telemetry from scripts.** `log.js` makes a GET request to `gryzor.co` on every `dev`/`build` (`T:log.js:10-15`), including in CI and Playwright `webServer` runs.
10. **Possible WebGL failure in headless CI.** Chromium is removing the automatic SwiftShader WebGL fallback; it becomes opt-in through `--enable-unsafe-swiftshader`. Phaser `type: AUTO` (`T:src/game/main.ts:11`) would then fall back to Canvas, so CI may render differently from phones. This is not a problem for hook-driven tests; it is a divergence to be aware of.

### [OPEN] items — what each option implies for the patterns (no pick)
**Map authoring (GAME_SPEC.md:194)**
- **Code/JSON arrays:**
  - Phaser builds a tilemap from a 2D array with `data` plus `tileWidth`/`tileHeight` (Phaser 3.52 tilemap factory docs).
  - The same plain grid can feed a pure-TS walkability and pathfinding function in `src/engine`/`src/systems` that is unit-testable without Phaser. Tap-to-move (GAME_SPEC.md:160) and the e2e "teleport" both need that grid.
  - Interactables stay in their own JSON with tile coordinates, matching the spec shape (GAME_SPEC.md:251-256).
  - Collision is defined by tile index lists.
- **Tiled:**
  - Loaded with `load.tilemapTiledJSON`; dimensions come from the file.
  - Collision can come from tile properties (`setCollisionByProperty({ collides: true })`, Phaser tilemaps skill).
  - Interactables may migrate into Tiled object layers. That creates a second source of positions unless the spec's interactable JSON stays the only one.
  - Engine-side pathfinding would have to parse Tiled's flat layer arrays, or receive a grid from Phaser, which crosses the "Phaser only reports" line.
  - Agents cannot use the GUI (spec's own note).

**Deploy target (GAME_SPEC.md:195)**
- **Vercel / Netlify:** per-PR preview URLs from the Git integration, outside GitHub Actions. This adds an external account and token to the repo setup.
- **GitHub Pages:** no native PR previews. `rossjrw/pr-preview-action` publishes to `/<repo>/pr-preview/pr-N/` and needs Pages set to deploy from a branch (`gh-pages`), not the Actions source. Fork PRs are not supported.
- **Base path.** The template's `base: './'` (`T:vite/config.prod.mjs:21`) gives relative asset URLs that survive subpath hosting. `index.html` uses root-absolute `/style.css` and `/favicon.png` (`T:index.html:5,7`), and how those resolve under a subpath is unverified.
- **All three** serve the production build, so pitfall 7 applies to every option.

**Overlay styling (GAME_SPEC.md:196)**
- **Template baseline.** One global stylesheet in `public/style.css`, linked from `index.html` (`T:index.html:7`). Vite copies it as-is, with no bundling or hashing.
- **CSS Modules:** built into Vite, no dependency, class names scoped per component.
- **Tailwind:** a build plugin dependency and utility classes in TSX. Neither option affects the content-in-JSON rule.
- **Constraints any choice must meet:**
  - Overlays must sit on the canvas container in portrait.
  - Re-render cost matters (CLAUDE.md "react-best-practices").
  - The animation library is locked as "Framer Motion" (GAME_SPEC.md:172), but that package is now `motion` with imports from `motion/react` (motion.dev upgrade guide).

**Top-down perspective [CONFIRM] (GAME_SPEC.md:161)**
- **Top-down orthogonal:** the grid is a plain 2D array; screen ↔ tile conversion is a multiplication; pathfinding and teleport-by-tile are trivial in pure TS; y-sorting depth is a scene-only concern.
- **Isometric or another projection:** needs coordinate transforms. Those belong in a pure, tested helper, or they leak into scenes. Tiled and Phaser support iso maps, but that changes the shape of the map JSON.
- **Phase 0 impact.** None of the shell code depends on the choice except the Phaser `scale` config. The fixed 1024×768 landscape (`T:src/game/main.ts:12-13`) conflicts with portrait-first either way.

## Open questions
- Phaser 3 (pin `^3.90.0`, template commit 2624f84) or Phaser 4 (template HEAD)? The spec says Phaser 3 (GAME_SPEC.md:157). Changing it is a spec change, not a Phase 0 detail. External focus: Phaser 3 maintenance status and v4 migration cost.
- Should the hook and dev panel be gated on `import.meta.env.DEV` (absent from previews) or on an explicit opt-in flag (present in previews, and still needing tree-shaking from the final acid-test build)?
- Which source of truth for the save version: the persist envelope `version`, `GameState.version`, or one derived from the other?
- RNG reproducibility across reloads: add a cursor or generator state to `GameState`, or use keyed derivation? Either touches the "starting point" state model.
- Should the `world.x/y` store write frequency be fixed now (in the shell's store or save module) or left to Phase 1?
- Is template telemetry (`log.js`) acceptable for a "fully sandboxed" build? The spec's sandbox rule (GAME_SPEC.md:23) is about player-facing features, so this is the owner's call.
- Does root-absolute `/style.css` in `index.html` resolve correctly under a GitHub Pages subpath with `base: './'`? Not verified.

## Sources

### Primary (HIGH confidence)
- `CLAUDE.md:26-48,57,68,73,86`: standing rules, read directly.
- `docs/GAME_SPEC.md:146-247,270-308,352-356`: spec sections 5, 6, 7, read directly.
- `.jira/sprints/2026-10-12-phase-0-scaffold/BRIEF.md`: read directly.
- github.com/phaserjs/template-react-ts @ c7265972 (cloned): `src/PhaserGame.tsx`, `src/App.tsx`, `src/game/EventBus.ts`, `src/game/main.ts`, `src/game/scenes/*.ts`, `src/main.tsx`, `tsconfig*.json`, `vite/config.*.mjs`, `.eslintrc.cjs`, `log.js`, `index.html`, `public/style.css`, `README.md`, plus git history (2624f84 vs e15eaec).
- github.com/pmndrs/zustand v5.0.15 (cloned): `src/middleware/persist.ts`, `src/index.ts`, `src/react.ts`, `src/middleware.ts`, `docs/reference/integrations/persisting-store-data.md`, `docs/reference/hooks/use-shallow.md`, `docs/reference/apis/create-store.md`.
- unpkg eventemitter3@5 `index.js:254-260`; unpkg phaser@3.90.0 `src/phaser.js:87-89`, `src/events/EventEmitter.js:8`; npm registry dist-tags and times for phaser.
- https://vitest.dev/config/include and https://vitest.dev/config/exclude: official docs.
- https://playwright.dev/docs/test-webserver, https://playwright.dev/docs/api/class-testconfig, https://playwright.dev/docs/evaluating: official docs.
- https://vite.dev/guide/env-and-mode: official docs.
- https://eslint.org/docs/latest/rules/no-restricted-imports and https://eslint.org/docs/latest/rules/no-restricted-properties: official docs.
- https://eslint.org/blog/2026/02/eslint-v10.0.0-released/: official release post (eslintrc removed, v9 EOL banner).
- https://motion.dev/docs/react-upgrade-guide: official docs.

### Secondary (MEDIUM confidence)
- https://groups.google.com/a/chromium.org/g/blink-dev/c/yhFguWS_3pM/m/oLrB5up_BwAJ and https://chromium.googlesource.com/chromium/src/+/798e59c5275d4131797e8ea2e96e6c6000256b58/docs/gpu/swiftshader.md: Chromium's own SwiftShader removal notice. Its effect on Playwright and Phaser's AUTO fallback is inference.
- https://newdocs.phaser.io/docs/3.52.0/focus/Phaser.GameObjects.GameObjectFactory-tilemap and https://unpkg.com/phaser@4.2.1/skills/tilemaps/SKILL.md: official, but version-mixed (3.52 and 4.x).
- https://github.com/microsoft/TypeScript/issues/49055 and https://github.com/microsoft/TypeScript/issues/26552: issue threads; current status of #32063 not checked directly.
- https://github.com/rossjrw/pr-preview-action (via search summary) and https://rhian.rbind.io/posts/2024-12-04_github-pr-previews/: action README and a tutorial agree.

### Tertiary (LOW confidence — validate)
- https://github.com/dubzzz/pure-rand: README via a fetch summary. Version and state-serialization API not confirmed.
- That Vitest's `node` environment fails when an engine module imports Phaser: inferred, not tested.
- That root-absolute `index.html` links break under a GitHub Pages subpath: unverified.
- That Vercel and Netlify give native per-PR previews: search summary only; the external focus should confirm.
