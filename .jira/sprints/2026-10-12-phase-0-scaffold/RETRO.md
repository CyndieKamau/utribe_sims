# Retro: 2026-10-12-phase-0-scaffold

**Date:** 2026-10-13
**Sprint goal:** On the empty Phaser 4 shell, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` all exit 0 locally and in the GitHub Actions CI run for the sprint PR, the production build contains no `__GOLD_RUN__`, and the PR's Cloudflare Pages preview URL opens on a phone (owner-verified).
**Outcome:** shipped (PR #3, merged; production live at https://utribe-sims.pages.dev)

## Owner's answers (verbatim)

- Outcome: "Shipped"
- What worked best: "Unattended execution"
- What slowed you down: "Cloudflare setup"
- Biggest surprise: "Cloudflare UI drift"
- Anything to change about the workflow: no answer given

## What worked

- Unattended execution. Five plans over four waves ran without the owner between plans, including the two wave II plans in parallel on one shared tree with no file collisions (staging by explicit path held).
- Plans survived contact with the code: deviations were all minor and logged (Rolldown `codeSplitting.groups` instead of deprecated `manualChunks`, DOM lib in `tsconfig.node.json`, React 19 ref-as-prop, a renamed local in `store.ts`).
- Gates caught what they were meant to: the lint boundary test proves the import and `Math.random` bans fire; CI checks the production `dist/` has no test hook; the deployed production bundle was confirmed hook-free after merge.
- Coverage check found one real gap (no test kept `localStorage` inside the save module) and filled it. Goal check: PASS, 7 of 9 outcomes delivered before the PR, the remaining 2 (CI, phone preview) confirmed after.

## What didn't

- Cloudflare setup took most of the owner's time. The README assumed a Preview-only environment variable that the Pages dashboard did not offer; the fix was a build command keyed on `CF_PAGES_BRANCH`, and the README was corrected after the fact.
- The "Import a repository" flow defaults to Workers, which has no build output directory; the instructions didn't warn about it.
- The first production build failed because `main` had no `package.json` until the PR merged. Harmless, but confusing without warning.
- Plan II commits carried internal `Refs:` trailers despite the external-reader rule; they had to be stripped by rebuilding the unpushed branch and rewriting SHAs in the sprint records.

## Surprises

- Cloudflare UI drift: the dashboard didn't match what research and the README described (Workers-first create flow, no per-environment variable selector).
- The empty commit was needed to get a preview built for a PR opened before Pages was connected.

## Follow-ups

- [ ] Decide whether Phase 1 runs as one sprint or two (walkable world, then beats 1–4).
- [ ] Spec §10 still lists map authoring and overlay styling as open, though D-04 and D-03 decided them.
- [ ] Optional: delete local branches `jira/2026-10-12-phase-0-scaffold` and `backup/pre-reword-phase-0`.

## Lessons for the workflow itself

- Third-party dashboard steps (Cloudflare, any hosting console) drift faster than research can track. Plans that hand the owner dashboard steps should describe the goal of each setting and a fallback, not only the exact clicks, and should prefer mechanisms that live in the build command or repo over dashboard-only settings.
- When hosting is first connected while the sprint PR is open, expect the production branch to fail until merge and a push to be needed for the PR preview. Say so up front.
- Executor prompts must state the commit trailer rule explicitly (no `Refs:` with sprint or plan IDs); one executor followed the template's trailer instead of the owner's rule.
