# Handoff — 2026-10-12 — Gold Run prototype: review partner for the Phase 0 scaffold sprint

This document exists because the conversation that produced the spec and this sprint was running in a
Cursor chat rooted in a *different* repo (`Utribe-Portal-V3`). It is being moved here. You are the
continuation of that chat. The reader has no prior context — this is your whole briefing.

## Repo state

- **Branch:** `main`, clean, synced with `origin/main`
- **Last commit:** `2ff7e3f` Merge pull request #2 — Phaser 4 + Cloudflare Pages decisions
- **Active sprint:** `2026-10-12-phase-0-scaffold` (`.jira/CURRENT`)
- **Application code:** none yet. The repo currently holds the spec, agent rules and sprint artifacts only.
- **Remote:** `git@github.com:CyndieKamau/utribe_sims.git`, public, personal account (not the org's).

Sprint artifacts present: `BRIEF.md`, `RESEARCH.md` (the merged findings), and three per-agent
research files. `CONTEXT.md` and the `NN-PLAN.md` files do **not** exist yet — `/jira:plan` was
being run in the terminal at the time this was written.

## Your role

**Reviewer and decision partner. Not the implementer.**

The implementation agents run in Claude Code in a terminal, orchestrated by the `jira` plugin. They
write the game. You do four things:

1. **Answer design decisions** when the owner brings them to you — with the trade-off stated honestly,
   including the case against your own recommendation.
2. **Review** what the agents produce against the spec and the invariants in `CLAUDE.md`.
3. **Handle git**: branches, commits, PRs. The owner pushes through branches, never straight to `main`.
4. **Keep the spec truthful.** When a decision changes, update `docs/GAME_SPEC.md` so no future agent
   re-litigates it. This already happened once: research found the spec locked Phaser 3 while the
   official template had moved to Phaser 4, and the spec was corrected rather than the conflict left
   to each agent to rediscover.

Do not write game code in this chat unless asked directly. Two sources of implementation produces
merge conflicts and duplicated work.

## Mission

Gold Run is a prototype of a gold-ownership simulation — buy, hold, gift and spend real gold — built
to test whether the custody model is legible and fun as a game. It is a personal side project, built
for fun, not currently a team deliverable.

The point of the whole setup is **unattended agents**. The owner wants to start a sprint and go do
other work. Every decision should be weighed against that: prefer what an agent can do alone over
what is marginally better but needs a human in a GUI. That single criterion already decided map
authoring (code/JSON over the Tiled editor) and shapes everything downstream.

## Locked decisions

Do not reopen these. If one genuinely needs revisiting, stop and ask the owner rather than working
around it.

| Decision | Choice | Where it's recorded |
|---|---|---|
| Engine | **Phaser 4** (not 3.x) | `docs/GAME_SPEC.md` §5 |
| Deploy | **Cloudflare Pages**, PR previews on `*.pages.dev` | `docs/GAME_SPEC.md` §5, §10 |
| Orchestration | the **`jira` plugin**, md-file progress tracking | `docs/GAME_SPEC.md` §6 |
| Architecture invariants | pure TS engine, Phaser displays only, React renders only, one store, append-only history, seeded RNG | `CLAUDE.md` |

Chosen by the owner in the `/jira:plan` wizard, and should appear as `D-XX` entries in `CONTEXT.md`
once planning finishes — verify they landed:

- **Styling: CSS Modules**, with design tokens as CSS custom properties in one file. Components
  reference `var(--...)`, never literal values. Rejected Tailwind specifically because inline utility
  values scatter hardcoded spacing and colours across TSX with no single place to fix them, which
  conflicts with the owner's no-hardcoding rule.
- **Maps: code/JSON 2D arrays**, holding **named tile constants, not bare indices**, with
  interactable positions (mine site, NPCs, assay office) exported from the same module as the grid.
- **Orthogonal top-down perspective**, which follows from the 2D array grid.

## Open gates

`/jira:plan` should resolve these into `D-XX` entries. Details and evidence are in
`RESEARCH.md` — read it there rather than asking the owner cold.

- Toolchain upgrade scope: the template ships ESLint 9, which is EOL. Upgrade in Phase 0 or defer?
- ESLint vs oxlint.
- **Test-hook gating.** This one has a non-obvious consequence. If `window.__GOLD_RUN__` is gated on
  `import.meta.env.DEV`, then *no build* carries it — previews included — so e2e must run against the
  dev server and the Cloudflare preview has no dev panel. But the dev panel is how the owner jumps to
  a specific beat when playtesting on a phone, which is the Phase 1 gate. Recommendation: gate on a
  `VITE_*` flag, build previews with it on, and have CI assert the production bundle contains no
  `__GOLD_RUN__`.
- Store placement, given the engine layer must not import React.
- Shape of the save/load module, and which `version` field is authoritative.
- Seeded RNG: library or in-repo, and how reproducibility survives a page reload.

Still open in the spec itself (not blocking Phase 0): game title, setting and currency names, NPC
display names, the third starting character's framing, final art style, audio. See `docs/GAME_SPEC.md` §10.

## Operational practices

- **Branches, never direct commits to `main`.** Branch, commit, open a PR with `gh pr create`, merge.
- **No `Co-Authored-By` or "Generated with Claude Code" trailers** in commit messages. This is a
  standing preference across all the owner's repos.
- Commit subjects follow conventional-commit style (`docs(spec):`, `chore:`, `research(<sprint>):`).
- **`CLAUDE.md` in the repo root overrides the owner's global agent rules** for this repo — it
  cancels the global "stop for approval between phases" directive, because unattended work is the
  whole point here. Agents still stop for: a change to a locked `D-XX`, anything in the spec's
  out-of-scope list, and any `[OPEN]` or `[CONFIRM]` item.
- `.jira/` sprint files are **meant to be committed**; its `.gitignore` only excludes ephemera.
- CI and GitHub Actions were agreed to land **inside Phase 0 as a second wave**, after the toolchain
  exists — not deferred to a later phase.

## Pickup checklist

1. Read this handoff, then `CLAUDE.md`, then `docs/GAME_SPEC.md` (§5 architecture, §6 repo layout, §10 open items).
2. Check whether `/jira:plan` finished: look for `CONTEXT.md` and `NN-PLAN.md` in this sprint directory.
3. If `CONTEXT.md` exists, verify the three wizard decisions above were written as `D-XX` entries and
   that nothing contradicts `docs/GAME_SPEC.md`. If plan didn't finish, the owner reruns `/jira:plan`.
4. Confirm the sprint artifacts are committed and pushed via a branch and PR — the research commit
   `00de236` landed on `main`, but anything written since planning may be sitting uncommitted.
5. Then the owner runs `/jira:execute` in the terminal and you review the output.

## Not your problem

- **`Utribe-Portal-V3`** — a separate repo and a separate working relationship. Its stage1-only push
  rule does not apply here and its code should not be touched from this chat.
- **Backend, wallet, real gold data, accounts, multiplayer** — explicitly out of scope for the
  prototype. See `docs/GAME_SPEC.md` §9.
- **Art direction.** Phase 0 uses CC0 placeholder assets (Kenney.nl) with sources recorded in
  `public/assets/CREDITS.md`. Custom art is a later question, only if the prototype passes its gate.
- **The duplicate spec** at `../gold-run-spec.md` and `../Gold Run UTribe Game Side Project.md` are
  superseded by `docs/GAME_SPEC.md` and pending deletion. Don't read them as current.

## Suggested skills

`react-best-practices` for any React review, `tdd` for test-first work, `debug` before proposing any
fix, `grill` when a plan needs pressure-testing before the owner commits to it.
