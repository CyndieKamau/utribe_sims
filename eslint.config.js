import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const PURE_TS_MESSAGE =
    'src/engine and src/systems are pure TypeScript: no Phaser, React or the React zustand entry. Use zustand/vanilla.';
const DISPLAY_LAYER_MESSAGE = 'Engine and systems must not import the display layers or dev tooling.';

export default defineConfig([
    globalIgnores(['dist', 'node_modules', 'playwright-report', 'test-results', 'blob-report', '.vitest']),
    {
        files: ['**/*.{js,mjs,ts,tsx}'],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        rules: {
            'no-restricted-properties': [
                'error',
                { object: 'Math', property: 'random', message: 'Use the seeded RNG in src/engine/rng.ts.' },
            ],
        },
    },
    {
        files: ['src/**/*.{ts,tsx}'],
        extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
        languageOptions: { globals: globals.browser },
    },
    {
        files: ['tests/**/*.ts', '*.config.{js,ts}', 'eslint.config.js', 'vite/**/*.mjs'],
        languageOptions: { globals: globals.node },
    },
    {
        files: ['src/engine/**/*.ts', 'src/systems/**/*.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        { name: 'phaser', message: PURE_TS_MESSAGE },
                        { name: 'react', message: PURE_TS_MESSAGE },
                        { name: 'react-dom', message: PURE_TS_MESSAGE },
                        { name: 'zustand', message: PURE_TS_MESSAGE },
                    ],
                    patterns: [
                        { group: ['phaser/*', 'react/*', 'react-dom/*'], message: PURE_TS_MESSAGE },
                        {
                            group: ['**/game', '**/game/**', '**/ui', '**/ui/**', '**/dev', '**/dev/**'],
                            message: DISPLAY_LAYER_MESSAGE,
                        },
                    ],
                },
            ],
        },
    },
]);
