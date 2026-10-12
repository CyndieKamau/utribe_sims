# Acceptance predicates: architecture boundaries enforced by lint.
# Declared once here; plans claim by @req ID via `effects:`. Frozen at execution time.

@sprint:2026-10-12-phase-0-scaffold
Feature: Lint enforces the pure-TypeScript engine boundary and the seeded-RNG rule

  @req:BND-01 @plan:II @wave:II
  Scenario: Engine and systems code cannot import a framework or a display layer
    Given the ESLint flat config in eslint.config.js
    When source that imports "phaser", "react", "react-dom", "zustand", "../game/EventBus", "../ui/App" or "../dev/testHook" is linted as src/engine/probe.ts and as src/systems/probe.ts
    Then ESLint reports a no-restricted-imports error for each import
    And tests/unit/boundaries.test.ts asserts every case and passes under `npm test`

  @req:BND-02 @plan:II @wave:II
  Scenario: Engine code may use the React-free zustand entries
    Given the ESLint flat config in eslint.config.js
    When source that imports "zustand/vanilla" and "zustand/middleware" is linted as src/engine/probe.ts
    Then ESLint reports no no-restricted-imports error

  @req:BND-03 @plan:II @wave:II
  Scenario: Math.random is banned everywhere
    Given the ESLint flat config in eslint.config.js
    When source containing `Math.random()` or `const { random } = Math` is linted as src/engine/probe.ts, src/game/probe.ts, src/ui/probe.tsx and tests/unit/probe.test.ts
    Then ESLint reports a no-restricted-properties error for each file
