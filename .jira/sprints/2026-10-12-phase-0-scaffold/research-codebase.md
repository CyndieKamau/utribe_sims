# Research: codebase — 2026-10-12-phase-0-scaffold

## Summary

- The repo contains no code. Tracked files are `CLAUDE.md`, `README.md` (2 lines), `LICENSE` (MIT), `docs/GAME_SPEC.md` and the `.jira/` workspace (`git ls-files`). No `package.json`, `src/`, `tests/`, `public/`, `.github/`, `.claude/` or root `.gitignore` exist. Every directory and config file Phase 0 needs is net-new.
- Spec section 6 (`docs/GAME_SPEC.md:275-308`) fixes the target layout: `src/{engine,systems,content,game,ui,minigames,dev}`, `tests/{unit,e2e}`, `public/assets/`, `docs/{ARCHITECTURE,CONTENT_GUIDE}.md`. Phase 0 row (`docs/GAME_SPEC.md:356`) lists: template, TypeScript, Zustand, Vitest, Playwright, lint, CLAUDE.md, docs, test hook stub, auto-deploy preview.
- Seven architecture rules must hold from the first commit (`CLAUDE.md:26-37`, `docs/GAME_SPEC.md:165-174, 178-181`): pure-TS engine with no Phaser/React imports, Phaser display-only, React render-and-dispatch only, one EventBus plus one store, seeded RNG only, single save/load module, versioned plain-JSON state.
- The brief's four blocking items (`BRIEF.md:19`) are three `[OPEN]` items (`docs/GAME_SPEC.md:194-196`) and one `[CONFIRM]` (`docs/GAME_SPEC.md:161`). Perspective is marked `[CONFIRM]`, not `[OPEN]`. Two of the three are already partly presupposed elsewhere in the repo text (see below).
- The spec has a few tensions the planner has to resolve: a "store" listed under the React/Phaser-free `src/engine/` (`docs/GAME_SPEC.md:298`), Zustand persist vs a single `saveGame`/`loadGame` module (`:168` vs `:180`), and the template's own file layout vs `src/ui/` (`:302`).

## Findings

### Current repo state (Codebase)

| Path | State | Phase 0 role |
|---|---|---|
| `CLAUDE.md` | Exists, 87 lines | Reference-only. Phase 0 row lists "CLAUDE.md" (`docs/GAME_SPEC.md:356`); it already exists, so likely no change unless the planner decides otherwise. |
| `README.md` | 2 lines: `# utribe_sims` / `Simulated Virtual World` (`README.md:1-2`) | Candidate to change (run instructions). Not required by spec. |
| `LICENSE` | MIT, 2026 Cyndie Kamau (`LICENSE:1-3`) | Reference-only. |
| `docs/GAME_SPEC.md` | 436 lines | Reference-only (source of truth). |
| `docs/ARCHITECTURE.md` | Missing | Required by layout (`docs/GAME_SPEC.md:293`): "state model, Phaser/React split, event bus, derived functions". Phase 0 row includes "docs" (`:356`). |
| `docs/CONTENT_GUIDE.md` | Missing | Required by layout (`docs/GAME_SPEC.md:294`): "voice, tone, setting rules, banned words". |
| `.jira/STATE.md` | Sprints table empty, `active_sprint:` blank (`.jira/STATE.md:5, 16-17`) | Written by jira commands only (`docs/GAME_SPEC.md:318`). Not a plan file. |
| `.jira/.gitignore` | Ignores `*.tmp *.swp *.log *.bak .DS_Store scratch/` (`.jira/.gitignore:5-10`) | Scoped to `.jira/` only. There is no root `.gitignore`, so `node_modules/`, `dist/`, Playwright `test-results/` and `playwright-report/` are currently untracked-but-unignored. |
| `.github/` | Missing | Needs creating for CI (`BRIEF.md:11`). |
| `public/assets/CREDITS.md` | Missing | Must exist the moment any asset is added (`CLAUDE.md:86-87`, `docs/GAME_SPEC.md:189`). The template ships its own assets (logo/background); whether they stay determines whether CREDITS.md is needed in Phase 0. |
| `.claude/skills/` (repo) | Missing | Skills referenced by `CLAUDE.md:52-60` (`react-best-practices`, `tdd`, `debug`, `grill`) live only in `~/.claude/skills/`. |

### What section 6 requires Phase 0 to create

From `docs/GAME_SPEC.md:295-307`, annotated with what each directory is for and whether Phase 0 needs content or only the directory:

| Directory | Spec purpose (line) | Phase 0 content implied by brief/Phase 0 row |
|---|---|---|
| `public/assets/` | tilesets, sprites, CREDITS.md (`:296`) | Whatever the template ships; CREDITS.md if assets kept |
| `src/engine/` | store, RNG, beat progression, effects, save/load — "pure TS" (`:298`) | Store skeleton, seeded RNG, `saveGame`/`loadGame` (Zustand persist per `:168`, `BRIEF.md:11`). Beat progression/effects are later phases. |
| `src/systems/` | custody log, provenance, assay, events (`:299`) | None — Phase 2 (`:358`). Directory only, if at all. |
| `src/content/` | JSON: dialogue, events, NPCs, interactables, maps, region pack (`:300`) | No content (`BRIEF.md:23`). Directory only. |
| `src/game/` | Phaser: boot, zone scenes, player controller, camera, EventBus (`:301`) | Template's Phaser side + EventBus (`:167` names "the template's EventBus"). |
| `src/ui/` | React overlays (`:302`) | Template's React side, possibly an empty shell. |
| `src/minigames/` | panning (`:303`) | None — Phase 1/5. |
| `src/dev/` | dev panel, test hook (`:304`) | Test hook stub (`:356`, `BRIEF.md:11`). Dev panel is milestone 1 (`:399`). |
| `tests/unit/` | Vitest (`:306`) | At least one passing test so `npm test` passes "on the shell" (`:356`). |
| `tests/e2e/` | Playwright via test hook (`:307`) | At least one spec using `window.__GOLD_RUN__` so `npm run e2e` passes (`:356`, `BRIEF.md:13`). |

Scripts implied: `npm run dev`, `npm test`, `npm run e2e` (`docs/GAME_SPEC.md:385`; `CLAUDE.md:64`). A lint script is implied by "lint" (`:356`) and by the global directive to run `npx tsc --noEmit` / `npx eslint . --quiet`; no script name is fixed anywhere in the repo.

"New top-level directories need a reason" (`CLAUDE.md:50`) — relevant if the template introduces anything outside the section 6 tree (e.g. its own `src/` sub-layout, a `log.js`, or config folders).

### Architecture rules the scaffold must establish from day one

| Rule | Source | What the scaffold has to make true on an empty shell |
|---|---|---|
| Engine/systems are pure TS, no Phaser/React imports, unit-testable | `CLAUDE.md:26-27`; `docs/GAME_SPEC.md:165` | `src/engine` must not import `phaser` or `react`. Nothing in the repo currently enforces this mechanically (no lint config exists). |
| Phaser only displays and reports; never decides outcomes, rolls dice, or mutates state | `CLAUDE.md:28-29`; `docs/GAME_SPEC.md:166, 316` | Scenes read store, emit events. |
| React only renders and dispatches | `CLAUDE.md:30`; `docs/GAME_SPEC.md:316` | — |
| One event bus (the template's EventBus) plus the shared Zustand store; no direct scene-to-component calls | `CLAUDE.md:31-32`; `docs/GAME_SPEC.md:167` | Spec explicitly names "the template's EventBus" — reuse, not a new bus. |
| Zustand with persist middleware | `docs/GAME_SPEC.md:168`; `BRIEF.md:11` | — |
| Seeded RNG only; no bare `Math.random()` | `CLAUDE.md:35`; `docs/GAME_SPEC.md:170` | Applies to the whole repo, not only engine. Template/library code is outside our control; our code is not. No enforcement exists yet. |
| All save/load through one module (`saveGame`/`loadGame`); swapping in a server = edit that one file | `CLAUDE.md:36-37`; `docs/GAME_SPEC.md:180` | — |
| State is plain versioned JSON (`version` field) | `CLAUDE.md:37`; `docs/GAME_SPEC.md:181, 209` (`version: 1`) | — |
| Storage access wrapped in try/catch; works with empty or blocked storage | `docs/GAME_SPEC.md:179`; also `:386` "safe when storage fails" | Testable on the empty shell. |
| Test hook in dev/test builds only; reads state, teleports, triggers interactions | `docs/GAME_SPEC.md:173`; `CLAUDE.md:67-69` | Phase 0 needs a "stub" (`:356`). Teleport/trigger need a world, which Phase 0 does not have (`BRIEF.md:23`). Must not ship in production builds. |
| No e2e test depending on canvas coordinates | `CLAUDE.md:68-69`; `BRIEF.md:18` | — |
| Types over strings: `RoleId`, `ZoneId`, `BeatId`, status unions | `CLAUDE.md:48-49`; definitions at `docs/GAME_SPEC.md:201-247` | The state model is labelled "starting point" (`:199`). |
| No hardcoded player-readable strings in `.tsx`/scene files | `CLAUDE.md:41-43` | Template ships visible text/demo UI; any kept on screen would violate this. |
| No magic numbers | `CLAUDE.md:44-45` | Applies to e.g. canvas size, persist version, test timeouts in our code. |
| Banned on-screen words | `CLAUDE.md:73-75`; `docs/GAME_SPEC.md:139` | `docs/CONTENT_GUIDE.md` is the designated home for this list (`:294`). |
| Portrait mobile first | `docs/GAME_SPEC.md:151`; gate "preview link opens on a phone" (`:356`) | Affects the Phaser game config (size/scale) in the scaffold. |
| Asset credits recorded at add time | `CLAUDE.md:86-87`; `docs/GAME_SPEC.md:189` | — |

### Tensions in the spec that affect Phase 0 layout (not resolved here)

1. **Store location vs purity.** `src/engine/` is described as "store, RNG, … save/load (pure TS)" (`docs/GAME_SPEC.md:298`), while the rule is that engine must not import React (`CLAUDE.md:26-27`). Zustand's default hook API is React-bound; whether the store lives in `engine` in a framework-free form, and where the React binding lives, is not specified anywhere in the repo.
2. **Persist middleware vs single save module.** `docs/GAME_SPEC.md:168, 178` say saves go through Zustand persist to localStorage; `:180` says all save/load goes through one module named `saveGame`/`loadGame`, and `:386` says "persisted through `saveGame`/`loadGame`". The repo does not say whether persist's storage adapter *is* that module or whether the module wraps persist.
3. **Two version fields.** `GameState.version: 1` (`docs/GAME_SPEC.md:209`) is in-state; Zustand persist also has its own version/migrate mechanism. The spec mentions only the in-state field.
4. **Template layout vs `src/ui/`.** Spec puts React overlays in `src/ui/` (`:302`) and EventBus in `src/game/` (`:301`). The template's own layout is out of this focus (external), but if it places React entry files elsewhere, `CLAUDE.md:50` requires matching section 6.
5. **Test location.** Spec puts tests in top-level `tests/unit` and `tests/e2e` (`:305-307`), not co-located. Vitest and Playwright include globs will need to match.
6. **`FLOW.md` listed in spec but not in `.jira/README.md`.** `docs/GAME_SPEC.md:289` lists `FLOW.md`; `.jira/README.md:7-16` does not. Workflow-level, not a code change.

### [OPEN] / [CONFIRM] items — exact text and location

Spec convention: `[OPEN]` = discussed, not settled; `[CONFIRM]` = recommended default not approved; "Do not decide either silently; flag them to the owner" (`docs/GAME_SPEC.md:5`). Repo rule: "Never silently resolve an `[OPEN]` or `[CONFIRM]`" and stop when an `[OPEN]` blocks progress (`CLAUDE.md:20-22`).

**The four named in the brief (`BRIEF.md:19`):**

| Item | Marker | Exact text | Other places it appears |
|---|---|---|---|
| Map authoring | `[OPEN]` (section header `docs/GAME_SPEC.md:192`) | `:194` "**Map authoring:** Tiled editor (standard, but a GUI agents can't use) vs maps defined in code/JSON arrays (agent-friendly). Recommended: code/JSON for the prototype." | `:425` summary "Tiled vs code/JSON maps. Code/JSON recommended for agents." `:300` lists "maps" under `src/content` JSON; `CLAUDE.md:41-42` says maps "live in `src/content` as JSON". Both read as JSON-format storage, which Tiled exports also satisfy, so they do not settle the question. |
| Deploy target | `[OPEN]` (`:192`) | `:195` "**Deploy target:** Vercel, Netlify or GitHub Pages, with auto-deploy on merge." | `:427` "Not chosen." Gate depends on it: "preview link opens on a phone" (`:356`); "auto-deploy preview" (`:356, :385`; `BRIEF.md:11`). Note `:195` says "on merge" while the Phase 0 row says "preview" — per-PR previews vs deploy-on-merge is not specified. |
| Styling for React overlays | `[OPEN]` (`:192`) | `:196` "**Styling for React overlays** (Tailwind, CSS modules, etc.)." | `:428` "Styling for overlays, audio — Not discussed." Locked adjacent choices: Framer Motion for overlay animation, html-to-image for share card (`:172`) — neither is Phase 0. |
| Top-down perspective | `[CONFIRM]` (not `[OPEN]`) | `:161` "**Top-down perspective.** **[CONFIRM]**" (inside the "Locked → Decided in later discussion" list, `:155-161`) | `:423` "Recommended and written in; owner to confirm." Written in unmarked at `:34` ("top-down, like early Pokémon or Stardew Valley"), `:187` ("Kenney.nl top-down packs"), `:389` ("small, dense top-down map"). |

**Other `[OPEN]` items, and whether Phase 0 touches them:**

| Item | Location | Phase 0 contact |
|---|---|---|
| Audio | `:197` "**Audio:** not discussed." (under `[OPEN] technical decisions`); `:428` | None stated; milestone 1 excludes sound (`:403`). |
| Share/replay codes | `:183` "**[OPEN]** Share/replay codes: encode seed + choices into a short link or code…"; `:429` | Indirect: would shape seed/RNG and save format, both of which Phase 0 may stub. |
| Setting names | `:50` "**[OPEN]** Name of the town, region, river and currency."; `:420` | Indirect: region-pack layer (`:49`) lives in `src/content`; no content in Phase 0. Also affects any page `<title>`/app name shown on the preview. |
| NPC display names | `:134`; `:421` | None (role IDs only). |
| Endings thresholds / balancing | `:93`; `:431` | None directly; "no magic numbers" (`CLAUDE.md:44`) means a config home may be wanted. |
| Moving between zones | `:112`; `:424` | None. |
| Art style / distinct sprites | `:190`; `:426` | None; placeholder CC0 is locked (`:187`). |
| Game title | `:419` "'Gold Run' is a working title." (not bracket-marked) | Touches any visible app title, `package.json` name, manifest. Repo name is `utribe_sims` (`README.md:1`). |

### Architectural Responsibility Map (seed)

Nothing exists today; every row is "to be created". Tiers follow the spec's split.

| Capability | Tier | Spec home | Source |
|---|---|---|---|
| Game state shape (`GameState`, unions) | Pure TS / engine | `src/engine/` | `docs/GAME_SPEC.md:201-247, 298` |
| Store (Zustand) | Engine (state) + React binding | `src/engine/` (location tension noted above) | `:168, :298` |
| Persistence (`saveGame`/`loadGame`, localStorage, try/catch, versioned JSON) | Browser storage via single engine module | `src/engine/` | `:178-181, :298`; `CLAUDE.md:36-37` |
| Seeded RNG | Pure TS / engine | `src/engine/` | `:170, :298`; `CLAUDE.md:35` |
| Beat progression, effects | Pure TS / engine | `src/engine/` | `:298` — not Phase 0 |
| Custody log, provenance, assay, events | Pure TS / systems | `src/systems/` | `:299` — Phase 2 (`:358`) |
| Content (dialogue, NPCs, interactables, maps, region pack) | Static JSON, bundled | `src/content/` | `:169, :300`; `CLAUDE.md:41-43` |
| World rendering, camera, collisions, interaction zones | Browser / Phaser canvas | `src/game/` | `:158, :301` |
| Phaser↔React event bus | Browser / shared module | `src/game/` (template's EventBus) | `:167, :301` |
| Overlays (character select, dialogue, chat, stats, route, Biography, dev panel UI) | Browser / React DOM | `src/ui/` (dev panel in `src/dev/`) | `:159, :302, :304` |
| Minigames | Browser (unspecified Phaser vs React) | `src/minigames/` | `:303` |
| Test hook `window.__GOLD_RUN__` | Browser, dev/test builds only | `src/dev/` | `:173, :304` |
| Unit tests | Node (Vitest) | `tests/unit/` | `:306` |
| E2E tests | Headless browser (Playwright) via test hook | `tests/e2e/` | `:307`; `CLAUDE.md:67-69` |
| Static assets + credits | CDN/Static | `public/assets/` | `:296, :189` |
| CI | Infra (GitHub Actions) | `.github/` (not in section 6 tree) | `BRIEF.md:11` |
| Preview deploy | Infra / CDN — target `[OPEN]` | — | `:195, :356` |
| Backend / database | None — explicitly excluded | — | `:152`, `:409` |

## Open questions

- Is the store meant to be framework-free inside `src/engine/` with a React hook elsewhere, or is `src/engine/` "pure" only with respect to Phaser? (`docs/GAME_SPEC.md:298` vs `CLAUDE.md:26-27`.)
- Is `saveGame`/`loadGame` the persist middleware's storage adapter, or a wrapper around it? Which version field governs migrations — `GameState.version` or persist's? (`:168, :180, :209`.)
- What does the test hook stub expose in Phase 0 when there is no world to teleport in or interact with? (`:173, :356`; `BRIEF.md:23`.)
- How is "dev/test builds only" verified — is there a requirement that the production preview does *not* expose `window.__GOLD_RUN__`? Not stated. (`:173`.)
- "Auto-deploy on merge" (`:195`) vs "auto-deploy preview" (`:356`, `BRIEF.md:11`): per-PR previews, main-branch deploy, or both? Also depends on the `[OPEN]` deploy target.
- Does the template's demo content (visible text, logo assets) stay in Phase 0? Keeping on-screen strings conflicts with `CLAUDE.md:41-43`; keeping assets triggers `public/assets/CREDITS.md` (`CLAUDE.md:86-87`).
- Should the "pure TS engine" and "no `Math.random()`" rules be mechanically enforced (lint rules) in Phase 0, or by review only? Nothing in the repo decides this.
- Does Phase 0 author `docs/ARCHITECTURE.md` and `docs/CONTENT_GUIDE.md` (Phase 0 row says "docs", `:356`), and is the visible game title (`:419`, working title) used anywhere in the shell?
- Out of focus (external): the Phaser Vite + React template's actual file layout, where its EventBus lives, and which config files it adds — needed to reconcile with section 6.

## Sources

### Primary (HIGH confidence)
All read directly in this session.
- `docs/GAME_SPEC.md:1-436` — design source of truth; every spec citation above.
- `CLAUDE.md:1-87` — repo standing rules (architecture, content, done, assets).
- `.jira/sprints/2026-10-12-phase-0-scaffold/BRIEF.md:1-23` — sprint statement, constraints, out of scope.
- `.jira/STATE.md:1-31`, `.jira/README.md:1-18`, `.jira/.gitignore:1-10` — workflow state and ignore scope.
- `README.md:1-2`, `LICENSE:1-3` — existing root files.
- `git ls-files` output — confirms the full tracked file set (8 files, no source code).
- `ls -a` of repo root, `.claude/`, `.github/` — confirms absence of those directories.

### Secondary (MEDIUM confidence)
- Statement that Zustand's default hook API is React-bound and that persist has its own version/migrate option — general library knowledge, not verified against docs in this session; belongs to the external researcher to confirm.

### Tertiary (LOW confidence)
- Assumption that the Phaser template ships visible demo text and its own image assets — not verified; inferred from the brief's instruction to start from the template. Validate in external research.
