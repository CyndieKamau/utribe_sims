---
sprint: 2026-10-12-phase-0-scaffold
plan: II
wave: II
goal: On the empty Phaser 4 shell, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` all exit 0 locally and in the GitHub Actions CI run for the sprint PR, the production build contains no `__GOLD_RUN__`, and the PR's Cloudflare Pages preview URL opens on a phone (owner-verified).
worktree: false             # shared tree; see Commit safety
branch: jira/2026-10-12-phase-0-scaffold
issue: none
depends_on: [I]
parallel_with: [III]
files_modified:
  - eslint.config.js
  - tests/unit/boundaries.test.ts
  - src/main.tsx
  - src/ui/App.tsx
  - src/ui/PhaserGame.tsx
  - src/game/main.ts
  - src/game/EventBus.ts
  - src/game/scenes/Boot.ts
covers:
  - D-08
  - CD-10
  - GOAL: npm run lint exits 0
  - "RESEARCH: ESLint no-restricted-imports scoped to src/engine/** and src/systems/** banning phaser, react, react-dom, zustand root, game/ui dirs"
  - "RESEARCH: no-restricted-properties for Math.random (catches destructuring)"
  - "RESEARCH: legacy .eslintrc.cjs is dead; write a fresh flat eslint.config.js"
  - "RESEARCH: eslint-plugin-react-hooks configs.flat.recommended + react-refresh"
effects:
  - BND-01
  - BND-02
  - BND-03
---

# Plan II: ESLint 10 flat config with architecture-boundary rules

**Sprint goal:** On the empty Phaser 4 shell, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` all exit 0 locally and in the GitHub Actions CI run for the sprint PR, the production build contains no `__GOLD_RUN__`, and the PR's Cloudflare Pages preview URL opens on a phone (owner-verified).

**This plan delivers:**
- `eslint.config.js`, the ESLint 10 flat config (D-08), with:
  - folder-scoped import bans for `src/engine/**` and `src/systems/**`
  - a repo-wide `Math.random` ban
- a unit test that proves those rules fire (CD-10)
- a clean `npm run lint` on the wave-I tree

## Files

`eslint.config.js`, `tests/unit/boundaries.test.ts`. The wave-I files `src/main.tsx`, `src/ui/App.tsx`, `src/ui/PhaserGame.tsx`, `src/game/main.ts`, `src/game/EventBus.ts`, `src/game/scenes/Boot.ts` may only receive the minimal edits lint requires (Task III).

Plan III runs in parallel and owns `src/engine/**`, `vitest.config.ts` and the other `tests/unit/*.test.ts` files. Do not touch them.

## Commit safety on the shared tree

The sprint runs on one branch with `worktree: false`. Each executor stages only the paths in its own `files_modified`, by name (`git add <path> ...`), never `git add -A` or `git add .`. Commits from parallel plans in the same wave are made one at a time, never concurrently.

## Tasks

### I. Write eslint.config.js (flat config, ESLint 10)

- **Files:** `eslint.config.js`
- **Read first:** `package.json` (devDependencies installed by Plan I), CONTEXT D-08 and CD-10, `research-external.md` "ESLint flat config (TS + React)", `research-patterns.md` "pure-TS boundary enforcement".
- **Action:** Write an ES module using `defineConfig` and `globalIgnores` from `eslint/config`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` and `globals`. Config blocks, in order:
  1. `globalIgnores(['dist', 'node_modules', 'playwright-report', 'test-results', 'blob-report', '.vitest'])`.
  2. `files: ['**/*.{js,mjs,ts,tsx}']`:
     - `extends: [js.configs.recommended, tseslint.configs.recommended]`
     - rule `'no-restricted-properties': ['error', { object: 'Math', property: 'random', message: 'Use the seeded RNG in src/engine/rng.ts.' }]`
     - this block applies to every file, tests included (BND-03)
  3. `files: ['src/**/*.{ts,tsx}']`: `extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite]`, `languageOptions.globals: globals.browser`.
  4. `files: ['tests/**/*.ts', '*.config.{js,ts}', 'eslint.config.js', 'vite/**/*.mjs']`: `languageOptions.globals: globals.node`.
  5. `files: ['src/engine/**/*.ts', 'src/systems/**/*.ts']`, rule `'no-restricted-imports': ['error', { … }]` with:
     - `paths`: entries for `'phaser'`, `'react'`, `'react-dom'` and `'zustand'`, each with message `'src/engine and src/systems are pure TypeScript: no Phaser, React or the React zustand entry. Use zustand/vanilla.'`
     - `patterns`: `[{ group: ['phaser/*', 'react/*', 'react-dom/*'], message: same }, { group: ['**/game', '**/game/**', '**/ui', '**/ui/**', '**/dev', '**/dev/**'], message: 'Engine and systems must not import the display layers or dev tooling.' }]`
     - `'zustand/vanilla'` and `'zustand/middleware'` must remain allowed (BND-02)
     - Fallback: if the gitignore-style `group` globs fail to match relative specifiers such as `'../game/EventBus'` (the boundaries test shows this), switch that entry to the `regex` form, e.g. `{ regex: '(^|/)(game|ui|dev)(/|$)', message: ... }`, and record the switch in EXECUTION.md
- **Done when:**
  - `grep -n "no-restricted-imports" eslint.config.js` and `grep -n "property: 'random'" eslint.config.js` each match.
  - `npx eslint --print-config src/engine/probe.ts | grep -c no-restricted-imports` ≥ 1.
  - `npx eslint --print-config src/ui/App.tsx | grep -c '"no-restricted-imports"'` = 0, so the import ban is scoped.
- **Covers:** D-08, CD-10

### II. Prove the rules fire: tests/unit/boundaries.test.ts

- **Files:** `tests/unit/boundaries.test.ts`
- **Read first:** `eslint.config.js`, `features/boundaries.feature`, the ESLint Node.js API docs for `ESLint#lintText` (https://eslint.org/docs/latest/integrate/nodejs-api), `~/.claude/skills/tdd/SKILL.md`.
- **Action:**
  - Use `import { ESLint } from 'eslint'` and `import { describe, it, expect } from 'vitest'`.
  - Create one `new ESLint({ cwd: <repo root via fileURLToPath(new URL('../..', import.meta.url))> })`.
  - Write a helper `ruleHits(code: string, filePath: string, ruleId: string): Promise<number>` that calls `eslint.lintText(code, { filePath })` and counts messages with that `ruleId`. `filePath` values are virtual (`src/engine/probe.ts` etc.); they don't need to exist.
  - Cases:
    - **BND-01:** for both `src/engine/probe.ts` and `src/systems/probe.ts`, each of these imports gives ≥1 `no-restricted-imports` hit: `import 'phaser'`, `import 'react'`, `import 'react-dom'`, `import { create } from 'zustand'`, `import { EventBus } from '../game/EventBus'`, `import App from '../ui/App'`, `import { installTestHook } from '../dev/testHook'`. Use `it.each`.
    - **BND-02:** `import { createStore } from 'zustand/vanilla'; import { persist } from 'zustand/middleware';` linted as `src/engine/probe.ts` gives 0 `no-restricted-imports` hits.
    - **BND-03:** `export const r = Math.random();` and `const { random } = Math; export const r = random();` each give ≥1 `no-restricted-properties` hit as `src/engine/probe.ts`, `src/game/probe.ts`, `src/ui/probe.tsx` and `tests/unit/probe.test.ts`.
    - **Scoping guard:** `import 'phaser'` linted as `src/game/probe.ts` gives 0 `no-restricted-imports` hits.
- **Done when:**
  - `npx vitest run tests/unit/boundaries.test.ts` exits 0, with ≥ 20 passing assertions across the `it.each` cases. It runs without `vitest.config.ts`; Vitest's default include matches. After Plan III lands, `npm test` includes it.
  - Temporarily deleting the `src/engine/**` block from `eslint.config.js` makes the test fail; restore it afterwards (red check).
- **Covers:** BND-01, BND-02, BND-03, CD-10

### III. Make `npm run lint` exit 0 on the wave-I tree

- **Files:** only if lint reports errors: `src/main.tsx`, `src/ui/App.tsx`, `src/ui/PhaserGame.tsx`, `src/game/main.ts`, `src/game/EventBus.ts`, `src/game/scenes/Boot.ts`
- **Read first:** the output of `npm run lint`, each file it flags, `~/.claude/skills/react-best-practices/SKILL.md`, `~/.claude/skills/debug/SKILL.md`.
- **Action:** Run `npm run lint`. Fix each error at its root, minimally:
  - Do not disable rules globally.
  - Do not add `eslint-disable` comments, except a single-line disable with a written reason where a React Compiler rule (`react-hooks/refs`, `react-hooks/immutability`) conflicts with the template's mount-once Phaser bridge. Record each such disable in EXECUTION.md.
  - Do not change behaviour: the mount-once guard, `destroy(true)` cleanup and scene-ready handshake must survive.
  - Engine files from Plan III may not exist yet. Lint whatever is present.
- **Done when:**
  - `npm run lint` exits 0.
  - `npm run typecheck` still exits 0.
  - `npm run build` still exits 0.
- **Covers:** D-08, GOAL: npm run lint exits 0

## Nyquist criteria for this plan

- [ ] Engine/systems imports of phaser, react, react-dom, zustand root, game/ui/dev are lint errors (BND-01)
- [ ] `zustand/vanilla` and `zustand/middleware` are allowed in engine (BND-02)
- [ ] `Math.random` (call and destructure) is a lint error in src/engine, src/game, src/ui and tests (BND-03)
- [ ] `npm run lint` exits 0 on the tree

## Out of scope

- `vitest.config.ts`, any `src/engine/**` file, other unit tests (Plan III).
- The test hook, Playwright, `.env` (Plan IV). CI wiring of `npm run lint` (Plan V).
- oxlint, `eslint-plugin-boundaries`, a separate engine tsconfig (CD-10).
- Type-aware linting (`parserOptions.project`). Not required by D-08.
- Any behavioural change to the Phaser/React bridge.

## Risks accepted in this plan

- `no-restricted-imports` checks static imports only, not dynamic `import()`, and it can't see a global `Phaser` namespace. Accepted per CD-10; reviewers and Vitest's `node` environment catch the rest.
- Plan III writes engine code in parallel. If that code trips a lint rule, Plan III fixes it in its own files. The final full-tree lint is re-run in Plan V.
- Single-line React Compiler rule disables in the template bridge may be needed. Each one is justified in EXECUTION.md.
