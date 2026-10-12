export const SAVE_VERSION = 1;

export interface GameState {
    version: typeof SAVE_VERSION;
    seed: number;
}

export function createInitialState(seed: number): GameState {
    return { version: SAVE_VERSION, seed };
}
