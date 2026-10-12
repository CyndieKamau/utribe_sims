# Acceptance predicates: the dev/test-only window.__GOLD_RUN__ hook and the e2e harness.
# Declared once here; plans claim by @req ID via `effects:`. Frozen at execution time.

@sprint:2026-10-12-phase-0-scaffold
Feature: Playwright drives the shell through window.__GOLD_RUN__, never canvas coordinates

  @req:HOOK-01 @plan:IV @wave:III
  Scenario: The hook reports ready and exposes a JSON state snapshot
    Given the Vite dev server started by Playwright's webServer
    When a page opens "/" in the `mobile` (Pixel 7) and `desktop` projects
    Then window.__GOLD_RUN__.isReady() becomes true within 15 seconds
    And window.__GOLD_RUN__.hookVersion is 1
    And window.__GOLD_RUN__.getState() returns an object with version 1 and an integer seed

  @req:HOOK-02 @plan:IV @wave:III
  Scenario: A new run's seed survives a reload through the save module
    Given the hook is ready on a fresh browser context
    When window.__GOLD_RUN__.newRun(1234) is called and the page reloads
    Then after the hook is ready again, getState().seed is 1234

  @req:HOOK-03 @plan:IV @wave:III
  Scenario: The shell boots when browser storage is blocked
    Given an init script that makes Storage.prototype.getItem, setItem and removeItem throw
    When the page opens "/"
    Then the hook becomes ready, newRun(9) succeeds and getState().seed is 9
    And no "pageerror" event fired

  @req:HOOK-04 @plan:IV @wave:III
  Scenario: The hook is absent from production builds and present in flagged builds
    Given the committed .env sets VITE_GOLD_RUN_DEV=false
    When `npm run build` runs with no VITE_GOLD_RUN_DEV in the environment
    Then `grep -rq "__GOLD_RUN__" dist` exits 1
    And when `VITE_GOLD_RUN_DEV=true npm run build` runs, `grep -rq "__GOLD_RUN__" dist` exits 0

  @req:HOOK-05 @plan:IV @wave:III
  Scenario: The shell fills a portrait phone viewport with an overlay layer on top
    Given the `mobile` (Pixel 7) project
    When the page opens "/" and the hook is ready
    Then #game-container has the viewport's width and height, within 1px
    And it contains exactly one canvas element
    And an element with data-testid "overlay-root" is present
