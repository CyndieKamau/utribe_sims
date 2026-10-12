import { ESLint, type Linter } from 'eslint';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const cwd = fileURLToPath(new URL('../..', import.meta.url));
const eslint = new ESLint({ cwd });

const configUrl = pathToFileURL(`${cwd}eslint.config.js`).href;
const { default: repoConfig } = (await import(configUrl)) as { default: Linter.Config[] };

// The repo config minus the engine/systems blocks, so a control run can show that the
// import hits come from those blocks and nothing else.
const isBoundaryBlock = (block: Linter.Config) =>
    (block.files ?? []).flat().some((glob) => glob === 'src/engine/**/*.ts' || glob === 'src/systems/**/*.ts');
const controlConfig = repoConfig.filter((block) => !isBoundaryBlock(block));
const controlEslint = new ESLint({ cwd, overrideConfigFile: true, overrideConfig: controlConfig });

async function countRuleHits (linter: ESLint, code: string, filePath: string, ruleId: string): Promise<number>
{
    const [result] = await linter.lintText(code, { filePath });
    return result.messages.filter((message) => message.ruleId === ruleId).length;
}

const ruleHits = (code: string, filePath: string, ruleId: string) => countRuleHits(eslint, code, filePath, ruleId);

const boundaryFiles = ['src/engine/probe.ts', 'src/systems/probe.ts'];
const bannedImports = [
    "import 'phaser';",
    "import 'react';",
    "import 'react-dom';",
    "import { create } from 'zustand'; export const c = create;",
    "import { EventBus } from '../game/EventBus'; export const e = EventBus;",
    "import App from '../ui/App'; export const a = App;",
    "import { installTestHook } from '../dev/testHook'; export const i = installTestHook;",
];
const bannedImportCases = boundaryFiles.flatMap((filePath) => bannedImports.map((code) => [filePath, code]));

describe('engine and systems import boundary', () =>
{
    it.each(bannedImportCases)('%s rejects %s', async (filePath, code) =>
    {
        expect(await ruleHits(code, filePath, 'no-restricted-imports')).toBeGreaterThanOrEqual(1);
    });

    it.each(bannedImportCases)('control config without the boundary blocks lets %s import %s', async (filePath, code) =>
    {
        expect(await countRuleHits(controlEslint, code, filePath, 'no-restricted-imports')).toBe(0);
    });

    it('allows the React-free zustand entries in engine code', async () =>
    {
        const code = "import { createStore } from 'zustand/vanilla'; import { persist } from 'zustand/middleware'; export { createStore, persist };";
        expect(await ruleHits(code, 'src/engine/probe.ts', 'no-restricted-imports')).toBe(0);
    });

    it('does not apply the import ban outside engine and systems', async () =>
    {
        expect(await ruleHits("import 'phaser';", 'src/game/probe.ts', 'no-restricted-imports')).toBe(0);
    });
});

describe('Math.random ban', () =>
{
    const randomUses = [
        'export const r = Math.random();',
        'const { random } = Math; export const r = random();',
    ];
    const lintedFiles = ['src/engine/probe.ts', 'src/game/probe.ts', 'src/ui/probe.tsx', 'tests/unit/probe.test.ts'];
    const randomCases = lintedFiles.flatMap((filePath) => randomUses.map((code) => [filePath, code]));

    it.each(randomCases)('%s rejects %s', async (filePath, code) =>
    {
        expect(await ruleHits(code, filePath, 'no-restricted-properties')).toBeGreaterThanOrEqual(1);
    });
});
