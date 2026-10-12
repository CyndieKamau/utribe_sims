# Acceptance predicates: store, save module and seeded RNG (pure TypeScript).
# Declared once here; plans claim by @req ID via `effects:`. Frozen at execution time.

@sprint:2026-10-12-phase-0-scaffold
Feature: Game state is seeded, versioned and saved through one module that survives broken storage

  @req:STO-01 @plan:III @wave:II
  Scenario: The seeded RNG is reproducible and keyed
    Given createRng and deriveSeed from src/engine/rng.ts
    When two generators are created from deriveSeed(42, "npc-traits") and each draws 100 values
    Then both sequences are identical and every value is in [0, 1)
    And a generator from deriveSeed(42, "events") produces a different first 10 values
    And freshSeed() returns an integer in [0, 2^32)

  @req:STO-02 @plan:III @wave:II
  Scenario: State saved by one store instance is loaded by the next
    Given an in-memory localStorage stub
    When a store from createGameStore() calls newRun(1234) and a second createGameStore() is created over the same storage
    Then the second store's state has seed 1234 and version 1
    And the stub holds exactly one key, "gold-run:save", whose JSON has the shape { state: { version, seed }, version }

  @req:STO-03 @plan:III @wave:II
  Scenario: The game keeps working when storage is blocked
    Given a localStorage stub whose getItem, setItem and removeItem all throw a SecurityError
    When createGameStore() is called and then newRun(77) is called
    Then neither call throws
    And the store's in-memory state has seed 77
    And loadGame("gold-run:save") returns null

  @req:STO-04 @plan:III @wave:II
  Scenario: A save from another version is replaced, not silently dropped mid-run
    Given localStorage holds "gold-run:save" = {"state":{"version":0,"seed":5},"version":0}
    When createGameStore({ initialSeed: () => 7 }) is created
    Then the store's state is { version: 1, seed: 7 }
    And no error is thrown
