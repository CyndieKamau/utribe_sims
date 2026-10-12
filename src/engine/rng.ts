const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const MULBERRY_INCREMENT = 0x6d2b79f5;
const UINT32_RANGE = 2 ** 32;

export type Rng = () => number;

// Each roll stream gets its own seed from the run seed plus a stable key,
// so no generator position needs to be saved for reloads to replay the same rolls.
export function deriveSeed(seed: number, key: string): number {
    let hash = FNV_OFFSET_BASIS ^ (seed >>> 0);
    for (let i = 0; i < key.length; i++) {
        hash ^= key.charCodeAt(i);
        hash = Math.imul(hash, FNV_PRIME);
    }
    return hash >>> 0;
}

// mulberry32
export function createRng(seed: number): Rng {
    let state = seed >>> 0;
    return () => {
        state = (state + MULBERRY_INCREMENT) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE;
    };
}

// The only entropy source in the game; it picks a new run's seed and nothing else.
export function freshSeed(): number {
    return crypto.getRandomValues(new Uint32Array(1))[0];
}
