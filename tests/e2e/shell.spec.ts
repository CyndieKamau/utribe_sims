import { expect, test, type Page } from '@playwright/test';
import type { GoldRunTestHook } from '../../src/dev/testHook';

const HOOK_READY_TIMEOUT_MS = 15_000;
const SIZE_TOLERANCE_PX = 1;

type HookState = ReturnType<GoldRunTestHook['getState']>;

async function waitForHook (page: Page): Promise<void>
{
    await page.waitForFunction(() => window.__GOLD_RUN__?.isReady() === true, undefined, {
        timeout: HOOK_READY_TIMEOUT_MS,
    });
}

function getState (page: Page): Promise<HookState>
{
    return page.evaluate(() => window.__GOLD_RUN__!.getState());
}

function newRun (page: Page, seed: number): Promise<void>
{
    return page.evaluate((runSeed) => window.__GOLD_RUN__!.newRun(runSeed), seed);
}

function collectPageErrors (page: Page): Error[]
{
    const errors: Error[] = [];
    page.on('pageerror', (error) => errors.push(error));
    return errors;
}

test('HOOK-01: the hook reports ready and returns a JSON state snapshot', async ({ page }) =>
{
    const errors = collectPageErrors(page);
    await page.goto('/');
    await waitForHook(page);

    expect(await page.evaluate(() => window.__GOLD_RUN__!.hookVersion)).toBe(1);
    const state = await getState(page);
    expect(state.version).toBe(1);
    expect(Number.isInteger(state.seed)).toBe(true);
    expect(errors).toEqual([]);
});

test('HOOK-02: a new run seed survives a reload', async ({ page }) =>
{
    const errors = collectPageErrors(page);
    await page.goto('/');
    await waitForHook(page);

    await newRun(page, 1234);
    await page.reload();
    await waitForHook(page);

    expect((await getState(page)).seed).toBe(1234);
    expect(errors).toEqual([]);
});

test('HOOK-03: the shell boots when browser storage is blocked', async ({ page }) =>
{
    const errors = collectPageErrors(page);
    await page.addInitScript(() =>
    {
        const blocked = () =>
        {
            throw new DOMException('blocked', 'SecurityError');
        };
        Storage.prototype.getItem = blocked;
        Storage.prototype.setItem = blocked;
        Storage.prototype.removeItem = blocked;
    });

    await page.goto('/');
    await waitForHook(page);
    await newRun(page, 9);

    expect((await getState(page)).seed).toBe(9);
    expect(errors).toEqual([]);
});

test('HOOK-05: the shell fills a portrait phone viewport with an overlay on top', async ({ page }, testInfo) =>
{
    test.skip(testInfo.project.name !== 'mobile', 'Portrait layout is checked on the phone project only');

    const errors = collectPageErrors(page);
    await page.goto('/');
    await waitForHook(page);

    const viewport = page.viewportSize();
    const box = await page.locator('#game-container').boundingBox();
    expect(viewport).not.toBeNull();
    expect(box).not.toBeNull();
    expect(Math.abs(box!.width - viewport!.width)).toBeLessThanOrEqual(SIZE_TOLERANCE_PX);
    expect(Math.abs(box!.height - viewport!.height)).toBeLessThanOrEqual(SIZE_TOLERANCE_PX);

    await expect(page.locator('#game-container canvas')).toHaveCount(1);
    await expect(page.getByTestId('overlay-root')).toBeAttached();
    expect(errors).toEqual([]);
});
