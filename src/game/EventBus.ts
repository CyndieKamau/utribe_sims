import { Events } from 'phaser';

// Used to emit events between components, HTML and Phaser scenes
export const EventBus = new Events.EventEmitter();

export const GameEvent = {
    SceneReady: 'current-scene-ready',
} as const;

export type GameEvent = (typeof GameEvent)[keyof typeof GameEvent];
