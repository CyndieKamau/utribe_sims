# Research: external — 2026-10-12-phase-0-scaffold

## Summary

- **The official template now ships Phaser 4, not Phaser 3.** `phaserjs/template-react-ts` main has pinned `"phaser": "4.0.0"` since 2026-04-10 (Phaser 4.0.0 released that day; latest is 4.2.1). Both `npm create @phaserjs/game` and a plain clone fetch `main`, so you get Phaser 4. The last Phaser 3 commit is `9759ec1` (`"phaser": "^3.90.0"`). The v4 bump changed only `package.json`, so the bridge code (`PhaserGame.tsx`, `EventBus.ts`, scenes) is the same in both. Phaser 3's last release is 3.90.0 (2025-05-23), with nothing since. Phaser's own news post says "there's no reason to start on Phaser 3". The spec has Phaser 3 as **Locked** (§5), so this is a conflict for the planner/owner.
- **The template's tooling is about two majors behind 2026 releases.** It ships Vite ^6.3, TypeScript ~5.7, ESLint ^9 with a **legacy `.eslintrc.cjs`** (ESLint 9/10 do not read it by default), and has **no `lint` or `test` script**. Upgrading has traps. Vite 8 removed the object form of `manualChunks` (the template's prod config uses it). TypeScript 7.0.2 is `latest` on npm, but typescript-eslint 8.71 supports only `typescript <6.1.0`. Vitest 5 needs Node >=22.12 and Vite >=6.4.
- **Zustand 5.0.15 `persist` already has the hooks the spec needs.** It has `version` + `migrate`, a custom `StateStorage` (a natural single seam for `saveGame`/`loadGame`), and `partialize`. It degrades to in-memory with a warning when `getStorage()` throws. But `setItem` exceptions (quota, blocked) are **not** caught by Zustand.
- **Playwright 1.64 handles the needs here.** It has `webServer` + `devices[...]` emulation and launches Chromium with `--enable-unsafe-swiftshader` (WebGL works headless in CI). Playwright officially **advises against caching browser binaries** in CI. iPhone device descriptors default to WebKit, so CI must install WebKit too.
- **Deploy-preview options differ mainly on phone access and free-tier limits:**
  - **Vercel Hobby:** previews can sit behind a Vercel login, and the plan is non-commercial-only.
  - **Netlify Free:** 300 credits per month, with a hard pause when they run out. Deploy previews cost 0 credits; production deploys cost 15.
  - **Cloudflare Pages:** free, 500 builds per month, previews public by default.
  - **GitHub Pages:** free for this public repo, but PR previews need a third-party action and the "deploy from branch" mode.

## Findings

### Standard Stack — versions as of 2026-10-12 (npm registry)

| Package | Latest | Template ships | Notes |
|---|---|---|---|
| phaser | 4.2.1 (2026-07-09) | 4.0.0 (main) / ^3.90.0 (`9759ec1`) | 3.90.0 is the last 3.x (2025-05-23). MIT |
| react / react-dom | 19.3.0 | ^19.0.0 | |
| vite | 8.3.4 (8.0.0 on 2026-03-12) | ^6.3.1 | Vite 8 = Rolldown + Oxc. Node ^20.19 or >=22.12 |
| @vitejs/plugin-react | 6.1.2 (peer `vite ^8`) | ^4.3.4 | v6 requires Vite 8 |
| typescript | 7.0.2 `latest`; 6.0.3; 5.9.3 | ~5.7.2 | create-vite now pins `~6.0.2` |
| typescript-eslint | 8.71.2 | ^8.26.1 | peer `typescript >=4.8.4 <6.1.0`, `eslint ^8.57 / ^9 / ^10` |
| eslint | 10.12.0 (10.0.0 on 2026-02-06) | ^9.22.0 | |
| eslint-plugin-react-hooks | 7.1.1 | ^5.2.0 | v7 adds React Compiler rules to `recommended` |
| eslint-plugin-react-refresh | 0.5.7 (peer eslint ^9/^10) | ^0.4.19 | |
| oxlint | 1.87.0 | — | create-vite's React templates switched to oxlint on 2026-06-15 |
| zustand | 5.0.15 (2026-08-13) | — | peer react >=18, use-sync-external-store, immer optional |
| vitest | 5.0.4 (5.0.0 on 2026-09-03) | — | Node ^22.12 / ^24 / >=26; peer vite ^6.4 / ^7 / ^8 |
| @playwright/test | 1.64.0 | — | container `mcr.microsoft.com/playwright:v1.64.0-noble` |
| jsdom / happy-dom | 30.1.2 / 21.0.1 | — | only needed if unit tests touch the DOM. Engine tests can run with `environment: 'node'` (the Vitest default) |
| motion / framer-motion | 14.1.0 / 14.1.0 | — | Framer Motion is now published as `motion` (import `motion/react`). `framer-motion` is still published in parallel |
| html-to-image | 1.11.13 (2025-04) | — | not needed in Phase 0 |
| @tailwindcss/vite | 4.3.3 (peer vite ^5.2 to ^8) | — | for the styling [OPEN] |

### The Phaser template — repo, scaffolding, structure

- **Repo:** https://github.com/phaserjs/template-react-ts. MIT, not archived, 202 stars, last push 2026-04-21. Open PR #9 "Modernize Phaser 4 React TypeScript template" (flat ESLint, CSS modules, React Compiler, Husky, `__DEV__` global) is unmerged. Open PR #3 replaces `forwardRef` with ref-as-prop for React 19.
- **Scaffolding routes:**
  1. `npm create @phaserjs/game@latest <folder>` (`@phaserjs/create-game` 1.3.2). This is an **interactive** prompt (framework / language / "clean" vs demo skeleton). It resolves templates via `https://phaser.io/r/create-game-template/template-{name}`, which 302-redirects to `https://github.com/phaserjs/template-react-ts/archive/refs/heads/main.zip`. So it always fetches `main` (Phaser 4). The npm package `create-phaser-game` (1.0.0, 2022) is a different, stale package.
  2. `git clone` or `npx degit phaserjs/template-react-ts#<ref>` (degit 3.10.0; alternatives tiged 2.12.8, giget 3.3.1). This route is non-interactive and can target a commit. `#9759ec17afa15ecf4ce96d8747df62f3935496f8` is the Phaser 3.90 state. `#main` is Phaser 4.0.0.
  3. Clone `main` and change `"phaser"` to `3.90.0`. This is equivalent to route 2 because commit `e15eaec` ("phaser update 4.0.0") touched only `package.json`.
- **Structure on main:**
  - `src/main.tsx` (React root, **wrapped in `<React.StrictMode>`**), `src/App.tsx` (demo buttons), `src/PhaserGame.tsx` (bridge), `src/game/EventBus.ts`, `src/game/main.ts`
  - scenes `Boot`/`Preloader`/`MainMenu`/`Game`/`GameOver`
  - `public/style.css`, `public/assets/{bg,logo,star}.png`
  - `vite/config.dev.mjs` + `vite/config.prod.mjs` (no root `vite.config.*`)
  - `tsconfig.json` (strict, `moduleResolution: bundler`, `strictPropertyInitialization: false`), `tsconfig.node.json`, `.eslintrc.cjs`, `log.js`
- **Bridge mechanics:**
  - `EventBus` is a module-level `new Phaser.Events.EventEmitter()`.
  - `PhaserGame` creates the game in `useLayoutEffect` behind a `game.current === null` guard, and cleans up with `game.destroy(true)`.
  - Scenes emit `'current-scene-ready'` with `this`. React holds `{game, scene}` on a forwarded ref.
  - The demo `App.tsx` calls scene methods directly (`scene.changeScene()`, `scene.moveLogo()`, `scene.add.sprite`). That conflicts with this repo's "no direct calls between scenes and components" rule (CLAUDE.md), so it is demo code to delete, not a pattern to imitate.
- **Game config:** fixed `width: 1024, height: 768`, `type: AUTO`, **no `scale` config**. That means no FIT/RESIZE behaviour for portrait phones out of the box.
- **Scripts:**
  - `dev` is `node log.js dev & vite --config vite/config.dev.mjs`. `log.js` sends an anonymous GET to `gryzor.co` (Phaser Studio telemetry). The README documents the `dev-nolog`/`build-nolog` scripts and deleting `log.js` as opt-outs.
  - Dev server port is 8080, with `base: './'` in both configs.
  - Prod build uses terser (`passes: 2`) and `manualChunks: { phaser: ['phaser'] }`.
- **`package.json` has no `"type": "module"`.** `log.js` uses `require` (CJS). Adding `"type": "module"` (for example for an `eslint.config.js`) breaks `log.js` unless it is renamed or removed.

### Phaser 3 vs 4 (SOTA) — relevant to the Locked "Phaser 3" decision

- The v4 migration guide (`changelog/v4/4.0/MIGRATION-GUIDE.md`) covers these changes:
  - the WebGL renderer was rewritten (pipelines replaced by render nodes)
  - FX and masks became Filters
  - `BitmapMask` was removed
  - the tint system changed
  - `Geom.Point` became `Vector2`
  - `Mesh`/`Plane` were removed
  - the Canvas renderer is deprecated
  - **`roundPixels` now defaults to `false`** (was `true`), which matters for pixel-art tiles
- The guide also says: "If your game only uses the standard Phaser API (Sprites, Text, Tilemaps, etc.), the new renderer should work transparently."
- Phaser's "Phaser 3 vs Phaser 4" post (2026-05) lists tilemaps, Arcade physics, sprites, cameras, input, scenes and tweens as "likely unchanged". It adds a `TilemapGPULayer` (one quad per layer, described as "a major win … especially on mobile"). It does not state a Phaser 3 end-of-life date.
- The Phaser 4 npm package ships agent skill files, including `skills/v3-to-v4-migration/SKILL.md` (seen via unpkg).

### Zustand v5 `persist` (docs: `docs/reference/middlewares/persist.md`, `docs/reference/integrations/persisting-store-data.md`)

- **Signature:** `persist<T, U = T>(stateCreatorFn: StateCreator<T, [], []>, persistOptions: PersistOptions<T, U>)`. In TypeScript the usage is `create<T>()(persist((set, get) => ({...}), { name, ... }))`.
- **Options:**
  - `name` (required key)
  - `storage` (default `createJSONStorage(() => localStorage)`)
  - `partialize`
  - `version` (default `0`): "if the version in the storage does not match the version in the code, the stored value won't be used"
  - `migrate(persistedState, version)` (may be async)
  - `merge` (default is a **shallow** merge, so nested objects such as `npcs` or `batch` are replaced, not deep-merged, unless a custom `merge` is given)
  - `onRehydrateStorage`, `skipHydration`
- **API:** `store.persist.{getOptions,setOptions,clearStorage,rehydrate,hasHydrated,onHydrate,onFinishHydration}`.
- **Hydration timing:** with sync storage (localStorage) "the Zustand store will already have been hydrated at its creation". With async storage it hydrates in a microtask.
- **Error behaviour (source `src/middleware/persist.ts`):**
  - `createJSONStorage` wraps `getStorage()` in try/catch and returns `undefined` when it throws.
  - When storage is `undefined`, persist runs as a plain store and logs `[zustand persist middleware] Unable to update item '<name>', the given storage is currently unavailable.`
  - `setItem` calls `storage.setItem(name, JSON.stringify(...))` with **no try/catch**, so a `QuotaExceededError`/`SecurityError` throws out of `set()`.
  - A version mismatch with no `migrate` logs an error and drops the stored state.
- **v5 breaking changes** (`migrating-to-v5.md`):
  - persist **no longer writes the initial state at store creation**
  - selectors returning new references can cause infinite loops (use `useShallow`)
  - `use-sync-external-store` is a peer dependency for `zustand/traditional`

### Vitest 5

- Breaking changes in 5.0.0:
  - requires Node 22 and Vite 6.4
  - **no longer looks up config files in ancestor directories**
  - clears mocks before each test by default
  - fails on un-awaited async assertions
  - reports go to `.vitest/`
- Default `include` is `['**/*.{test,spec}.?(c|m)[jt]s?(x)']` and default environment is `node` (`packages/vitest/src/defaults.ts:8,57`). Playwright `tests/e2e/*.spec.ts` files match that glob, so they are picked up unless excluded or `include` is narrowed.
- The template has no root `vite.config.*`. Vitest auto-discovers only `vitest.config.*`/`vite.config.*`, so a Vitest config has to be added or pointed at.

### Playwright 1.64

- **`webServer`** options: `command`, `url` (`port` deprecated), `reuseExistingServer: !process.env.CI`, `timeout` (default 60 s), `stdout`/`stderr`, `env` (defaults to `process.env` + `PLAYWRIGHT_TEST=1`), `cwd`, `gracefulShutdown`, `name`, `wait` (regex on stdout). Use it together with `use.baseURL`.
- **Mobile emulation:** `projects: [{ name, use: { ...devices['Pixel 7'] } }]`. Override `isMobile`/`viewport` *after* the spread.
  - `Pixel 7`: chromium, 412×839, `isMobile`, `hasTouch`
  - `iPhone 15`: **webkit**, 393×659
  - `iPhone 13`: **webkit**, 390×664
  - Available names include Pixel 2–10 and iPhone 11–17. `Galaxy S24` also exists.
- **WebGL in headless CI:** Playwright adds `--enable-unsafe-swiftshader` to every Chromium launch (`packages/playwright-core/src/server/chromium/chromium.ts:377-378`, referencing crbug 40277080). This matters because Chromium 139+ no longer falls back to SwiftShader automatically.
- **CI guidance (playwright.dev/docs/ci):**
  - "Caching browser binaries is not recommended, since the amount of time it takes to restore the cache is comparable to the time it takes to download the binaries." OS dependencies can't be cached anyway.
  - The example workflow is `actions/setup-node` `lts/*` → `npm ci` → `npx playwright install --with-deps` → `npx playwright test` → `upload-artifact` of `playwright-report/` on `!cancelled()`.
  - It recommends `workers: process.env.CI ? 1 : undefined`.
  - Alternatively, run the job in the `mcr.microsoft.com/playwright:v1.64.0-noble` container.
- Current action majors: `actions/checkout` v7, `actions/setup-node` v7, `actions/cache` v6, `actions/upload-artifact` v7, `actions/deploy-pages` v5.

### Dev-only test hook gating (Vite env)

- `import.meta.env.DEV`/`PROD` are statically replaced, and `if (import.meta.env.DEV) {}` blocks are tree-shaken from production builds (`docs/guide/env-and-mode.md:3-9`).
- `vite build --mode test` keeps `NODE_ENV=production`, so `DEV` stays `false`. Only `NODE_ENV=development vite build` (or `NODE_ENV=other`) gives `DEV === true` in a build (same doc, lines 205-222).
- Running e2e against a production build therefore drops a `DEV`-gated `window.__GOLD_RUN__`, unless the gate uses `MODE` or a custom `VITE_*` flag.

### ESLint flat config (TS + React)

- The last ESLint-based create-vite `template-react-ts` `eslint.config.js` (before 2026-06-15) is the canonical shape:
  - `defineConfig([globalIgnores(['dist']), { files: ['**/*.{ts,tsx}'], extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite], languageOptions: { globals: globals.browser } }])`
  - imports come from `@eslint/js`, `globals`, `typescript-eslint` and `eslint/config`
- `eslint-plugin-react-hooks` v7 README: `reactHooks.configs.flat.recommended` (or `'recommended-latest'`) now includes React Compiler rules (`immutability`, `refs`, `globals`, `set-state-in-effect`, etc.) on top of `rules-of-hooks`/`exhaustive-deps`.
- **SOTA:** create-vite's React templates switched their default linter to **oxlint** on 2026-06-15 (vitejs/vite#22638), with ESLint kept as an option. The `_oxlintrc.json` uses `plugins: ["react","typescript","oxc"]`.
- The template's `.eslintrc.cjs` is eslintrc format. ESLint 9+ needs `ESLINT_USE_FLAT_CONFIG=false` to read it, and ESLint 10 drops eslintrc entirely (per ESLint 10 release; not re-verified here).

### Deploy-preview options (per-PR URL openable on a phone)

**Vercel (Hobby)**
- **Cost and limits:** free, 100 deployments per day. The fair-use guidelines restrict Hobby to **"non-commercial, personal use only"**.
- **PR previews:** yes, through the GitHub app; a preview URL per commit and per branch.
- **Access from a phone:** Deployment Protection (Vercel Authentication) sends visitors without access to "a Vercel login redirect". Hobby can disable it per project or use Shareable Links. Password Protection is not available on Hobby.
- **Secrets needed:**
  - Git integration: none.
  - CLI/Actions route: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- **Pitfall:** whether protection is on by default for a new project is not stated on the fetched page. Community reports say Standard Protection is on by default (unverified).

**Netlify (Free)**
- **Cost and limits:** $0, 300 credits per cycle.
  - A production deploy costs 15 credits (about 20 per cycle).
  - Deploy previews and branch deploys cost **0 credits**, but their traffic counts (20 credits per GB, 2 credits per 10k requests).
- **PR previews:** yes, Deploy Previews come through the Git integration.
- **Access from a phone:** public by default.
- **Secrets needed:**
  - Git integration: none.
  - Actions route (`nwtgck/actions-netlify` v4.0.0): `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`.
- **Pitfall:** at the hard limit, "all of your web projects … are paused" with "Site not available", and Free cannot buy more. Forum threads from Jul–Sep 2026 report free teams stuck on "operational credits" with production deploys paused.

**Cloudflare Pages**
- **Cost and limits:** free. 500 builds per month, 1 concurrent build, 20-minute timeout, 20,000 files, 25 MiB per file.
- **PR previews:** yes, unlimited. Each PR from the same repo gets a URL, plus a per-branch alias and a per-commit hash URL. PRs from forks are not covered.
- **Access from a phone:** "By default, preview deployments are enabled and available publicly". Cloudflare Access can restrict them.
- **Secrets needed:**
  - Git integration: none.
  - `cloudflare/wrangler-action` v4.1.3: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- **Pitfall:** Cloudflare docs position Workers static assets as the broader product and offer a Pages→Workers migration guide. Workers Builds previews "do not yet have the same level of configurability as Pages". Third-party sources call Pages "maintenance mode" (unverified).

**GitHub Pages**
- **Cost and limits:** free for a public repo (this repo is public).
- **PR previews:** not native. `rossjrw/pr-preview-action` v1.8.1 deploys to `gh-pages/pr-preview/pr-N/` and comments the URL, with an optional QR code.
- **Access from a phone:** public.
- **Secrets needed:** only `GITHUB_TOKEN`. Requires Settings → Actions → "Read and write permissions".
- **Pitfalls:**
  - Requires the "Deploy from a branch" Pages source. The "GitHub Actions" source "does not work with this action".
  - The main deploy must not force-push over `pr-preview/`.
  - No fork PRs.
  - The template's `base: './'` keeps asset paths relative, which suits sub-path hosting.

### [OPEN] Map authoring — options

| Option | How it loads in Phaser | Tradeoffs |
|---|---|---|
| Tiled editor (1.12.2, 2026-05-27) → Tiled JSON | `this.load.tilemapTiledJSON(key, url)` → `make.tilemap({ key })`. Supports orthogonal, isometric, hex and staggered (3.50+) | Pros: visual editing; object layers (interactables, spawn points); per-tile properties for collision (`setCollisionByProperty`). Cons: a GUI agents can't drive; **external tilesets unsupported** ("Use Embed Tileset and re-export", `ParseTilesets.js:36`); **layer compression unsupported** (`ParseTileLayers.js:78-79`); verbose GID/`firstgid` JSON makes diffs hard to review |
| Code/JSON 2D arrays | `make.tilemap({ data: number[][], tileWidth, tileHeight })` (`ParseToTilemap.js:27,48-51`, format `ARRAY_2D`) | Pros: agent-authorable; diff-friendly; fits `src/content` JSON. Cons: one layer per array-built tilemap (extra layers need more maps or `putTileAt`); no visual preview; collision indices and interactables live in parallel structures |
| Hand-authored Tiled-format JSON (no editor) | same as Tiled | Pros: agents write it; the owner can still open it in Tiled later. Cons: Tiled schema verbosity; easy to get `firstgid`/flip bits wrong |
| CSV | `load.tilemapCSV` (format `CSV`) | Single layer; 0-based indices (vs Tiled's 1-based) |
| LDtk | no official Phaser loader; last LDtk release v1.5.3 (2024-01-15) | Community parsers only; slow release cadence |

### [OPEN] Overlay styling — options (React over a running canvas)

| Option | Runtime cost | Setup in Vite 8 | Notes |
|---|---|---|---|
| Vanilla/global CSS | none | built in (template already uses `public/style.css`) | global namespace; no scoping |
| CSS Modules | none (build-time class hashing) | built in, `*.module.css` | scoped; typed names need a d.ts or plugin; the template's own modernize PR #9 adopts CSS modules |
| Tailwind v4.3.3 | none (build-time CSS) | `@tailwindcss/vite` (peer vite ^8 ok), `@import "tailwindcss"` | long className strings in TSX; CSS-first config in v4 (no `tailwind.config.js` required) |
| vanilla-extract 1.21 | none (zero-runtime, TS-authored) | `@vanilla-extract/vite-plugin` 5.2.6 | typed styles; extra build plugin |
| Runtime CSS-in-JS (styled-components 6.6, Emotion 11.14) | style injection at render | runtime libs | per-render style work on top of the canvas. styled-components entered "maintenance mode" in Mar 2025 (maintainer later posted a path forward, Mar 2026) |

Vite 8 minifies CSS with Lightning CSS by default (`docs/guide/migration.md:224-226`).

### [OPEN/CONFIRM] Perspective — options

- **Top-down orthogonal:** the simplest grid for tap-to-move pathing and collision. Kenney "Tiny Town" (CC0, 16×16, 130 files) is an example pack.
- **¾ "top-down RPG" (oblique sprites on an orthogonal grid):** the same tilemap code. Sprites need y-sorted depth.
- **Isometric:** Phaser supports isometric tilemaps from Tiled since 3.50 (`CHANGELOG-v3.50.md:887`). It adds screen↔tile conversion and depth-sorting complexity for tap-to-move. Code/JSON 2D-array maps are orthogonal-only by default (assumption from the `ARRAY_2D` parser path; not verified).
- **Side-view:** a poor fit with "walk up to an interactable" across a site.
- **Click-through scenes:** the spec's own fallback if walking fails the Phase 1 gate (§7).

### Common Pitfalls (library-reported / source-verified)

1. **StrictMode double-mount creates two Phaser games in dev.**
   - What happens: React runs "one extra setup+cleanup cycle in development for every Effect" (react.dev StrictMode). `Game.destroy()` only "Flags this Game instance as needing to be destroyed on the next frame" (`phaser/src/core/Game.js:716,732-738`, v3.90.0). The template's setup→cleanup→setup therefore briefly has two `Phaser.Game` instances and two canvases.
   - Effect on this repo: scene-registered `EventBus` listeners from the first instance survive unless scenes remove them on shutdown.
   - Warning sign: duplicate event handling or two canvases in dev only.
2. **The `EventBus` singleton pulls in Phaser.** `EventBus.ts` imports `Events` from `phaser`. Any pure-TS engine module that imports `EventBus` drags Phaser into Vitest's `node` environment.
3. **`removeListener('current-scene-ready')` with no handler removes all listeners for that event** (`PhaserGame.tsx` cleanup). This is eventemitter3 semantics.
4. **Vite 8 rejects the template's `manualChunks` object form.** "The object form `output.manualChunks` option is not supported anymore", and `build.rollupOptions` is renamed to `build.rolldownOptions`. Terser is also no longer the default minifier (Oxc is).
5. **TypeScript `latest` is 7.x, but typescript-eslint peers `<6.1.0`.** A bare `npm i -D typescript` breaks type-aware linting.
6. **The legacy `.eslintrc.cjs` is ignored by ESLint 9/10 flat-config mode.** Linting silently runs with no config, or errors.
7. **Vitest's default glob picks up Playwright `*.spec.ts`.**
8. **Zustand `persist` `setItem` is unguarded.** The spec requires all storage access in try/catch (§5), and that is not satisfied by `createJSONStorage(() => localStorage)` alone.
9. **The template's fixed 1024×768 canvas with no `scale` config** does not adapt to portrait phones.
10. **Phaser 4 `roundPixels` default flipped to `false`.** Pixel-art tiles may shimmer or seam if this isn't set.
11. **`log.js` network call on every `npm run dev`/`build`** in CI and agents. Opt-outs are documented.
12. **Playwright iPhone devices default to WebKit.** `npx playwright install chromium` alone isn't enough for an iPhone project.
13. **Vercel previews may require a Vercel login on the phone.** Netlify Free pauses all sites at the credit limit.

### Don't Hand-Roll (external half)

- The Phaser/React bridge: use the template's `PhaserGame.tsx` + `EventBus.ts` (a brief constraint).
- Persistence versioning and migration: Zustand `persist` `version`/`migrate`/custom `StateStorage`.
- Dev-server lifecycle for e2e: Playwright `webServer`.
- Mobile viewport/touch emulation: Playwright `devices[...]`.
- PR preview comments: the provider's Git integration or `rossjrw/pr-preview-action`.
- Tiled parsing: Phaser's built-in `tilemapTiledJSON`.

## Open questions

1. **Phaser 3 vs 4.** The spec locks Phaser 3, but the official template's `main` is Phaser 4 and Phaser 3 has had no release in 17 months. The decision needs the owner (CLAUDE.md: "stop and ask when a locked decision would have to change"). If Phaser 3 stays, the scaffold route has to be the `9759ec1` commit or a version pin.
2. **Upgrade the template's toolchain in Phase 0, or keep its versions?** Options are Vite 6→8, TS 5.7→6.0, ESLint 9→10 flat, react-hooks 5→7. The decision interacts with pitfalls 4–6.
3. **Linter choice:** ESLint flat config (spec says "linting"; global CLAUDE.md lists `npx eslint`) or oxlint (the create-vite default since 2026-06).
4. **E2E target:** run against the dev server or a build? This determines how `window.__GOLD_RUN__` is gated (`DEV` vs `MODE`/`VITE_*` flag). Also: should the phone preview build expose the test hook and dev panel?
5. **Is this project commercial?** This decides whether Vercel Hobby's non-commercial clause applies.
6. **Is ESLint 10's removal of eslintrc confirmed?** Not fetched directly; verify if the plan relies on it.
7. **Is Vercel Authentication on by default for new Hobby projects?** Not confirmed from official docs.

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view`, run 2026-10-12): versions, release dates, peer deps and engines for every package in the Standard Stack table. These are authoritative publish metadata.
- https://github.com/phaserjs/template-react-ts: `package.json` (main + `9759ec1`), `src/PhaserGame.tsx`, `src/game/EventBus.ts`, `src/game/main.ts`, `src/main.tsx`, `src/App.tsx`, `.eslintrc.cjs`, `log.js`, `vite/config.*.mjs`, `tsconfig.json`, README, the compare `9759ec1...e15eaec`, PRs #3 and #9. This is the official source, read via the GitHub API.
- https://github.com/phaserjs/create-game: README and `phaser-creator/index.js` (template URL pattern), plus `curl -I` on the phaser.io redirect. Official CLI source.
- https://github.com/phaserjs/phaser `changelog/v4/4.0/MIGRATION-GUIDE.md`, `changelog/v3/3.50/CHANGELOG-v3.50.md:887`, and v3.90.0 `src/core/Game.js`, `src/tilemaps/ParseToTilemap.js`, `src/tilemaps/parsers/tiled/ParseTilesets.js`, `ParseTileLayers.js`, `Formats.js`. Official source and docs.
- https://phaser.io/news/2026/05/phaser-3-vs-phaser-4. Official Phaser post.
- https://github.com/pmndrs/zustand `docs/reference/middlewares/persist.md`, `docs/reference/integrations/persisting-store-data.md`, `docs/reference/migrations/migrating-to-v5.md`, `src/middleware/persist.ts`. Official docs and source.
- https://github.com/vitest-dev/vitest/releases/tag/v5.0.0 and `packages/vitest/src/defaults.ts`. Official release notes and source.
- https://github.com/vitejs/vite `docs/guide/migration.md`, `docs/guide/env-and-mode.md`, `packages/create-vite/template-react-ts/` (package.json, `_oxlintrc.json`, prior `eslint.config.js`). Official docs and source.
- https://playwright.dev/docs/test-webserver, https://playwright.dev/docs/ci, https://playwright.dev/docs/emulation. Official docs.
- https://github.com/microsoft/playwright `packages/isomorphic/deviceDescriptorsSource.json` and `packages/playwright-core/src/server/chromium/chromium.ts:377-378`. Official source.
- https://github.com/facebook/react `packages/eslint-plugin-react-hooks/README.md`. Official plugin docs.
- https://react.dev/reference/react/StrictMode. Official React docs.
- https://vercel.com/docs/plans/hobby, https://vercel.com/docs/deployment-protection, https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication. Official docs.
- https://www.netlify.com/pricing/ and https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/. Official pricing and docs.
- https://developers.cloudflare.com/pages/configuration/preview-deployments/, https://developers.cloudflare.com/pages/platform/limits/, https://developers.cloudflare.com/workers/static-assets/migrate-from-pages/. Official docs.
- https://github.com/rossjrw/pr-preview-action README and releases (v1.8.1). The action's own documentation.
- https://kenney.nl/assets/tiny-town. Publisher page showing the CC0 licence.

### Secondary (MEDIUM confidence)
- GitHub Releases API for action majors (checkout v7, setup-node v7, cache v6, upload-artifact v7, deploy-pages v5, wrangler-action v4.1.3, actions-netlify v4.0.0) and Tiled v1.12.2 / LDtk v1.5.3. These are authoritative tags, but I did not check action usage docs per version.
- https://unpkg.com/phaser@4.2.1/skills/v3-to-v4-migration/SKILL.md. Seen in search results only, not opened.
- Chromium SwiftShader deprecation (M139): https://chromium.googlesource.com/chromium/src/+/da170c2267b2201954efe1c8fa5d2d89ab09f7bf/docs/gpu/swiftshader.md and https://developer.samsung.com/browser/policy/enable-unsafe-swift-shader.html. Consistent with Playwright's source comment.
- styled-components maintenance status: https://opencollective.com/styled-components/updates/a-whole-new-world, https://github.com/orgs/styled-components/discussions/5657. Maintainer statements, but they shift over time.

### Tertiary (LOW confidence; validate before relying on)
- Netlify free-plan "operational credits" pause reports, Jul–Sep 2026: https://answers.netlify.com/t/free-plan-production-deploys-paused-but-usage-looks-minimal/167358 and sibling threads. User reports, no official reply.
- "Cloudflare Pages in maintenance mode": https://www.morphllm.com/comparisons/cloudflare-pages-vs-workers. Third-party blog.
- Vercel Authentication enabled by default on new projects. Community knowledge; not stated on the fetched official page.
- ESLint 10 removed eslintrc support entirely. From memory of release plans; not fetched.
- Code/JSON `ARRAY_2D` maps are orthogonal-only. Inferred from parser paths, not tested.
