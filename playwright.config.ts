import { defineConfig, devices } from '@playwright/test';

const DEV_SERVER_URL = 'http://localhost:8080';

export default defineConfig({
    testDir: 'tests/e2e',
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: DEV_SERVER_URL,
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'mobile', use: { ...devices['Pixel 7'] } },
        { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        command: 'npm run dev',
        url: DEV_SERVER_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
