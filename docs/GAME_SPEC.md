# Gold Run: Game Spec and Build Handoff

> Working title. Side project, built before any company proposal.
> This file is the source of truth for agents. If something here conflicts with older notes, this file wins.
> Items marked **[OPEN]** were discussed but not settled. Items marked **[CONFIRM]** are recommended defaults the owner hasn't explicitly approved. Do not decide either silently; flag them to the owner.

---

## 1. Purpose and context

**What we're building:** a fun, browser-based 2D game about small-scale gold: finding it, moving it, proving where it came from, and keeping it safe. The player walks around a small world, meets people and makes choices with consequences. It's a playable vertical slice, not a full game.

**Why:** to give young people a game they'd play for its own sake, which happens to build awareness of how gold moves, why provenance matters, and why trust is hard to earn. If it works, it can grow into a community of its own.

**Sequence:**
1. Build the prototype.
2. Acid test: the tech team plays it cold. The question is simply "do they enjoy it and keep playing?"
3. Only if it passes: a proposal to execs and marketing.

**Non-negotiables:**
- **Fun first.** Learning comes from consequences, never from explanation screens.
- **It must not feel like it's selling anything.** No calls to action, no sign-ups, no "learn more" links, no token or wallet talk. Branding at most a small "made by" line in the credits.
- **Fully sandboxed.** No real token, wallet, blockchain, payments or financial features. No $GIFT anywhere in the build.
- **Not tied to the company's UPlay 4 Life! proposal.** That document can inspire ideas but is not a requirement for this prototype.

---

## 2. What the game is

**Core fantasy:** you're a small operator with a little gold and a lot of people who want a piece of it. Your income and status grow from one thing: people believing your gold is what you say it is.

**Tagline (draft):** "Every grain has a story. Make sure it's yours."

**Feel:** a small walkable 2D world (top-down, like early Pokémon or Stardew Valley) where every place holds a decision. The decisions themselves play like *Papers, Please* × *Reigns* × Lagos Life: short, tactile, well written, with delayed consequences. **Not** a Sims-like or deep simulation.

**Key design rules:**
- **The player owns the gold; other people handle it.** The player doesn't run every stage personally. Each stage means trusting someone else. Provenance is a relationship problem.
- **The batch is the emotional hook.** The player names it. Its history (who touched it, what was recorded, what wasn't) is built by the player's choices.
- **Problems before concepts.** The player gets rejected for missing records before anyone mentions provenance. Ownership splitting solves a problem the player already has, rather than being presented as "tokenization."
- **Shortcuts must be genuinely viable.** Mercury sometimes earns more. The roadside buyer is sometimes fine. Costs appear elsewhere (land, reputation, doors that stay shut). If the clean path always wins, it's a sermon.
- **Delayed consequences** are the most important mechanic: a choice early on bites later.
- **Walking must never be filler.** Keep the map small and dense: something to see, bump into or talk to every few steps. If a walk to the next decision feels empty, shrink the map.

### Setting

- **Fictional but specific.** An invented town and region with its own name, river, landmarks and fictional currency. Internally consistent, like GTA's Los Santos. **Not** a real country, and **not** "generic Africa."
- **Grounded in shared regional realities**, not national markers: roadside gold buyers, motorbike taxis, mobile money, savings groups, school fees, funeral contributions, family obligations, polluted rivers, an overworked regulator.
- **No slang, pidgin, dialect or local-language phrases** in the prototype. Write clear, informal, youthful English. Character voice comes from personality, not vocabulary.
- **Region pack layer:** names, place names, currency and flavour lines live in a swappable content layer so local writers can create country packs later.
- **[OPEN]** Name of the town, region, river and currency.

---

## 3. What the player does (minute to minute)

| Action | Description |
|---|---|
| Walking | **Tap-to-move** (tap or click a spot, the character walks there). Keyboard arrows/WASD as an extra on desktop. Camera follows the player. |
| Interacting | Walk up to a person or object; an interaction prompt appears; tapping it opens a dialogue or action panel. |
| Panning | Swirl the pan (touch or mouse), wash dirt away, reveal colour. Triggered from a dig spot. |
| Picking people | Cards with visible traits (price, speed) and hidden traits (honesty, reliability). |
| Inspecting | Compare a weight slip to what was handed over; spot a wrong date or re-tied seal. |
| Haggling / dialogue | Choices whose options depend on reputation. |
| Route choice | Map overlay: fast road with checkpoints vs slow road with no witnesses. |
| Reveals | Assay result shown as a dramatic, deterministic reveal (no gambling mechanics). |

---

## 4. Core simulation loop

Three nested loops:

1. **Micro loop:** decide → commit → consequence revealed later.
2. **Batch loop:** Find it → Make it → Move it → Prove it → Secure it, with events (weather, checkpoints, rumours, claims) hitting every stage.
3. **Meta loop:** trust earned on one batch opens better partners, prices and opportunities for the next. Trust, not money, is the scarce resource. (The meta loop is post-prototype; the prototype covers one batch.)

### The slice: one batch, nine beats

Target is one complete batch where every beat earns its place. Rough length is 5–10 minutes, but **length is an estimate, not a requirement**. If a beat drags in playtests, cut or merge it.

| # | Beat | What happens | Concept underneath (never named on screen) |
|---|---|---|---|
| 1 | Pick your start | Three starts: young digger, returnee with savings, heir of a landowning family. Different cash, connections, obligations. | Inequality, mobility |
| 2 | Find colour | Explore the mine site, follow hints, dig, then the panning minigame. Player names the batch. | Prospecting, uncertainty |
| 3 | Make it | Mercury (cheap, fast, higher yield) vs gravity + borax (slower, clean). No lecture. | Environmental / health trade-off |
| 4 | The temptation | Roadside buyer offers cash now, no questions, low price. Accepting **ends the run early** with a "what it could have been" card. | Informal vs formal market |
| 5 | The weighing | Optionally ask the co-op secretary to witness and sign. Costs a favour. Skippable (most players will skip). | Documentation at source |
| 6 | Move it | Hand the batch to the cousin's motorbike, a bus parcel, or a licensed courier. Route choice overlay, then a random event: checkpoint, breakdown, or weight mismatch. | Custody, transport risk |
| 7 | Prove it | Lab holds the batch if handovers are undocumented or weights don't add up. Recover through relationships. Then the purity reveal. | Provenance, assay |
| 8 | The claim | Someone claims part of the batch came from their land. Records settle it, or the player pays. | Why an uneditable history matters |
| 9 | Secure and split | Gold goes to a vault. Player owes shares to three people and can't divide a bar. A fictional in-world "certificate" lets them split ownership. Ends on the **Batch Biography**: a shareable card with origin, every hand, every gap, purity, earnings, standing. | Vaulting; tokenization as a solution |

**Endings in the prototype:** (a) early informal sale, (b) batch held/discounted but completed, (c) clean completion. Thresholds are **[OPEN]** (balancing).

### The world: beats as places

The nine beats map onto locations. The world is built one zone at a time; zones not yet built show as closed paths ("the road is flooded today," "the office is shut").

| Zone | Beats | Build order |
|---|---|---|
| Character select (React screen, not a place) | 1 | Milestone 1 |
| Mine site (spawn point) | 2 | Milestone 1 |
| Processing shed (on/next to the mine site) | 3 | Milestone 1 |
| Roadside buyer's stall (edge of the mine site) | 4 | Milestone 1 |
| Village: co-op office | 5 | Later |
| Motor park | 6 (hand-off, then route overlay; the player doesn't walk the journey) | Later |
| Town: assay lab | 7 | Later |
| Elder's house (village) | 8 | Later |
| Vault (town) | 9 | Later |
| Batch Biography (overlay, not a place) | 9 | Later |

**[OPEN]** How the player moves between zones (walk across zone edges vs a small travel map). Start with zone edges; revisit if walking feels slow.

### Stats

- **Visible (3):** **Cash**, **Name** (reputation), **Land** (community and environment).
- Security and paper trail are expressed through the batch history, not meters.
- Never show the word "compliance" (or similar jargon) on screen.

### Characters (MVP cast, by role)

Each needs a want, a flaw and a voice. Use **role IDs** in code; display names come from the region pack. Each role also needs an in-world sprite and a home location.

| Role ID | Role | Usually found | Want | Twist |
|---|---|---|---|---|
| `cousin` | Player's cousin with a motorbike | Mine site, motor park | To be taken seriously | Loyal, broke, unreliable. |
| `buyer` | Roadside gold buyer | Roadside stall | Steady supply, quick margins | Warm, funny, always lowballs; remembers who sold to her. Not a villain. |
| `secretary` | Co-op secretary | Co-op office | Recognition for her records | Underappreciated until the player learns what a witness is worth. |
| `assayer` | Assay technician | Town lab | Things done properly | Pedantic, incorruptible; the person who says no. |
| `elder` | Landowning elder | Elder's house | Respect, family's share | Permission comes with family politics. |
| `fixer` | Makes paperwork appear | Wanders between zones | Player's dependence | Always tempting, always leaves a mark. |

- A **group-chat UI** (messaging-app style, React overlay) delivers news, gossip, pressure and humour.
- **[OPEN]** Display names. Earlier drafts used Ghanaian names; **these must be replaced** for the fictional setting. Use role IDs until decided.
- Ambient, non-critical characters (other diggers, kids, a radio playing) can make zones feel alive but are optional.

### Content rules

- Banned on screen: "provenance," "chain of custody," "compliance," "blockchain," "tokenization," "immutable," "proof of reserve." Concepts are shown, not named.
- No calls to action, links out, or brand mentions in gameplay.
- No poverty-tourism tone, no stereotypes, no moralising.
- Playtest every NPC (writing and sprite) for stereotype before showing to outsiders.

---

## 5. Technical decisions

### Locked

From the owner's original constraints:
- Browser-first, no install, mobile and desktop. Portrait mobile first.
- No backend for now. **Frontend first; decide on a backend only after seeing it in action.**
- No real wallet, blockchain, payments or financial integration.

Decided in later discussion:
- **Vite + React + TypeScript.** (Not Next.js: no server rendering or routing needed.)
- **Phaser 3** for the walkable world, in a **hybrid** setup based on Phaser's official Vite + React template:
  - **Phaser** draws the world: tile maps, sprites, walk animations, camera, collisions, interaction zones.
  - **React** draws everything text-heavy on top: character select, dialogue and choice panels, group chat, stats bar, route overlay, Batch Biography, dev panel.
- **Tap-to-move** as the primary control; keyboard as a desktop extra. No virtual joystick.
- **Top-down perspective.** **[CONFIRM]**

### Architecture rules

- **Game logic lives in pure TypeScript** (`src/engine`, `src/systems`), independent of both Phaser and React, and is unit-testable.
- **Phaser only displays and reports.** It reads state from the store and emits interaction events ("player reached dig spot," "player talked to cousin"). It never decides outcomes.
- **React and Phaser communicate through one event bus** (the template's EventBus) plus the shared store. No direct calls between Phaser scenes and React components.
- **State:** Zustand with persist middleware.
- **Content as JSON:** dialogue, events, NPC definitions, interactables per zone, region pack. Editable without touching code.
- **Seeded RNG** so runs are deterministic and replayable.
- **Batch history is an append-only event log.** Gaps, weight drift and assay outcome are derived from it with pure functions.
- **Animation (React overlays):** Framer Motion. **Share card:** html-to-image (or similar).
- **Tests:** Vitest for engine/systems; Playwright for end-to-end runs. Because the world is a canvas, expose a **test hook** in dev/test builds only (e.g. `window.__GOLD_RUN__`) that can read state, teleport the player and trigger interactions, so Playwright doesn't need to click pixels.
- **Dev panel:** jump to any beat or zone, set seed, inspect hidden state (NPC traits, true grams/purity), teleport, reset.

### Saving and future backend

- Saves are automatic to localStorage via Zustand persist. They're per browser and device, and can be wiped by clearing browser data. Acceptable for the prototype.
- All storage access is wrapped in try/catch; the game must work when storage is empty or blocked.
- **All saving and loading goes through one module** (`saveGame` / `loadGame`). Swapping in a server later should mean changing that one file.
- **The whole game state is plain, versioned JSON** (`version` field), so it can be sent to a server unchanged later.
- Triggers for adding a backend later: cross-device saves, community features (comparing Batch Biographies, leaderboards), collecting playtest data automatically.
- **[OPEN]** Share/replay codes: encode seed + choices into a short link or code so players can share an exact run or move a save between devices without a backend. Suggested, not adopted.

### Art

- Prototype uses **free CC0 placeholder assets** (e.g. Kenney.nl top-down packs) for tiles and character sprites, so work isn't blocked on art.
- Placeholder art will look generic; that's acceptable for the acid test. Custom art (culturally grounded, matching the fictional setting) comes later if the prototype passes.
- Every asset's source and licence is recorded in `public/assets/CREDITS.md`.
- **[OPEN]** Final art style (pixel art vs illustrated) and whether the three starting characters get distinct sprites in milestone 1 (recommended: yes, even as recolours).

### [OPEN] technical decisions

- **Map authoring:** Tiled editor (standard, but a GUI agents can't use) vs maps defined in code/JSON arrays (agent-friendly). Recommended: code/JSON for the prototype.
- **Deploy target:** Vercel, Netlify or GitHub Pages, with auto-deploy on merge.
- **Styling for React overlays** (Tailwind, CSS modules, etc.).
- **Audio:** not discussed.

### State model (starting point)

```ts
type RoleId = 'cousin' | 'buyer' | 'secretary' | 'assayer' | 'elder' | 'fixer';
type Origin = 'digger' | 'returnee' | 'heir';
type ZoneId = 'mine_site' | 'village' | 'motor_park' | 'town';
type BeatId = 'start' | 'find' | 'make' | 'temptation' | 'weighing'
            | 'move' | 'prove' | 'claim' | 'secure' | 'ended';

interface GameState {
  version: 1;
  seed: number;
  beat: BeatId;                                   // story progress
  world: { zone: ZoneId; x: number; y: number };  // where the player stands
  player: { name: string; origin: Origin; cash: number; day: number };
  stats: { name: number; land: number };          // 0–100; cash lives on player
  npcs: Record<RoleId, { affinity: number; honesty: number; reliability: number; known: boolean }>;
  batch: Batch | null;                            // one batch in the prototype
  flags: Record<string, boolean>;
}

interface Batch {
  id: string;
  name: string;                                   // player-named
  site: string;
  method: 'mercury' | 'gravity' | null;
  gramsTrue: number;                              // hidden truth
  purityTrue: number;                             // hidden until assay
  status: 'raw' | 'processed' | 'in_transit' | 'held' | 'assayed'
        | 'vaulted' | 'shared' | 'sold_informal';
  history: CustodyEvent[];                        // append-only
}

interface CustodyEvent {
  at: number;
  kind: 'found' | 'processed' | 'weighed' | 'handover' | 'arrived'
      | 'assayed' | 'claim' | 'vaulted' | 'split';
  from?: RoleId | 'player';
  to?: RoleId | 'player' | 'lab' | 'vault';
  gramsRecorded?: number;
  witness?: RoleId;
  documented: boolean;                            // undocumented events create gaps
}

// Derived, pure:
// provenanceGaps(batch) -> handovers with no witness or document
// weightDrift(batch)    -> recorded weights that don't add up
// assayOutcome(batch)   -> 'accepted' | 'held' | 'discounted'
```

Interactable data shape (JSON, per zone):

```json
{ "id": "dig_spot_riverbend",
  "zone": "mine_site",
  "position": { "x": 12, "y": 7 },
  "availableWhen": { "beat": "find" },
  "action": "open_panning" }
```

Event data shape (JSON):

```json
{ "id": "checkpoint_shakedown",
  "when": { "beat": "move", "carrier": "cousin" },
  "text": "...",
  "choices": [ { "label": "Pay him", "effects": { "cash": -40 } } ] }
```

---

## 6. Repo structure

Work is tracked by the `jira` Claude Code plugin, not by hand-maintained task files.
`.jira/` is the progress tracker; `docs/` holds the durable design documents.

```
utribe_sims/
├── CLAUDE.md                 # standing rules for every agent session
├── .jira/                    # workflow state — written by the jira commands
│   ├── STATE.md              # sprints table, decisions log, blockers, notes
│   ├── CURRENT               # slug of the active sprint
│   └── sprints/YYYY-MM-DD-<slug>/
│       ├── BRIEF.md          # what this sprint is for
│       ├── RESEARCH.md       # synthesis from parallel researchers
│       ├── CONTEXT.md        # locked decisions (D-01, D-02, …)
│       ├── features/         # acceptance predicates as Gherkin, @req:<ID> tagged
│       ├── NN-PLAN.md        # one file per wave-plan, ≤3 tasks each
│       ├── EXECUTION.md      # append-only: commits, deviations, nyquist results, PR
│       ├── FLOW.md           # human verification steps (the phase gates)
│       ├── VERIFICATION.md   # goal-backward audit after execution
│       └── RETRO.md          # optional
├── docs/
│   ├── GAME_SPEC.md          # this file — design source of truth
│   ├── ARCHITECTURE.md       # state model, Phaser/React split, event bus, derived functions
│   └── CONTENT_GUIDE.md      # voice, tone, setting rules, banned words
├── public/
│   └── assets/               # tilesets, sprites, CREDITS.md
├── src/
│   ├── engine/               # store, RNG, beat progression, effects, save/load (pure TS)
│   ├── systems/              # custody log, provenance, assay, events (pure TS)
│   ├── content/              # JSON: dialogue, events, NPCs, interactables, maps, region pack
│   ├── game/                 # Phaser: boot, zone scenes, player controller, camera, EventBus
│   ├── ui/                   # React overlays: character select, dialogue, chat, stats, route map
│   ├── minigames/            # panning (and later others)
│   └── dev/                  # dev panel, test hook
└── tests/
    ├── unit/                 # Vitest
    └── e2e/                  # Playwright, driven through the test hook
```

### Agent working rules

- Read `CLAUDE.md`, `docs/GAME_SPEC.md`, `.jira/STATE.md` and the active sprint's `CONTEXT.md` before starting.
- **One sprint = one phase = one branch = one PR.** `/jira:execute` opens the PR when the sprint completes green.
- Every plan task has **Goal, Files, Depends on, Acceptance, Out of scope.** Respect "Out of scope."
- Acceptance is declared once per sprint as Gherkin in `features/*.feature`, tagged `@req:<ID>`. Plans claim predicates via `effects:`. A predicate that is declared but unclaimed, or claimed but undeclared, blocks the plan-checker.
- Never put game logic in Phaser scenes or React components.
- Done means `npm test` and `npm run e2e` pass, nyquist finds no uncovered criterion, and the verifier agrees the sprint's goal is delivered.
- `STATE.md` and `EXECUTION.md` are written by the jira commands. Do not hand-maintain a separate progress file.

Each phase in section 7 becomes one sprint. A phase with more work than three tasks is split into
numbered wave-plans (`01-PLAN.md`, `02-PLAN.md`, …); plans in the same wave touch disjoint files and
run in parallel, later waves depend on earlier ones.

Phase gates are human judgement, not tests. `/jira:flow` generates `FLOW.md` — the steps the owner
walks through on a phone to answer questions like "does walking add fun?" — because no automated
check can sense that.

Task shape inside a wave-plan:

```markdown
### Tap-to-move on the mine site
**Goal:** Tapping or clicking a walkable tile moves the player there along a path; camera follows.
**Files:** src/game/scenes/MineSite.ts, src/game/player/PlayerController.ts, tests/e2e/movement.spec.ts
**Depends on:** mine site map, player sprite (earlier wave)
**Acceptance:** claims @req:MOVE-01, @req:MOVE-02 from features/movement.feature
**Out of scope:** interactions, final art, sound
```

With the matching predicate declared once in `features/movement.feature`:

```gherkin
@req:MOVE-01
Scenario: Walking to a reachable tile
  Given the player is standing on the mine site
  When the player taps a walkable tile
  Then the player walks there avoiding blocked tiles
  And world.x/y in the store matches the destination
```

---

## 7. Phases

| Phase | Goal | Main tasks | Gate |
|---|---|---|---|
| 0. Setup | A repo any agent can run | Phaser + Vite + React template, TypeScript, Zustand, Vitest, Playwright, lint, CLAUDE.md, docs, test hook stub, auto-deploy preview | `npm test` and `npm run e2e` pass on the shell; preview link opens on a phone |
| 1. Walkable mine site | **Does walking add fun?** | See milestone 1 (section 8) | Owner and 2–3 others play on phones; walking feels good, not like filler |
| 2. Consequence engine | Choices matter | Custody log, derived functions, hidden NPC traits, JSON event system, three endings (pure TS, fully unit-tested) | Scripted runs with different choices give different outcomes; tests explain why |
| 3. The rest of the world | Full run walkable end to end | Village, motor park and town zones; beats 5–9 as placeholder interactions; route overlay; Batch Biography (plain) | Owner plays from character select to Batch Biography on a phone, all three endings reachable |
| 4. Content | Reads like a game | Full dialogue, NPC voices, group chat, event writing, default region pack | Read aloud, it sounds like people, not training |
| 5. Feel | Fun to touch | Polished panning minigame, assay reveal, transitions, sprite/tile polish, ambient life, mobile polish, Batch Biography image export | Someone plays on a phone without asking "what do I do?" |
| 6. Acid test | Ready for the tech team | Bug bash, end-of-run question, final deploy | Five people play cold; replays, quotes and drop-off points collected |

- Phase 2 is pure TypeScript and can start in parallel with Phase 1 once Phase 0 is done.
- Phase 4 writing (JSON only) can run in parallel with Phase 3.
- **Two key gates:**
  - **After Phase 1:** if walking doesn't add fun, fall back to click-through scenes. The beat structure and engine don't depend on walking, so nothing is lost.
  - **After Phase 2/3:** if consequences don't feel surprising with placeholder text, fix the design before polishing.

### Acid test (Phase 6) method

- Send a link with no explanation.
- Signals: finishes unprompted; replays to try a different choice; argues about characters or compares Batch Biographies; laughs at a line.
- One follow-up question: "What happened to your gold?" Listen for provenance explained in their own words.
- Note where people stop. Feedback via conversation or a simple form (no backend needed).

---

## 8. First milestone: Phases 0 + 1, the walkable mine site

**Goal:** a deployed build where the player picks a character, spawns at the mine site, walks around, and plays beats 1–4 (pick start, find colour, make it, the temptation), with a closed path out.

**Must include:**
- Scaffolded repo matching section 6, with `CLAUDE.md`, `docs/`, and `.jira/` initialised.
- Working `npm run dev`, `npm test`, `npm run e2e`, and auto-deploy preview.
- Zustand store implementing the `GameState` shape, persisted through `saveGame`/`loadGame`, safe when storage fails.
- Seeded RNG; hidden NPC traits rolled at game start from the seed.
- **Character select** (React): three starts, each with different starting cash and a distinct sprite (recolours are fine).
- **Mine site zone** (Phaser): small, dense top-down map with placeholder CC0 tiles, collisions, camera following the player.
- **Tap-to-move** plus keyboard on desktop.
- **Interactables** (from JSON), each opening a React panel when the player walks up and taps:
  - **Dig spot(s)** with hints → placeholder panning (tap to reveal is fine) → player names the batch.
  - **Cousin** with a line or two of placeholder dialogue.
  - **Processing shed** → mercury vs gravity choice, recorded in state.
  - **Roadside buyer's stall** → accept the offer (ends run with a placeholder "what it could have been" card) or decline.
  - **Path out** of the zone → "closed for now" message.
- Batch history records `found` and `processed` events.
- Stats bar (Cash, Name, Land) visible as a React overlay.
- Dev panel: jump to beat, set seed, view hidden state, teleport, reset.
- Playwright (via test hook): one run that digs, processes, declines the buyer and reaches the closed path; one run that sells to the buyer and reaches the early ending.
- Usable in portrait on a phone.

**Explicitly not in this milestone:** other zones, consequence logic beyond recording choices, final dialogue, polished panning minigame, final art, share-image export, sound.

**Done when:** the owner can play beats 1–4 on a phone, both scripted runs pass, and `.jira/STATE.md` records the sprint as `done` with Phase 2 as the next sprint. Then judge the Phase 1 gate via `FLOW.md`: does walking add fun?

---

## 9. Out of scope for the prototype

Multiple batches, crews, specialisation, cooperatives, collective missions, reputation across groups, new regions, multiplayer, accounts, cloud saves, any backend, real vault data, wallet, $GIFT or any real-world value, developer APIs, Academy integration.

---

## 10. Open items summary

| Item | Status / notes |
|---|---|
| Game title | "Gold Run" is a working title. |
| Setting names | Town, region, river, fictional currency not chosen. |
| NPC display names | Earlier Ghanaian names must be replaced; use role IDs until decided. |
| Third starting character | Role ID `heir`; gender and framing not settled. |
| Top-down perspective | Recommended and written in; owner to confirm. |
| Moving between zones | Zone edges vs a small travel map. Start with zone edges. |
| Map authoring | Tiled vs code/JSON maps. Code/JSON recommended for agents. |
| Art style | Placeholder CC0 for the prototype; final style (pixel vs illustrated) undecided. |
| Deploy target | Not chosen. |
| Styling for overlays, audio | Not discussed. |
| Share/replay codes | Suggested (seed + choices as a link); not adopted. |
| Who writes dialogue | Proposed: agents draft, owner rewrites key beats (temptation, rejection, claim). Not confirmed. |
| Balancing | Cash amounts, stat changes, ending thresholds, event odds all unset. |
| Event list | Examples only (checkpoint, breakdown, weight mismatch, rain, rumour, funeral); final set unset. |
| In-world name for the ownership "certificate" | Not chosen; must not be called a token. |
| 3-minute cold open | Suggested; not planned. Beats 1–4 could later serve as a short standalone taste. |
| Optional skippable learning card after the lab rejection | Suggested; not adopted. |
| Human-facing design doc | The earlier Claude Doc still says Ghana, assumes a click-through game and has a "pitch to the team" section; it's outdated. This spec supersedes it. |
