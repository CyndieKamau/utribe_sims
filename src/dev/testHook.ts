import { gameStore } from '../engine/store';
import { EventBus, GameEvent } from '../game/EventBus';

export interface GoldRunTestHook {
    readonly hookVersion: 1;
    isReady(): boolean;
    getState(): { version: number; seed: number };
    newRun(seed: number): void;
}

declare global {
    interface Window {
        __GOLD_RUN__?: GoldRunTestHook;
    }
}

let ready = false;

function onSceneReady (): void
{
    ready = true;
}

export function installTestHook (): void
{
    if (window.__GOLD_RUN__)
    {
        return;
    }

    EventBus.on(GameEvent.SceneReady, onSceneReady);

    window.__GOLD_RUN__ = {
        hookVersion: 1,
        isReady: () => ready,
        getState: () =>
        {
            const { version, seed } = gameStore.getState();
            return { version, seed };
        },
        newRun: (seed) => gameStore.getState().newRun(seed),
    };
}
