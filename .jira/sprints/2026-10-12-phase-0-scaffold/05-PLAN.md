---
sprint: 2026-10-12-phase-0-scaffold
plan: V
wave: IV
goal: On the empty Phaser 4 shell, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` all exit 0 locally and in the GitHub Actions CI run for the sprint PR, the production build contains no `__GOLD_RUN__`, and the PR's Cloudflare Pages preview URL opens on a phone (owner-verified).
worktree: false
branch: jira/2026-10-12-phase-0-scaffold
issue: none
depends_on: [I, II, III, IV]
parallel_with: []
files_modified:
  - .github/workflows/ci.yml
  - README.md
  - docs/ARCHITECTURE.md
  - docs/CONTENT_GUIDE.md
covers:
  - D-02
  - D-04
  - D-05
  - D-06
  - CD-13
  - CD-16
  - GOAL: CI green on the sprint PR
  - GOAL: preview URL opens on a phone
  - GOAL: all five gate commands exit 0
  - "RESEARCH: CI checks that the production dist has no __GOLD_RUN__"
  - "RESEARCH: Playwright CI: npm ci, playwright install --with-deps, no browser cache, upload playwright-report on !cancelled()"
  - "RESEARCH: Cloudflare Pages previews are public by default; Git integration needs no secrets"
  - "RESEARCH: docs/ARCHITECTURE.md and docs/CONTENT_GUIDE.md are part of the Phase 0 row"
  - "RESEARCH: README run instructions; working title Gold Run"
effects:
  - SCAF-01
  - DEL-01
  - DEL-02
  - DEL-03
  - DEL-04
---

# Plan V: CI, Cloudflare Pages previews, README and architecture docs, and the full gate

**Sprint goal:** On the empty Phaser 4 shell, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` all exit 0 locally and in the GitHub Actions CI run for the sprint PR, the production build contains no `__GOLD_RUN__`, and the PR's Cloudflare Pages preview URL opens on a phone (owner-verified).

**This plan delivers:**
- a GitHub Actions workflow that runs the whole gate
- a README that lets a newcomer run the repo and connect Cloudflare Pages (D-02)
- `docs/ARCHITECTURE.md` and `docs/CONTENT_GUIDE.md`, including the map-authoring convention for Phase 1 (D-04)
- a final local run of the full Phase 0 gate

**External-reader rule (global CLAUDE.md):** README, docs, workflow comments and commit messages must not mention decision IDs (`D-0x`, `CD-xx`), `.jira/` file names or other internal jargon. State the what and the why in plain words.

## Files

`.github/workflows/ci.yml`, `README.md`, `docs/ARCHITECTURE.md`, `docs/CONTENT_GUIDE.md`.

## Tasks

### I. GitHub Actions CI workflow

- **Files:** `.github/workflows/ci.yml`
- **Read first:** `package.json` (scripts), `playwright.config.ts`, `.nvmrc`, `.env`, CONTEXT D-06 and CD-09, `research-external.md` "Playwright 1.64" CI guidance.
- **Action:**
  - Name the workflow `CI`, triggered `on: { pull_request: {}, push: { branches: [main] } }`.
  - Set `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }` and `permissions: { contents: read }`.
  - Define one job, `check`, with `runs-on: ubuntu-latest` and `timeout-minutes: 20`.
  - Steps, each a separate named step:
    1. `actions/checkout`
    2. `actions/setup-node` with `node-version-file: .nvmrc` and `cache: npm`
    3. `npm ci`
    4. `npm run lint`
    5. `npm run typecheck`
    6. `npm test`
    7. `npm run build`. Do **not** set `VITE_GOLD_RUN_DEV`.
    8. "Test hook absent from production build":

       ```
       if grep -rq "__GOLD_RUN__" dist; then echo "::error::window.__GOLD_RUN__ leaked into the production build"; exit 1; fi
       ```

    9. `npx playwright install --with-deps chromium`. No browser cache, per Playwright guidance.
    10. `npm run e2e`
    11. `actions/upload-artifact` with `if: ${{ !cancelled() }}`, `name: playwright-report`, `path: playwright-report/`, `retention-days: 14`
  - Pin each action to its current latest major tag. Check with `gh api repos/actions/checkout/releases/latest --jq .tag_name`, and the same for `setup-node` and `upload-artifact`. The research saw checkout v7, setup-node v7 and upload-artifact v7.
- **Done when:**
  - `grep -c "run: npm run lint\|run: npm run typecheck\|run: npm test\|run: npm run build\|run: npm run e2e" .github/workflows/ci.yml` = 5.
  - `grep -c "__GOLD_RUN__" .github/workflows/ci.yml` ≥ 1.
  - `npx --yes yaml-lint .github/workflows/ci.yml`, or `python3 -c "import yaml,sys;yaml.safe_load(open('.github/workflows/ci.yml'))"`, exits 0.
  - After `/jira:execute` opens the PR, `gh pr checks` shows `check` passing (DEL-01). Record the run URL in EXECUTION.md.
- **Covers:** D-06, DEL-01, GOAL: CI green on the sprint PR

### II. README: run instructions, Cloudflare Pages setup (manual owner step), credits, and the full local gate

- **Files:** `README.md`
- **Read first:** `README.md` (2 lines today), `package.json`, `.nvmrc`, `.env`, `vite/config.prod.mjs` (output dir), CONTEXT D-02, D-06, CD-14, CD-16, the template SHA and copyright line recorded in EXECUTION.md by Plan I, `features/delivery.feature`.
- **Action:**
  1. Replace `README.md` with these sections:
     - `# Gold Run`, with one line: a browser-based 2D game prototype (playable vertical slice), working title.
     - `## Requirements`: Node 24 (`.nvmrc`); at least 22.12.
     - `## Run it`: fenced commands `npm ci`, `npx playwright install chromium`, `npm run dev` (http://localhost:8080), `npm test`, `npm run e2e`, `npm run lint`, `npm run typecheck`, `npm run build`.
     - `## Testing`: unit tests live in `tests/unit` (Vitest). E2E lives in `tests/e2e` (Playwright, Pixel 7 + desktop Chromium) and drives the game through `window.__GOLD_RUN__`, which exists only on the dev server and in preview builds.
     - `## Deploy previews`: Cloudflare Pages via its GitHub integration. Production deploys from `main`; every pull request gets a public `*.pages.dev` preview URL.
       - Settings: framework preset `None`, build command `npm run build`, build output directory `dist`, production branch `main`, environment variable `VITE_GOLD_RUN_DEV=true` on the **Preview** environment only (never Production). Node comes from `.nvmrc`.
       - State plainly: "Creating the Cloudflare Pages project and connecting this repository is a one-time manual step for the repository owner. Automation cannot do it."
       - Mention that previews include the test hook on purpose, and that the production build is checked in CI to exclude it.
     - `## Credits`: scaffolded from [phaserjs/template-react-ts](https://github.com/phaserjs/template-react-ts) at commit `<SHA from EXECUTION.md>`, used under the MIT License, followed by the template's copyright line and the MIT permission notice in a fenced block. Art credits live in `public/assets/CREDITS.md`.
  2. Run the full gate locally in order: `npm ci && npx playwright install chromium && npm run lint && npm run typecheck && npm test && npm run build && ! grep -rq "__GOLD_RUN__" dist && npm run e2e`. Record each command's exit code and the test counts in EXECUTION.md (SCAF-01). If any step fails, stop and log a deviation in EXECUTION.md that names the plan owning the failing file. Use the `debug` skill to find the root cause, then fix it only in that plan's `files_modified` paths, logging each edit as a deviation. If the fix would need a file outside every plan's Files list, stop and ask.
  3. In EXECUTION.md, add an `Owner verification pending` entry for DEL-03 with these steps:
     - connect Cloudflare Pages per the README
     - open the PR's preview URL on a phone, signed out
     - confirm a full-screen canvas loads with no login wall
     - write `preview opens on phone: yes — <url>`
- **Done when:**
  - `grep -c "npm run build\|dist\|VITE_GOLD_RUN_DEV=true\|Preview\|manual" README.md` ≥ 5.
  - `grep -n "template-react-ts" README.md` matches, and `grep -n "MIT" README.md` matches.
  - `grep -nE "D-0[0-9]|CD-[0-9]|\.jira|CONTEXT\.md" README.md` finds nothing.
  - The full gate chain in step 2 exits 0 (SCAF-01).
  - DEL-03 is pending in EXECUTION.md with the steps above. It closes only when the owner records it.
- **Covers:** D-02, CD-16, SCAF-01, DEL-02, DEL-03, GOAL: all five gate commands exit 0, GOAL: preview URL opens on a phone

### III. docs/ARCHITECTURE.md and docs/CONTENT_GUIDE.md

- **Files:** `docs/ARCHITECTURE.md`, `docs/CONTENT_GUIDE.md`
- **Read first:**
  - `CLAUDE.md` ("Architecture", "Content rules")
  - `docs/GAME_SPEC.md` sections 5 and 6
  - `src/engine/{rng,save,state,store}.ts`, `src/game/EventBus.ts`, `src/game/main.ts`, `src/dev/testHook.ts`, `src/main.tsx`, `eslint.config.js`
  - CONTEXT D-03, D-04, D-05, CD-01..CD-13
- **Action:** Describe what exists now, plus the conventions Phase 1 must follow. Write in plain prose without decision IDs.
  - **`docs/ARCHITECTURE.md`** has these sections, in order:
    - `## Layers`
      - What each `src/` folder may import.
      - The engine/systems boundary and the lint rule that enforces it.
      - Phaser displays and reports; React renders and dispatches.
      - Overlays are styled with CSS Modules.
      - Top-down orthogonal view.
    - `## Event bus`
      - The template EventBus, the `GameEvent` constants, and the rule that every `off` passes its handler.
    - `## Store and saving`
      - The vanilla store and persist.
      - `save.ts` is the only file touching storage, and why: swapping in a server later means editing only this file.
      - `SAVE_VERSION` is the single version source.
      - The migrate policy.
      - React will read through `useStore` with selectors and `useShallow`.
    - `## Seeded RNG`
      - Keyed derivation from `(seed, key)`, no cursor.
      - `freshSeed` is the only entropy source.
      - `Math.random` is banned by lint.
    - `## Test hook`
      - The gate expression.
      - Previews carry the hook and production never does, enforced by the CI grep.
      - The hook API and the "never canvas coordinates" rule.
    - `## Tooling`
      - Versions: Phaser 4, Vite 8, TypeScript 6.0, ESLint 10, Vitest, Playwright.
      - Phaser 4 `roundPixels` defaults to false and must be set deliberately when tiles arrive.
      - Prefer the Phaser 4 skills in `node_modules/phaser/skills`.
  - **`docs/CONTENT_GUIDE.md`** has these sections:
    - `## Where content lives`: `src/content` JSON for dialogue, events, NPCs, interactables, maps and the region pack. Player-readable strings never live in `.tsx` or scene files. Content is loaded through a typed loader that narrows JSON strings to the spec's unions, and that loader is added with the first content file.
    - `## Map authoring`: the convention, stated fully:
      - Maps are code/JSON 2D arrays of named tile constants, never bare numbers.
      - A single `tiles.ts` defines the tile enum and each tile's walkability.
      - Every map imports it.
      - Interactables (e.g. a dig spot, an NPC's position, the assay office) are named coordinates exported from the same map module as the grid.
      - Scenes read positions from there and never hold their own copy.
      - Orthogonal top-down grid.
      - Include a short illustrative TypeScript snippet using generic names (`Tile.Floor`, `Tile.Wall`) and mark it as an example shape, not shipped content.
    - `## Voice and banned words`: one paragraph pointing to `CLAUDE.md` "Content rules" as the single source for voice and the banned-word list. Do not copy the list.
- **Done when:**
  - `grep -c "^## Layers\|^## Event bus\|^## Store and saving\|^## Seeded RNG\|^## Test hook\|^## Tooling" docs/ARCHITECTURE.md` = 6.
  - `grep -c "^## Where content lives\|^## Map authoring\|^## Voice and banned words" docs/CONTENT_GUIDE.md` = 3.
  - `grep -n "tiles.ts" docs/CONTENT_GUIDE.md` matches.
  - `grep -niE "provenance|chain of custody|blockchain|tokenization|proof of reserve" docs/CONTENT_GUIDE.md` finds nothing. The list is pointed to, not copied.
  - `grep -nE "D-0[0-9]|CD-[0-9]" docs/ARCHITECTURE.md docs/CONTENT_GUIDE.md` finds nothing.
- **Covers:** D-04, D-05, CD-13, DEL-04

## Nyquist criteria for this plan

- [ ] Lint, typecheck, test, build, the dist hook grep and e2e all exit 0 locally, in one chain (SCAF-01)
- [ ] The CI workflow has all six gate steps, and the sprint PR's `check` job passes (DEL-01)
- [ ] The README documents run commands, Cloudflare Pages settings, the manual owner step and template credits (DEL-02)
- [ ] The owner confirms the PR preview opens on a phone; recorded in EXECUTION.md (DEL-03, manual)
- [ ] ARCHITECTURE.md and CONTENT_GUIDE.md have the required sections and the map convention (DEL-04)

## Out of scope

- Creating the Cloudflare account or project, or connecting the repo. This is a manual owner step; agents cannot do it.
- A `wrangler-action` deploy workflow or Cloudflare API tokens. The Git integration needs none.
- Workers Static Assets migration, custom domains, Cloudflare Access.
- Editing `CLAUDE.md` or `docs/GAME_SPEC.md`.
- Fixing gate failures outside the rule in Task II step 2: stop, log a deviation naming the owning plan, and fix only in that plan's files (each edit logged); if the fix would exceed every plan's Files list, stop and ask.
- `tiles.ts`, any map, any content JSON. Only the convention is documented.
- `.jira/STATE.md`, which the jira commands own.

## Risks accepted in this plan

- DEL-03 can't be closed by an agent. The sprint can finish "green pending owner verification", and the verifier treats DEL-03 as owner-attested.
- If the owner hasn't connected Cloudflare before the PR opens, no preview comment appears. The owner connects it, then re-runs the Pages build from the Cloudflare dashboard or pushes an empty commit.
- Action major versions are MEDIUM confidence. Task I checks them live.
- Cloudflare Pages is in maintenance mode, though not end-of-life. Accepted per the spec; swapping hosts later touches only the deploy settings and the README section.
