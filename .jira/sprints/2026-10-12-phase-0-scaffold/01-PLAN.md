---
sprint: 2026-10-12-phase-0-scaffold
plan: I
wave: I
goal: On the empty Phaser 4 shell, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` all exit 0 locally and in the GitHub Actions CI run for the sprint PR, the production build contains no `__GOLD_RUN__`, and the PR's Cloudflare Pages preview URL opens on a phone (owner-verified).
worktree: false             # one branch, one PR per sprint; plans in each wave touch disjoint files, so a shared tree is safe
branch: jira/2026-10-12-phase-0-scaffold
issue: none
depends_on: []
parallel_with: []
files_modified:
  - package.json
  - package-lock.json
  - .gitignore
  - .nvmrc
  - index.html
  - tsconfig.json
  - tsconfig.node.json
  - vite/config.dev.mjs
  - vite/config.prod.mjs
  - src/main.tsx
  - src/vite-env.d.ts
  - src/ui/App.tsx
  - src/ui/App.module.css
  - src/ui/PhaserGame.tsx
  - src/ui/global.css
  - src/game/main.ts
  - src/game/EventBus.ts
  - src/game/scenes/Boot.ts
  - src/engine/.gitkeep
  - src/systems/.gitkeep
  - src/content/.gitkeep
  - src/minigames/.gitkeep
  - src/dev/.gitkeep
  - tests/unit/.gitkeep
  - tests/e2e/.gitkeep
  - public/assets/CREDITS.md
covers:
  - D-01
  - D-03
  - D-05
  - D-07
  - D-09
  - CD-08
  - CD-11
  - CD-12
  - CD-14
  - CD-15
  - CD-16
  - CD-17
  - CD-18
  - GOAL: empty Phaser 4 shell that builds
  - "RESEARCH: scaffold non-interactively from the template; do not use the interactive CLI"
  - "RESEARCH: delete demo App.tsx scene calls, Math.random, branded text/assets, log.js, .eslintrc.cjs before lint rules land"
  - "RESEARCH: replace fixed 1024x768 canvas with a portrait-friendly scale config"
  - "RESEARCH: Vite 8 rejects object-form manualChunks; rollupOptions renamed; terser no longer default"
  - "RESEARCH: pin TypeScript ~6.0 (typescript-eslint peer <6.1)"
  - "RESEARCH: no root .gitignore exists"
  - "RESEARCH: removeListener without handler wipes every listener"
  - "RESEARCH: tsc skips tests/ because template tsconfig only includes src"
  - "RESEARCH: typed EventBus (types over strings)"
  - "RESEARCH: adding type:module breaks CJS log.js"
effects:
  - SCAF-02
  - SCAF-03
  - SCAF-04
  - SCAF-05
---

# Plan I: Import the Phaser 4 template, upgrade the toolchain, reshape to the spec layout

**Sprint goal:** On the empty Phaser 4 shell, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` all exit 0 locally and in the GitHub Actions CI run for the sprint PR, the production build contains no `__GOLD_RUN__`, and the PR's Cloudflare Pages preview URL opens on a phone (owner-verified).

## Commit safety on the shared tree

The sprint runs on a single shared working tree (`worktree: false`): every plan commits to `jira/2026-10-12-phase-0-scaffold`, and the same-wave plans touch disjoint files. That includes wave II, where Plans II and III run in parallel. Every executor stages only the paths in its own `files_modified`, by name (`git add <path> ...`), never `git add -A` or `git add .`. Commits from parallel plans are made one at a time, never concurrently.

**This plan delivers:**
- the official `phaserjs/template-react-ts` scaffold, pinned to a SHA and imported non-interactively
- every dependency for the whole sprint, installed at the D-07 versions
- all npm scripts
- template rule-breakers deleted (D-09)
- an empty portrait shell in the spec section 6 layout: one Boot scene and an empty CSS-Modules overlay layer

This is the only plan that touches `package.json` / `package-lock.json`. Later plans must not add dependencies.

## Files

`package.json`, `package-lock.json`, `.gitignore`, `.nvmrc`, `index.html`, `tsconfig.json`, `tsconfig.node.json`, `vite/config.dev.mjs`, `vite/config.prod.mjs`, `src/main.tsx`, `src/vite-env.d.ts`, `src/ui/App.tsx`, `src/ui/App.module.css`, `src/ui/PhaserGame.tsx`, `src/ui/global.css`, `src/game/main.ts`, `src/game/EventBus.ts`, `src/game/scenes/Boot.ts`, `.gitkeep` in `src/{engine,systems,content,minigames,dev}` and `tests/{unit,e2e}`, `public/assets/CREDITS.md`.

Template files deleted (never committed): `log.js`, `.eslintrc.cjs`, `src/App.tsx`, `src/PhaserGame.tsx`, `src/game/scenes/{Preloader,MainMenu,Game,GameOver}.ts`, `public/style.css`, `public/favicon.png`, `public/assets/{bg,logo,star}.png`, the template `README.md` and `LICENSE` (the repo keeps its own).

## Tasks

### I. Import the template at a pinned SHA and strip rule-breakers

- **Files:** `package.json`, `.gitignore`, `.nvmrc`, `index.html`, `public/assets/CREDITS.md`, `.gitkeep` files listed above. Template sources are copied in and then reshaped in Task III.
- **Read first:** `CLAUDE.md`, `.jira/sprints/2026-10-12-phase-0-scaffold/CONTEXT.md` (D-01, D-09, CD-12, CD-14..CD-16), `.jira/sprints/2026-10-12-phase-0-scaffold/research-external.md` ("The Phaser template" section), `docs/GAME_SPEC.md` section 6.
- **Action:**
  1. Per D-01/CD-16, run `git ls-remote https://github.com/phaserjs/template-react-ts refs/heads/main` and record the SHA. Run `npx degit phaserjs/template-react-ts#<SHA> <scratchpad>/template` into the session scratchpad, **not** the repo root. Do not run `npm create @phaserjs/game`. Note the template's copyright line from its `LICENSE` for Plan V.
  2. Copy into the repo root: `package.json`, `index.html`, `tsconfig.json`, `vite/`, `src/`. Do not copy `README.md`, `LICENSE`, `log.js`, `.eslintrc.cjs`, `public/style.css`, `public/favicon.png` or `public/assets/*.png` (D-09).
  3. In `package.json`, per CD-14/CD-15/CD-17:
     - set `"name": "gold-run"`, `"private": true` and `"type": "module"`
     - set `"engines": { "node": ">=22.12" }`
     - replace `scripts` with exactly `dev`, `build`, `typecheck`, `lint`, `test` and `e2e`, as listed in CONTEXT CD-17
     - remove every `log.js`, `dev-nolog` and `build-nolog` reference
     - delete the template's `description`, `version`, `repository`, `author`, `bugs`, `homepage`, `keywords` and `licenseUrl` fields; set `"license": "MIT"`
  4. Write `.nvmrc` containing `24`.
  5. Write `.gitignore` with: `node_modules/`, `dist/`, `test-results/`, `playwright-report/`, `blob-report/`, `.vitest/`, `*.local`, `.env.local`, `.env.*.local`, `.DS_Store`.
  6. In `index.html`, per CD-14:
     - set `<title>Gold Run</title>`
     - replace the template's existing viewport meta, so the file has exactly one: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
     - remove the `/style.css` and `/favicon.png` links
     - keep `<div id="root"></div>` and the `src/main.tsx` module script
  7. Create `public/assets/CREDITS.md` with a heading `# Asset credits`, one sentence ("Every asset in this folder is listed here with its source and licence when it is added. Prototype art must be CC0."), and an empty table with columns `File | Source | Author | Licence`.
  8. Add empty `.gitkeep` files in `src/engine`, `src/systems`, `src/content`, `src/minigames`, `src/dev`, `tests/unit` and `tests/e2e`.
- **Done when:**
  - `test ! -e log.js && test ! -e .eslintrc.cjs && test ! -e public/assets/logo.png` exits 0.
  - `grep -c '"type": "module"' package.json` prints 1.
  - `grep -rn "log.js\|nolog" package.json` finds nothing.
  - `git check-ignore node_modules/ dist/ playwright-report/ test-results/ .vitest/` prints all five.
  - `cat .nvmrc` prints `24`.
  - `grep -c 'name="viewport"' index.html` = 1.
  - `node -e "const p=require('./package.json');for(const k of ['description','version','repository','author','bugs','homepage','keywords','licenseUrl'])if(k in p)process.exit(1)"` exits 0.
- **Covers:** D-01, D-09, CD-14, CD-15, CD-16, CD-17, SCAF-04, SCAF-05

### II. Install the sprint's full dependency set at the D-07 versions and port configs to Vite 8

- **Files:** `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.node.json`, `vite/config.dev.mjs`, `vite/config.prod.mjs`, `src/vite-env.d.ts`
- **Read first:** `vite/config.dev.mjs`, `vite/config.prod.mjs`, `tsconfig.json` (as imported), CONTEXT D-07/D-08/CD-17/CD-18, RESEARCH.md "Template lint and build configs break silently on upgrade", Vite 8 migration guide (https://vite.dev/guide/migration).
- **Action:**
  1. Set dependencies, then run `npm install` to produce `package-lock.json`:
     - `dependencies`: `phaser@^4.2.1`, `react@^19.3.0`, `react-dom@^19.3.0`, `zustand@^5.0.15`.
     - `devDependencies`: `vite@^8.3.4`, `@vitejs/plugin-react@^6.1.2`, `typescript@~6.0.3`, `@types/react@^19`, `@types/react-dom@^19`, `@types/node@^24`, `vitest@^5.0.4`, `@playwright/test@^1.64.0`, `eslint@^10.12.0`, `@eslint/js@^10`, `typescript-eslint@^8.71.2`, `eslint-plugin-react-hooks@^7.1.1`, `eslint-plugin-react-refresh@^0.5.7`, `globals` (latest).
     - Remove `terser` and any template devDependency these replace.
     - If npm reports an unresolvable peer conflict among these, stop and record it in EXECUTION.md. Do not swap versions; D-07 is locked.
  2. Rewrite `vite/config.prod.mjs` for Vite 8:
     - keep `base: './'`, the React plugin and `logLevel`
     - delete the template's `phasermsg` plugin, including its definition and its entry in `plugins`
     - drop `minify: 'terser'` and `terserOptions` (Oxc is the default minifier)
     - move chunking to `build.rolldownOptions.output` and replace `manualChunks: { phaser: ['phaser'] }` with the function form `manualChunks(id) { if (id.includes('node_modules/phaser')) return 'phaser'; }`. If Vite 8 deprecates the function form in favour of `advancedChunks`/`codeSplitting` groups, use that with a group named `phaser` matching `node_modules/phaser`.
  3. Rewrite `vite/config.dev.mjs` similarly: keep `base: './'`, the React plugin and `server.port: 8080`; set `server.strictPort: true`.
  4. Rewrite `tsconfig.json` per CD-18:
     - `strict: true`, `moduleResolution: "bundler"`, `module: "ESNext"`, `target: "ES2022"`, `lib: ["ES2023", "DOM", "DOM.Iterable"]`, `jsx: "react-jsx"`, `noEmit: true`
     - `types: ["vite/client"]`, `include: ["src"]`
     - keep the template's `strictPropertyInitialization: false` (Phaser scene fields)
     - delete the `references` array and any `composite` option; the two configs are independent and are checked by two separate `tsc -p` calls
  5. Write `tsconfig.node.json`: same strictness, `types: ["node"]`, `include: ["tests", "vitest.config.ts", "playwright.config.ts"]`. Add `"noEmit": true`; drop `composite` and the template's stale `vite.config.ts` include. In wave I this config has no input files yet (TS18003), so wave I checks types only with `npx tsc --noEmit -p tsconfig.json`. The full `npm run typecheck` applies from wave II onward, when Plans II and III add `tests/unit/*.test.ts` and `vitest.config.ts`.
  6. Keep `src/vite-env.d.ts` as `/// <reference types="vite/client" />`. Plan IV extends it.
- **Done when:**
  - `npm ls phaser vite typescript @vitejs/plugin-react eslint eslint-plugin-react-hooks` shows phaser 4.x, vite 8.x, typescript 6.0.x, @vitejs/plugin-react 6.x, eslint 10.x and eslint-plugin-react-hooks 7.x (SCAF-02).
  - `grep -rn terser vite/ package.json` finds nothing.
  - `npm run build` exits 0 and `ls dist/assets | grep '^phaser'` prints at least one `.js` file (SCAF-03). Run this after Task III if the template sources don't compile yet.
- **Covers:** D-07, CD-17, CD-18, SCAF-02, SCAF-03

### III. Reshape the template into the section 6 layout as an empty portrait shell

- **Files:** `src/main.tsx`, `src/ui/App.tsx`, `src/ui/App.module.css`, `src/ui/PhaserGame.tsx`, `src/ui/global.css`, `src/game/main.ts`, `src/game/EventBus.ts`, `src/game/scenes/Boot.ts`. Delete `src/App.tsx`, `src/PhaserGame.tsx`, `src/game/scenes/{Preloader,MainMenu,Game,GameOver}.ts`.
- **Read first:**
  - the imported `src/PhaserGame.tsx`, `src/App.tsx`, `src/game/main.ts`, `src/game/EventBus.ts`, `src/game/scenes/Boot.ts`, `src/main.tsx`
  - CONTEXT D-03, D-05, CD-08, CD-11, CD-12
  - RESEARCH.md pitfalls "StrictMode double mount" and "`removeListener(event)` with no handler"
  - `node_modules/phaser/skills/` (the Phaser 4 scale and scene skills, if present)
- **Action:**
  1. `src/game/EventBus.ts` (CD-11): keep `export const EventBus = new Events.EventEmitter();` with `import { Events } from 'phaser'`. Add `export const GameEvent = { SceneReady: 'current-scene-ready' } as const;` and `export type GameEvent = (typeof GameEvent)[keyof typeof GameEvent];`.
  2. `src/game/scenes/Boot.ts`: a single `Boot extends Scene` with key `'Boot'`, no `preload` and no game objects. `create()` calls `EventBus.emit(GameEvent.SceneReady, this)`. No text, no assets, no listeners.
  3. `src/game/main.ts` (CD-08):
     - delete the fixed `width: 1024, height: 768`
     - config: `type: AUTO`, `parent`, `backgroundColor: SHELL_BACKGROUND_COLOR` (a named `const` in this file, e.g. `'#1b1b1b'`), `scale: { mode: Scale.RESIZE, autoCenter: Scale.CENTER_BOTH }`, `scene: [Boot]`
     - keep the `StartGame(parent: string)` export
     - do not set `roundPixels` or `pixelArt` (deferred with art style)
     - import types and values from `'phaser'` explicitly; do not rely on a global `Phaser`
  4. Move `src/PhaserGame.tsx` to `src/ui/PhaserGame.tsx`:
     - keep the mount-once `useLayoutEffect` guard, `game.destroy(true)` cleanup, and the forwarded ref `{ game, scene }`
     - replace `EventBus.on('current-scene-ready', …)` / `EventBus.removeListener('current-scene-ready')` with a named handler: `EventBus.on(GameEvent.SceneReady, onSceneReady)` and `EventBus.off(GameEvent.SceneReady, onSceneReady)`
     - drop the `currentActiveScene` prop if nothing uses it after the demo removal
     - satisfy React 19 ref-as-prop or keep `forwardRef`, whichever compiles cleanly under `@types/react@19`
  5. `src/ui/App.tsx` (D-03, CD-12): render `<div className={styles.root}><PhaserGame ref={phaserRef} /><div className={styles.overlay} data-testid="overlay-root" /></div>`. No buttons, no text, no scene calls, no `Math.random`, no sprite creation. `src/ui/App.module.css` contains:
     - `.root { position: relative; width: 100vw; height: 100dvh; overflow: hidden; }`
     - `.overlay { position: absolute; inset: 0; pointer-events: none; }`
     - `#game-container` must end up `100vw × 100dvh`. Style it in `global.css`.
  6. `src/ui/global.css`: `html, body { margin: 0; padding: 0; height: 100%; background: #000; overscroll-behavior: none; }`, `#root { height: 100%; }`, `#game-container { width: 100vw; height: 100dvh; touch-action: none; }`.
  7. `src/main.tsx`:
     - import `./ui/global.css` and `App` from `./ui/App`
     - keep `<React.StrictMode>`
     - wrap the `createRoot(...).render(...)` call in a function `renderApp()` that is called at the bottom; Plan IV inserts the hook gate before it
- **Done when:**
  - `ls src/game/scenes` prints only `Boot.ts`.
  - `grep -rn "Math.random\|phaser.io\|gryzor" src vite index.html package.json` finds nothing (SCAF-04, literal predicate grep).
  - `grep -rn "changeScene\|moveLogo\|add.sprite\|1024\|768\|phasermsg" src vite` finds nothing.
  - `grep -rn "removeListener('current-scene-ready')\|'current-scene-ready'" src | grep -v EventBus.ts` finds nothing.
  - `npm run build` exits 0. `npx tsc --noEmit -p tsconfig.json` exits 0. The full `npm run typecheck` applies from wave II.
  - `npm run dev` serves `http://localhost:8080/`, and `curl -s localhost:8080 | grep -c 'id="root"'` = 1. The one-canvas-in-`#game-container` check is automated by HOOK-05 in Plan IV.
  - `git ls-files src tests public | grep -c gitkeep` ≥ 7 once committed (SCAF-05).
- **Covers:** D-03, D-05, D-09, CD-08, CD-11, CD-12, SCAF-04, SCAF-05

## Nyquist criteria for this plan

- [ ] `npm ls` shows phaser 4.x, vite 8.x, typescript 6.0.x, plugin-react 6.x, eslint 10.x, react-hooks 7.x (SCAF-02)
- [ ] `npm run build` exits 0 and emits a `phaser*.js` chunk; no terser references (SCAF-03)
- [ ] Template leftovers absent; grep for `Math.random|phaser.io|gryzor` in `src vite index.html package.json` is empty (SCAF-04)
- [ ] Spec section 6 directories exist in git; `public/assets/CREDITS.md` exists; `.gitignore` covers the five paths (SCAF-05)
- [ ] `npx tsc --noEmit -p tsconfig.json` exits 0 (full `npm run typecheck` from wave II)

## Out of scope

- ESLint config (Plan II), Vitest config and any `src/engine` code (Plan III), the test hook, `.env`, Playwright (Plan IV), CI, README and docs (Plan V).
- Any game content: maps, tiles, `tiles.ts`, sprites, zones, text drawn on screen, character select.
- `roundPixels`/`pixelArt`, the React store hook, the dev panel.
- Editing `CLAUDE.md` or `docs/GAME_SPEC.md`.

## Risks accepted in this plan

- `npm test` and `npm run e2e` cannot pass at the end of this plan: no tests and no configs exist yet. The repo-wide definition of done is met at the end of Plan V, not per task here.
- `npm run lint` fails until Plan II adds `eslint.config.js`. That is expected in wave I.
- The template `main` SHA may move between research and execution. Pinning at scaffold time (CD-16) fixes it from then on.
- Vite 8's exact chunking API (function `manualChunks` vs `advancedChunks`/`codeSplitting`) is MEDIUM confidence. The Done-when checks the observable outcome (a `phaser*` chunk), not the option name.
- `eslint-plugin-react-hooks` v7 compiler rules may later flag the template's ref handling in `PhaserGame.tsx`. Plan II lists the wave-I `src/ui`, `src/game` and `src/main.tsx` files in its `files_modified` so it can make minimal lint fixes there.
