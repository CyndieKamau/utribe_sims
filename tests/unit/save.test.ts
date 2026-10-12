import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSave, loadGame, saveGame } from '../../src/engine/save';

function memoryStorage() {
    const items = new Map<string, string>();
    return {
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

function expectSafeWhenUnavailable() {
    expect(() => saveGame('k', 'v')).not.toThrow();
    expect(() => clearSave('k')).not.toThrow();
    expect(loadGame('k')).toBeNull();
}

describe('save module', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('saves, loads and clears a value', () => {
        vi.stubGlobal('localStorage', memoryStorage());
        saveGame('k', 'v');
        expect(loadGame('k')).toBe('v');
        clearSave('k');
        expect(loadGame('k')).toBeNull();
    });

    it('never throws when storage access is blocked', () => {
        vi.stubGlobal('localStorage', blockedStorage());
        expectSafeWhenUnavailable();
    });

    it('never throws when storage does not exist', () => {
        vi.stubGlobal('localStorage', undefined);
        expectSafeWhenUnavailable();
    });
});
