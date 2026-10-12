import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadGame, SAVE_KEY } from '../../src/engine/save';
import { createGameStore } from '../../src/engine/store';

function memoryStorage() {
    const items = new Map<string, string>();
    return {
        items,
        getItem: (key: string) => items.get(key) ?? null,
        setItem: (key: string, value: string) => void items.set(key, value),
        removeItem: (key: string) => void items.delete(key),
    };
}

function blockedStorage() {
    const blocked = () => {
        throw new DOMException('blocked', 'SecurityError');
    };
    return { getItem: blocked, setItem: blocked, removeItem: blocked };
}

describe('game store', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('loads the state saved by a previous store', () => {
        const storage = memoryStorage();
        vi.stubGlobal('localStorage', storage);

        createGameStore({ initialSeed: () => 1 }).getState().newRun(1234);
        const reloaded = createGameStore().getState();

        expect(reloaded.seed).toBe(1234);
        expect(reloaded.version).toBe(1);
        expect([...storage.items.keys()]).toEqual(['gold-run:save']);
        expect(JSON.parse(storage.items.get('gold-run:save')!)).toEqual({
            state: { version: 1, seed: 1234 },
            version: 1,
        });
    });

    it('keeps working in memory when storage is blocked', () => {
        vi.stubGlobal('localStorage', blockedStorage());

        const store = createGameStore();
        expect(() => store.getState().newRun(77)).not.toThrow();

        expect(store.getState().seed).toBe(77);
        expect(loadGame(SAVE_KEY)).toBeNull();
    });

    it('replaces a save from another version with a fresh state', () => {
        const storage = memoryStorage();
        storage.setItem('gold-run:save', '{"state":{"version":0,"seed":5},"version":0}');
        vi.stubGlobal('localStorage', storage);

        const store = createGameStore({ initialSeed: () => 7 });

        expect(store.getState()).toMatchObject({ version: 1, seed: 7 });
    });
});
