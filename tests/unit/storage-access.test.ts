import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const srcDir = fileURLToPath(new URL('../../src', import.meta.url));
const SAVE_MODULE = 'engine/save.ts';

function sourceFiles(): string[] {
    return readdirSync(srcDir, { recursive: true, encoding: 'utf8' })
        .map((path) => path.split('\\').join('/'))
        .filter((path) => /\.(ts|tsx)$/.test(path));
}

describe('storage access', () => {
    it('only the save module touches localStorage', () => {
        const files = sourceFiles();
        expect(files).toContain(SAVE_MODULE);

        const offenders = files.filter(
            (path) => path !== SAVE_MODULE && readFileSync(`${srcDir}/${path}`, 'utf8').includes('localStorage'),
        );
        expect(offenders).toEqual([]);
    });
});
