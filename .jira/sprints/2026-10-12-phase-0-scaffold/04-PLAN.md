---
sprint: 2026-10-12-phase-0-scaffold
plan: IV
wave: III
goal: On the empty Phaser 4 shell, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` all exit 0 locally and in the GitHub Actions CI run for the sprint PR, the production build contains no `__GOLD_RUN__`, and the PR's Cloudflare Pages preview URL opens on a phone (owner-verified).
worktree: false
branch: jira/2026-10-12-phase-0-scaffold
issue: none
depends_on: [I, II, III]
parallel_with: []
files_modified:
  - .env
  - src/vite-env.d.ts
  - src/main.tsx
  - src/dev/testHook.ts
  - src/dev/.gitkeep
  - tsconfig.node.json
  - playwright.config.ts
  - tests/e2e/shell.spec.ts
  - tests/e2e/.gitkeep
covers:
  - D-06
  - CD-06
  - CD-07
  - CD-09
  - GOAL: npm run e2e exits 0 on the empty shell
  - GOAL: production build contains no __GOLD_RUN__
  - "RESEARCH: dynamic import of the test hook inside a statically replaced env branch; CI greps dist for __GOLD_RUN__"
  - "RESEARCH: a DEV-gated hook does not exist in any build; e2e runs on vite dev or the gate uses a VITE_* flag"
  - "RESEARCH: hook returns plain JSON snapshots via page.evaluate; addInitScript to stub Storage.setItem to throw"
  - "RESEARCH: StrictMode double mount; idempotent hook install"
  - "RESEARCH: Playwright webServer + use.baseURL; devices['Pixel 7']; workers 1 on CI"
effects:
  - HOOK-01
  - HOOK-02
  - HOOK-03
  - HOOK-04
  - HOOK-05
---

# Plan IV: Dev/test-only `window.__GOLD_RUN__` hook and Playwright e2e

**Sprint goal:** On the empty Phaser 4 shell, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` all exit 0 locally and in the GitHub Actions CI run for the sprint PR, the production build contains no `__GOLD_RUN__`, and the PR's Cloudflare Pages preview URL opens on a phone (owner-verified).

**This plan delivers:**
- the D-06 gate in `src/main.tsx`
- the test hook stub in `src/dev/testHook.ts`, installed before React renders
- a committed `.env` default that keeps the hook out of production builds
- Playwright e2e that drives the shell only through the hook, on Pixel 7 and desktop Chromium

## Files

`.env`, `src/vite-env.d.ts`, `src/main.tsx`, `src/dev/testHook.ts`, `tsconfig.node.json`, `playwright.config.ts`, `tests/e2e/shell.spec.ts`. Delete `src/dev/.gitkeep` and `tests/e2e/.gitkeep`.

## Tasks

### I. Gate and install the test hook before React renders

- **Files:** `.env`, `src/vite-env.d.ts`, `src/main.tsx`, `src/dev/testHook.ts`
- **Read first:**
  - `src/main.tsx`, `src/game/EventBus.ts`, `src/engine/store.ts`
  - CONTEXT D-06, CD-06, CD-07
  - RESEARCH.md pitfalls "A DEV-gated test hook does not exist in any build", "StrictMode double mount", "`removeListener(event)` with no handler"
  - https://vite.dev/guide/env-and-mode
- **Action:**
  1. Write `.env` (committed, CD-07), containing exactly `VITE_GOLD_RUN_DEV=false` plus one comment line: Cloudflare Preview sets it to true; production never does.
  2. Extend `src/vite-env.d.ts`: `interface ImportMetaEnv { readonly VITE_GOLD_RUN_DEV?: string }` and `interface ImportMeta { readonly env: ImportMetaEnv }`.
  3. `src/dev/testHook.ts`:
     - Imports: `gameStore` from `../engine/store`; `EventBus`, `GameEvent` from `../game/EventBus`.
     - `export interface GoldRunTestHook { readonly hookVersion: 1; isReady(): boolean; getState(): { version: number; seed: number }; newRun(seed: number): void }`.
     - `declare global { interface Window { __GOLD_RUN__?: GoldRunTestHook } }`.
     - `export function installTestHook(): void`:
       - Idempotent: if `window.__GOLD_RUN__` is already set, return.
       - Keeps a module-level `ready` flag. A named `onSceneReady` handler, registered with `EventBus.on(GameEvent.SceneReady, onSceneReady)`, sets it to true. Never call `removeListener` without the handler.
       - `getState()` returns `{ version, seed }` copied from `gameStore.getState()`: plain JSON, never the live store.
       - `newRun(seed)` calls `gameStore.getState().newRun(seed)`.
     - No player-readable strings and no `Math.random`.
  4. `src/main.tsx` (D-06, CD-06):
     - `const testHookEnabled = import.meta.env.DEV || import.meta.env.VITE_GOLD_RUN_DEV === 'true';`
     - `const ready = testHookEnabled ? import('./dev/testHook').then(({ installTestHook }) => installTestHook()) : Promise.resolve();`
     - `ready.then(renderApp, (error: unknown) => { console.error(error); renderApp(); });`
     - The literal `__GOLD_RUN__` must not appear in `src/main.tsx`; it lives only in `src/dev/testHook.ts`.
     - Do not import `gameStore` in `main.tsx`.
- **Done when:**
  - `npm run build && grep -rq "__GOLD_RUN__" dist; test $? -eq 1` succeeds: absent with no env flag (HOOK-04).
  - `VITE_GOLD_RUN_DEV=true npm run build && grep -rq "__GOLD_RUN__" dist` exits 0: present when flagged (HOOK-04). Rebuild without the flag afterwards.
  - `grep -c "__GOLD_RUN__" src/main.tsx` = 0.
  - `npm run lint` and `npm run typecheck` exit 0.
- **Covers:** D-06, CD-06, CD-07, HOOK-04

### II. Playwright config and hook-driven e2e for the shell

- **Files:** `playwright.config.ts`, `tests/e2e/shell.spec.ts`, `tsconfig.node.json`
- **Read first:**
  - `src/dev/testHook.ts`, `vite/config.dev.mjs` (port 8080), `tsconfig.node.json`
  - CONTEXT CD-09
  - `features/test-hook.feature`
  - `research-external.md` "Playwright 1.64"
  - https://playwright.dev/docs/test-webserver
- **Action:**
  1. `playwright.config.ts` (CD-09):
     - named constant `const DEV_SERVER_URL = 'http://localhost:8080';`
     - `testDir: 'tests/e2e'`, `forbidOnly: !!process.env.CI`, `retries: process.env.CI ? 1 : 0`, `workers: process.env.CI ? 1 : undefined`
     - `reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list'`
     - `use: { baseURL: DEV_SERVER_URL, trace: 'on-first-retry' }`
     - `projects: [{ name: 'mobile', use: { ...devices['Pixel 7'] } }, { name: 'desktop', use: { ...devices['Desktop Chrome'] } }]`
     - `webServer: { command: 'npm run dev', url: DEV_SERVER_URL, reuseExistingServer: !process.env.CI, timeout: 120_000 }`
  2. If `import type { GoldRunTestHook } from '../../src/dev/testHook'` fails to typecheck under `tsconfig.node.json`, add `"lib": ["ES2023", "DOM"]` and `"skipLibCheck": true` there. Change nothing else in that file.
  3. `tests/e2e/shell.spec.ts`:
     - Write a helper `waitForHook(page)` that runs `page.waitForFunction(() => window.__GOLD_RUN__?.isReady() === true, undefined, { timeout: 15_000 })`. Use a named constant for the timeout.
     - Collect `page.on('pageerror')` errors in each test.
     - Tests:
       - **HOOK-01** (both projects): goto `/`, wait for the hook. `hookVersion === 1`. `getState()` has `version === 1` and `Number.isInteger(seed)`.
       - **HOOK-02:** `newRun(1234)`, `page.reload()`, wait for the hook, `getState().seed === 1234`.
       - **HOOK-03:** `page.addInitScript` replaces `Storage.prototype.getItem`, `setItem` and `removeItem` with functions that throw `new DOMException('blocked', 'SecurityError')`. Goto `/`, wait for the hook, `newRun(9)`, `getState().seed === 9`. The pageerror list is empty.
       - **HOOK-05** (`test.skip(testInfo.project.name !== 'mobile')`): `page.locator('#game-container').boundingBox()` width/height equal `page.viewportSize()` within 1px. `await expect(page.locator('#game-container canvas')).toHaveCount(1)`, a retrying assertion. `getByTestId('overlay-root')` is attached.
     - No `page.mouse`, no `page.click` on the canvas, no canvas-coordinate input of any kind (CLAUDE.md).
- **Done when:**
  - `npx playwright install chromium && npm run e2e` exits 0, with HOOK-01..03 passing in both `mobile` and `desktop` and HOOK-05 passing in `mobile`.
  - `grep -n "mouse\|\.tap(\|click(" tests/e2e/shell.spec.ts` finds nothing.
  - `npm test` still exits 0, so Vitest does not pick up `tests/e2e`.
  - `npm run lint` and `npm run typecheck` exit 0.
- **Covers:** CD-09, HOOK-01, HOOK-02, HOOK-03, HOOK-05, GOAL: npm run e2e exits 0

## Nyquist criteria for this plan

- [ ] Hook becomes ready and returns a `{version:1, seed:int}` JSON snapshot on mobile and desktop (HOOK-01)
- [ ] `newRun(1234)` survives a reload (HOOK-02)
- [ ] The shell boots with throwing Storage and no page errors (HOOK-03)
- [ ] Unflagged `dist/` has no `__GOLD_RUN__`; flagged `dist/` has it (HOOK-04)
- [ ] Portrait Pixel 7: the game container fills the viewport, has one canvas, and the overlay root is attached (HOOK-05)

## Out of scope

- Teleport, trigger-interaction or set-beat hook methods. No world exists yet, so these arrive with Phase 1.
- The dev panel UI. Phase 1.
- WebKit/iPhone projects (deferred, CD-09).
- Running e2e against a production or preview build (D-06: e2e runs on the dev server).
- CI wiring and the CI `dist/` grep step (Plan V).
- Changing `package.json` scripts. Plan I already defines `e2e`.

## Risks accepted in this plan

- If Vite or Oxc does not constant-fold the gate even with the `.env` default, the hook chunk would ship. HOOK-04's grep catches this. The fix would be to build the gate from a `define` constant, which changes D-06's expression and therefore needs the owner's sign-off. Stop and ask rather than improvising.
- StrictMode boots, destroys and reboots the game in dev, so `isReady()` may turn true from the first instance. That is acceptable for Phase 0, which has no scene state to read. Phase 1's teleport and interaction methods must read the current game.
- Public previews carry the hook (accepted in D-06).
- WebGL in CI is the most likely CI failure. Phaser 4 deprecated the Canvas renderer, so `type: AUTO` has no fallback when WebGL is unavailable. GitHub Actions runners render through SwiftShader. If it fails to start, the game never boots, `SceneReady` never fires, and HOOK-01 times out at `waitForHook`'s 15 s limit with a misleading error. Diagnosis: a `waitForHook` timeout in CI means WebGL, not a broken hook. Remedy: Chromium launch args in `playwright.config.ts` (`--use-angle=swiftshader` / `--enable-unsafe-swiftshader`). Do not change the hook.
