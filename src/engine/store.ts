import { createStore } from 'zustand/vanilla';
import { createJSONStorage, persist } from 'zustand/middleware';
import { freshSeed } from './rng';
import { SAVE_KEY, saveStorage } from './save';
import { createInitialState, SAVE_VERSION, type GameState } from './state';

export interface GameActions {
    newRun(seed: number): void;
}

export type GameStore = GameState & GameActions;

export interface GameStoreOptions {
    initialSeed?: () => number;
}

export function createGameStore(options: GameStoreOptions = {}) {
    const pickSeed = options.initialSeed ?? freshSeed;

    return createStore<GameStore>()(
        persist(
            (set) => ({
                ...createInitialState(pickSeed()),
                newRun: (runSeed) => set(createInitialState(runSeed)),
            }),
            {
                name: SAVE_KEY,
                version: SAVE_VERSION,
                storage: createJSONStorage(() => saveStorage),
                partialize: ({ version, seed }): GameState => ({ version, seed }),
                // Phase 0 policy: a save from any other version starts a fresh run
                // rather than being dropped silently or loaded in the wrong shape.
                migrate: () => createInitialState(pickSeed()),
            },
        ),
    );
}

export type GameStoreApi = ReturnType<typeof createGameStore>;

export const gameStore = createGameStore();
