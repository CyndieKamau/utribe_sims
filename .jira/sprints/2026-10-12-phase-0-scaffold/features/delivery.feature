# Acceptance predicates: CI, Cloudflare Pages previews and durable docs.
# Declared once here; plans claim by @req ID via `effects:`. Frozen at execution time.

@sprint:2026-10-12-phase-0-scaffold
Feature: Every PR is checked by CI and gets a phone-openable preview, and the architecture is written down

  @req:DEL-01 @plan:V @wave:IV
  Scenario: CI runs the full gate on every pull request
    Given .github/workflows/ci.yml triggers on pull_request and on push to main
    When the sprint PR is opened
    Then the workflow runs lint, typecheck, test, build, a "__GOLD_RUN__ absent from dist" check and e2e as separate steps
    And `gh pr checks` reports the CI job as pass

  @req:DEL-02 @plan:V @wave:IV
  Scenario: The README tells a newcomer how to run the repo and connect Cloudflare Pages
    Given README.md
    When it is read
    Then it lists the Node version and the commands npm ci, npx playwright install chromium, npm run dev, npm test, npm run e2e, npm run lint, npm run typecheck and npm run build
    And it has a "Deploy previews" section that names Cloudflare Pages, build command `npm run build`, output directory `dist`, production branch `main`, and `VITE_GOLD_RUN_DEV=true` on the Preview environment only
    And it states that creating the Cloudflare Pages project is a manual owner step
    And it credits phaserjs/template-react-ts with the pinned commit SHA and its MIT notice

  @req:DEL-03 @plan:V @wave:IV
  Scenario: The PR preview opens on a phone (owner-verified)
    Given the owner has connected the repo to a Cloudflare Pages project per the README
    When the owner opens the sprint PR's *.pages.dev preview URL on a phone browser, signed out of Cloudflare
    Then the page loads with no login wall and a canvas fills the portrait screen
    And the owner records "preview opens on phone: yes" with the URL in EXECUTION.md

  @req:DEL-04 @plan:V @wave:IV
  Scenario: Architecture and content conventions are documented
    Given docs/ARCHITECTURE.md and docs/CONTENT_GUIDE.md
    When they are read
    Then ARCHITECTURE.md has sections "Layers", "Event bus", "Store and saving", "Seeded RNG", "Test hook" and "Tooling"
    And CONTENT_GUIDE.md has sections "Where content lives", "Map authoring" and "Voice and banned words"
    And "Map authoring" states the named-tile-constants, single tiles.ts and interactables-in-the-map-module convention
    And "Voice and banned words" points to CLAUDE.md "Content rules" instead of copying the list
