---
sprint: 2026-10-12-phase-0-scaffold
verified_at: 2026-10-13T00:00:00Z
verdict: PASS
---

# Verification: 2026-10-12-phase-0-scaffold

Goal-backward audit of the executed sprint on branch `jira/2026-10-12-phase-0-scaffold` (HEAD `ae63e8d`, unpushed). Asks: "does the codebase, as it stands now, deliver what the goal promised?"

PASS covers everything observable before the PR exists. Two outcomes cannot be observed until then: the CI run on the PR and the phone preview. They are marked `unverifiable-here (pending-after-PR)`. They are not failures, but the sprint is not closed until both are confirmed (see Next steps).

## Goal

On the empty Phaser 4 shell, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` all exit 0 locally and in the GitHub Actions CI run for the sprint PR, the production build contains no `__GOLD_RUN__`, and the PR's Cloudflare Pages preview URL opens on a phone (owner-verified).

## Goal decomposition

- [x] O1. The shell is an empty Phaser 4 shell (Phaser 4.x, template demo removed, nothing drawn, no player-readable text)
- [x] O2. `npm run lint` exits 0 locally
- [x] O3. `npm run typecheck` exits 0 locally
- [x] O4. `npm test` exits 0 locally
- [x] O5. `npm run build` exits 0 locally
- [x] O6. `npm run e2e` exits 0 locally, driving the shell through `window.__GOLD_RUN__`
- [x] O7. The production build contains no `__GOLD_RUN__`, and a flagged (preview) build does contain it
- [ ] O8. All five commands exit 0 in the GitHub Actions CI run for the sprint PR: workflow delivered, run pending-after-PR
- [ ] O9. The PR's Cloudflare Pages preview opens on a phone: config documented, owner verification pending-after-PR

## Findings

Commands were run from `/Users/cyndie/Work/ubuntu/sims_game/utribe_sims` on Node v24.13.0. To leave the repo's `dist/` untouched, the builds wrote to the session scratchpad with `--outDir`. Following the verifier role, the test suites (`npm test`, `npm run e2e`) were not re-run. For those, the Nyquist command results are cited, and an independent browser probe checks the same behaviour.

### O1. Empty Phaser 4 shell

- **Status:** delivered
- **Evidence:** `command`: `npm ls phaser vite typescript @vitejs/plugin-react eslint eslint-plugin-react-hooks zustand vitest @playwright/test --depth=0` → phaser@4.2.1, vite@8.3.4, typescript@6.0.3, @vitejs/plugin-react@6.1.2, eslint@10.12.0, eslint-plugin-react-hooks@7.1.1, zustand@5.0.15, vitest@5.0.4, @playwright/test@1.64.0.
- **Evidence:** `source-audit`: `src/game/scenes/` contains only `Boot.ts`, and `Boot.ts:11-14` only emits `GameEvent.SceneReady`. `log.js`, `.eslintrc.cjs` and the template PNGs are absent (`public/assets/` holds only `CREDITS.md`). `grep -rn "Math.random\|phaser.io\|gryzor" src vite index.html package.json` → exit 1. The browser probe (O6) read `document.body.innerText` as `""`.

### O2. `npm run lint` exits 0

- **Status:** delivered
- **Evidence:** `command`: `npm run lint` (`eslint .`) → `LINT_EXIT=0`, no output. The boundary rules are at `eslint.config.js:17-22` (Math.random) and `eslint.config.js:33-55` (engine/systems imports).

### O3. `npm run typecheck` exits 0

- **Status:** delivered
- **Evidence:** `command`: `npm run typecheck` (`tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.node.json`) → `TC_EXIT=0`.

### O4. `npm test` exits 0

- **Status:** delivered (sensed by Nyquist; not re-run by the verifier)
- **Evidence:** `command`: Nyquist results in EXECUTION.md report `npm test` as 5 files / 50 tests passed. The suite exists at `tests/unit/{boundaries,rng,save,storage-access,store}.test.ts`, and `vitest.config.ts:5` includes only `tests/unit/**/*.test.ts` in the `node` environment.

### O5. `npm run build` exits 0

- **Status:** delivered
- **Evidence:** `command`: `env -u VITE_GOLD_RUN_DEV npx vite build --config vite/config.prod.mjs --outDir <scratch>/dist-prod --emptyOutDir` (the same config as `npm run build`) → `BUILD_EXIT=0`, empty output at `logLevel: 'warning'`, so there is no manualChunks warning. It emitted `assets/phaser-DsoTNn5H.js`, `index-*.js` and `index-*.css`. The chunk split is at `vite/config.prod.mjs:11-19` (`codeSplitting.groups`). `grep -rl terser vite package.json` → exit 1.

### O6. `npm run e2e` exits 0 through the test hook

- **Status:** delivered (suite sensed by Nyquist; behaviour independently confirmed)
- **Evidence:** `command`: Nyquist reports `npm run e2e` 7 passed, 1 skipped. HOOK-05 is skipped on `desktop` by design, at `tests/e2e/shell.spec.ts:84`.
- **Evidence:** `browser`: the verifier started the dev server (`npx vite --config vite/config.dev.mjs`, port 8080) and ran a separate headless Chromium script with the Pixel 7 profile on `/`. Results: `isReady()` became true; `hookVersion` 1; `getState()` = `{"version":1,"seed":3780329380}`; after `newRun(4321)` and a reload, `getState()` = `{"version":1,"seed":4321}`; `#game-container` measured 412x839 against a 412x839 viewport; 1 canvas; `overlay-root` present; 0 `pageerror` events. The server was stopped afterwards (port 8080 is free).
- **Evidence:** `source-audit`: the hook is installed before render at `src/main.tsx:16-22`, and the install is idempotent at `src/dev/testHook.ts:26-29`.

### O7. No `__GOLD_RUN__` in the production build

- **Status:** delivered
- **Evidence:** `command`: unflagged scratch build, then `grep -rq "__GOLD_RUN__" <scratch>/dist-prod` → exit 1, with no `testHook-*.js` chunk. `VITE_GOLD_RUN_DEV=true` build, then `grep -rq "__GOLD_RUN__" <scratch>/dist-flag` → exit 0, with `testHook-CByvYo_k.js` emitted. The repo's existing `dist/` → grep exit 1.
- **Evidence:** `source-audit`: the gate expression at `src/main.tsx:16` matches D-06 exactly. The committed `.env` sets `VITE_GOLD_RUN_DEV=false`.
- **Evidence:** `external-source`: https://vite.dev/guide/env-and-mode. Environment variables that already exist when Vite runs take priority over `.env`, so the Cloudflare Preview variable overrides the committed `false`.

### O8. Five commands green in GitHub Actions on the sprint PR

- **Status:** unverifiable-here (pending-after-PR). The workflow is delivered; the run cannot exist until the PR is opened.
- **Evidence:** `artifact`: `.github/workflows/ci.yml`. It triggers on `pull_request` and on push to `main` (lines 3-6). It has separate steps for `npm ci`, Lint, Typecheck, Unit tests, Build (no flag), a `__GOLD_RUN__` dist grep that fails the job (lines 45-47), `npx playwright install --with-deps chromium`, and End-to-end tests. Node comes from `.nvmrc` (`24`).
- **Would be proven by:** `command`: `gh pr checks <PR>` showing `check` = pass, with the run URL recorded in EXECUTION.md.

### O9. Preview URL opens on a phone (owner-verified)

- **Status:** unverifiable-here (pending owner, after PR). The Cloudflare Pages project is a manual owner step (D-02).
- **Evidence:** `artifact`: `README.md:30-54` documents preset None, `npm run build`, output `dist`, production branch `main`, `VITE_GOLD_RUN_DEV=true` on Preview only, the manual-owner-step statement, and a fallback to `.nvmrc` 22. The portrait layout is backed by O6's Pixel 7 probe.
- **Would be proven by:** `browser`: the owner opens the PR's `*.pages.dev` URL on a phone while signed out, sees a full-screen canvas with no login wall, and records "preview opens on phone: yes — <url>" in EXECUTION.md.

## Source coverage

| Decision | Plan | Implemented | Evidence |
|----------|------|-------------|----------|
| D-01 Phaser 4, pinned non-interactive template | 01-PLAN.md | yes | command: `npm ls` → phaser@4.2.1; artifact: `README.md:58-59` pins SHA `c7265972…` |
| D-02 Cloudflare Pages via Git integration | 05-PLAN.md | yes (docs); project creation pending owner | artifact: `README.md:30-54` |
| D-03 CSS Modules | 01-PLAN.md | yes | source-audit: `src/ui/App.tsx:3` imports `App.module.css` |
| D-04 Map convention documented only, no tiles | 05-PLAN.md | yes | source-audit: `docs/CONTENT_GUIDE.md:19-30` (named tile constants, single `tiles.ts`, interactables in the map module); no `tiles.ts` under `src/` |
| D-05 Top-down orthogonal | 05-PLAN.md | yes | source-audit: `docs/ARCHITECTURE.md:34` |
| D-06 Test hook gate | 04-PLAN.md, 05-PLAN.md | yes | source-audit: `src/main.tsx:16-20`; command: O7 grep results; artifact: `ci.yml:45-47`; playwright `webServer` runs `npm run dev` (`playwright.config.ts:19-24`) |
| D-07 Toolchain upgrade, chunking rewritten | 01-PLAN.md | yes | command: `npm ls` versions; source-audit: `vite/config.prod.mjs:11-19` (Rolldown `codeSplitting.groups` replacing object `manualChunks`, a recorded fallback) |
| D-08 ESLint 10 flat config, boundary + Math.random | 02-PLAN.md | yes | source-audit: `eslint.config.js:17-22`, `33-55`; command: `npm run lint` exit 0 |
| D-09 Delete rule-breaking template code | 01-PLAN.md | yes | source-audit: O1 greps and file checks |
| CD-01..CD-05 store/save/state/RNG | 03-PLAN.md | yes | source-audit: `src/engine/store.ts:1-2` (`zustand/vanilla`, `zustand/middleware`), `store.ts:27-33` (version, JSON storage, partialize, migrate), `save.ts:10-38`, `state.ts:1-10`, `rng.ts:1-34` (named constants, `crypto.getRandomValues`) |
| CD-06/07/09 hook surface, `.env`, Playwright | 04-PLAN.md | yes | source-audit: `src/dev/testHook.ts:4-43`, `.env`, `playwright.config.ts:6-24` |
| CD-08 portrait RESIZE canvas | 01-PLAN.md | yes | source-audit: `src/game/main.ts:4-13`; `src/ui/App.module.css:1-6` |
| CD-10 lint-only boundary + test | 02-PLAN.md | yes | artifact: `tests/unit/boundaries.test.ts` |
| CD-11 typed bus events | 01-PLAN.md | yes | source-audit: `src/game/EventBus.ts:6-10`; `PhaserGame.tsx:58-62` passes the handler to `off` |
| CD-12 layout | 01-PLAN.md | yes | command: `git ls-files` lists `src/{engine,systems,content,game,ui,minigames,dev}`, `tests/{unit,e2e}`, `public/assets/CREDITS.md` |
| CD-13 docs | 05-PLAN.md | yes | source-audit: ARCHITECTURE.md headings at lines 6/36/55/80/93/126; CONTENT_GUIDE.md at 5/19/67; banned words point to CLAUDE.md (lines 67-71) |
| CD-14..CD-18 naming, Node, pin, scripts, tsconfigs | 01/05-PLAN.md | yes | source-audit: `package.json` (name `gold-run`, `engines >=22.12`, six scripts verbatim), `.nvmrc` = 24, `index.html:6` `<title>Gold Run</title>`, `tsconfig.json:7,17,23`, `tsconfig.node.json:6,15,20` |

All 9 locked decisions and all 18 discretion items have implementing code or docs. None are uncovered.

## Predicate coverage

Every `@req` is claimed by a plan's `effects:`. There are no unclaimed predicates.

| @req | Claimed by plan | Sensed | Evidence |
|------|-----------------|--------|----------|
| SCAF-01 | 05-PLAN.md | yes, locally (verifier: lint, typecheck, build; Nyquist: test, e2e) | command: O2-O6 |
| SCAF-02 | 01-PLAN.md | yes, verifier | command: `npm ls …` (O1) |
| SCAF-03 | 01-PLAN.md | yes, verifier | command: scratch build → `phaser-DsoTNn5H.js`, no warnings, no terser |
| SCAF-04 | 01-PLAN.md | yes, verifier | source-audit: O1 greps and file checks |
| SCAF-05 | 01-PLAN.md | yes, verifier | command: `git ls-files`; `.gitignore` lists node_modules, dist, test-results, playwright-report, .vitest |
| BND-01..03 | 02-PLAN.md | yes, Nyquist | command: `tests/unit/boundaries.test.ts` |
| STO-01..04 | 03-PLAN.md | yes, Nyquist | command: `tests/unit/rng.test.ts`, `save.test.ts`, `store.test.ts` |
| HOOK-01..03, HOOK-05 | 04-PLAN.md | yes, Nyquist + verifier browser probe | command: `tests/e2e/shell.spec.ts`; browser: O6 probe |
| HOOK-04 | 04-PLAN.md | yes, verifier | command: O7 flagged and unflagged grep |
| DEL-01 | 05-PLAN.md | pending, CI after PR | artifact: `ci.yml`; needs `gh pr checks` |
| DEL-02 | 05-PLAN.md | yes, inspection | artifact: `README.md` |
| DEL-03 | 05-PLAN.md | pending, owner/human | N/A: requires a real phone and a connected Cloudflare project |
| DEL-04 | 05-PLAN.md | yes, inspection | source-audit: doc headings (CD-13 row) |

## CLAUDE.md and GAME_SPEC.md invariants

- Engine purity: `src/engine/*` imports only `zustand/vanilla`, `zustand/middleware` and sibling modules (source-audit: `grep "from 'zustand'" src/engine` empty; lint exit 0).
- No `Math.random`: grep over `src` is empty; lint bans it everywhere (`eslint.config.js:17-22`).
- One save module: `grep -rn localStorage src | grep -v src/engine/save.ts` → exit 1.
- One event bus: React reaches Phaser only through `EventBus` and `StartGame` (`src/ui/PhaserGame.tsx:3-4,58`); there are no scene-to-component calls.
- No player-readable strings and no banned words: the banned-word grep over `src` and `index.html` → exit 1; body text is empty in the browser probe.
- Spec section 6 layout: matches (CD-12 row). No unexplained top-level directories (`vite/` comes from the template).

## Verdict

**PASS.** All 7 locally observable outcomes are delivered, and all 9 locked decisions and 18 discretion items are implemented. O8 (CI on the PR) and O9 (phone preview) are unverifiable here until the PR exists. They are not failures, and the sprint goal is not fully closed until both are recorded.

## Next steps

Pending after the PR (required to close the goal):
1. DEL-01 / O8: open the PR, then run `gh pr checks <PR>` and confirm the `CI / check` job passes. Record the run URL in EXECUTION.md. The first CI-only risk is `npx playwright install --with-deps chromium` on ubuntu-latest with Node 24.
2. DEL-03 / O9: the owner creates the Cloudflare Pages project per `README.md:38-46`, sets `VITE_GOLD_RUN_DEV=true` on Preview only, opens the PR's `*.pages.dev` URL on a phone while signed out, and records `preview opens on phone: yes — <url>` in EXECUTION.md.

Non-blocking findings:
3. Commits `66e4c3e` and `95ca28f` carry `Refs: 2026-10-12-phase-0-scaffold plan II task …` trailers. This breaks the external-reader commit rule. Reword them before pushing if wanted (the executor already flagged this). **Resolved before push:** trailers removed, trees unchanged.
4. `docs/GAME_SPEC.md` section 5 still marks "Top-down perspective" as `[CONFIRM]`, but D-05 records the owner's confirmation. The spec should be updated by the owner. Do not resolve it silently.
5. The page background is set twice: `src/ui/global.css:6` has `#000` and `src/game/main.ts:4` has `SHELL_BACKGROUND_COLOR = '#1b1b1b'`. This is cosmetic.
