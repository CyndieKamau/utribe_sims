// The only place the game touches persistence. Moving saves to a server
// means editing this file and nothing else.
import type { StateStorage } from 'zustand/middleware';

export const SAVE_KEY = 'gold-run:save';

// Storage can be missing or blocked (private browsing, disabled cookies),
// and in browsers even reading the localStorage getter can throw, so every
// access stays inside try/catch and the game keeps running without saves.
export function loadGame(name: string): string | null {
    try {
        return globalThis.localStorage.getItem(name);
    } catch {
        return null;
    }
}

export function saveGame(name: string, value: string): void {
    try {
        globalThis.localStorage.setItem(name, value);
    } catch {
        // Saving is best effort; the run continues in memory.
    }
}

export function clearSave(name: string): void {
    try {
        globalThis.localStorage.removeItem(name);
    } catch {
        // Nothing to clear if storage is unavailable.
    }
}

export const saveStorage: StateStorage = {
    getItem: loadGame,
    setItem: saveGame,
    removeItem: clearSave,
};
