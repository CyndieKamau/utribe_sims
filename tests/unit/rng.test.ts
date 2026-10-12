import { describe, expect, it } from 'vitest';
import { createRng, deriveSeed, freshSeed } from '../../src/engine/rng';

function draw(rng: () => number, count: number): number[] {
    return Array.from({ length: count }, () => rng());
}

describe('seeded rng', () => {
    it('gives the same sequence for the same seed and key', () => {
        const a = draw(createRng(deriveSeed(42, 'npc-traits')), 100);
        const b = draw(createRng(deriveSeed(42, 'npc-traits')), 100);
        expect(a).toEqual(b);
    });

    it('keeps every value in [0, 1)', () => {
        for (const value of draw(createRng(deriveSeed(42, 'npc-traits')), 100)) {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThan(1);
        }
    });

    it('gives a different sequence for a different key', () => {
        const traits = draw(createRng(deriveSeed(42, 'npc-traits')), 10);
        const events = draw(createRng(deriveSeed(42, 'events')), 10);
        expect(events).not.toEqual(traits);
    });

    it('derives different seeds from different run seeds', () => {
        expect(deriveSeed(1, 'a')).not.toBe(deriveSeed(2, 'a'));
    });

    it('picks a fresh seed as an unsigned 32-bit integer', () => {
        const seed = freshSeed();
        expect(Number.isInteger(seed)).toBe(true);
        expect(seed).toBeGreaterThanOrEqual(0);
        expect(seed).toBeLessThan(2 ** 32);
    });
});
