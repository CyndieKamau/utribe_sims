# Acceptance predicates: the repo scaffold and toolchain.
# Declared once here; plans claim by @req ID via `effects:`. Frozen at execution time.

@sprint:2026-10-12-phase-0-scaffold
Feature: A fresh clone of the repo builds and checks green on the Phaser 4 shell

  @req:SCAF-01 @plan:V @wave:IV
  Scenario: The full Phase 0 gate passes on the empty shell
    Given a fresh clone of the sprint branch with `npm ci` and `npx playwright install chromium` done
    When `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run e2e` run in sequence
    Then every command exits 0
    And `npm test` reports at least 4 passing test files under tests/unit
    And `npm run e2e` reports at least one passing test in each of the `mobile` and `desktop` projects

  @req:SCAF-02 @plan:I @wave:I
  Scenario: The toolchain is the one the owner chose
    Given dependencies installed with `npm ci`
    When `npm ls phaser vite typescript @vitejs/plugin-react eslint eslint-plugin-react-hooks zustand vitest @playwright/test` runs
    Then phaser resolves to 4.x, vite to 8.x, typescript to 6.0.x, @vitejs/plugin-react to 6.x, eslint to 10.x and eslint-plugin-react-hooks to 7.x
    And zustand, vitest and @playwright/test are installed

  @req:SCAF-03 @plan:I @wave:I
  Scenario: The production build splits Phaser into its own chunk under Vite 8
    Given the template's object-form `manualChunks` has been rewritten for Vite 8
    When `npm run build` runs
    Then it exits 0 with no `manualChunks` error or warning
    And dist/assets contains a JavaScript chunk whose name starts with "phaser"
    And no file under vite/ references terser

  @req:SCAF-04 @plan:I @wave:I
  Scenario: Template code and assets that break repo rules are gone
    Given the template has been imported
    When the repo is searched for template leftovers
    Then log.js, .eslintrc.cjs, src/game/scenes/MainMenu.ts, src/game/scenes/Game.ts, src/game/scenes/GameOver.ts and public/assets/{bg,logo,star}.png do not exist
    And `grep -rn "Math.random\|phaser.io\|gryzor" src vite index.html package.json` finds nothing
    And no file under src/game or src/ui contains a player-readable string literal

  @req:SCAF-05 @plan:I @wave:I
  Scenario: The repo layout matches spec section 6
    Given the scaffold is in place
    When the directory tree is listed
    Then src/engine, src/systems, src/content, src/game, src/ui, src/minigames, src/dev, tests/unit and tests/e2e exist in git
    And public/assets/CREDITS.md exists
    And .gitignore ignores node_modules, dist, test-results, playwright-report and .vitest
