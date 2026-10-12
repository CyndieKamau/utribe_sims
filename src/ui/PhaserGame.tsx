import { useEffect, useLayoutEffect, useRef, type Ref } from 'react';
import type { Game, Scene } from 'phaser';
import StartGame from '../game/main';
import { EventBus, GameEvent } from '../game/EventBus';

export interface IRefPhaserGame
{
    game: Game | null;
    scene: Scene | null;
}

interface IProps
{
    ref?: Ref<IRefPhaserGame | null>;
}

function assignRef (ref: Ref<IRefPhaserGame | null> | undefined, value: IRefPhaserGame)
{
    if (typeof ref === 'function')
    {
        ref(value);
    }
    else if (ref)
    {
        ref.current = value;
    }
}

export function PhaserGame ({ ref }: IProps)
{
    const game = useRef<Game | null>(null);

    useLayoutEffect(() =>
    {
        if (game.current === null)
        {
            game.current = StartGame('game-container');
            assignRef(ref, { game: game.current, scene: null });
        }

        return () =>
        {
            if (game.current)
            {
                game.current.destroy(true);
                game.current = null;
            }
        }
    }, [ref]);

    useEffect(() =>
    {
        const onSceneReady = (sceneInstance: Scene) =>
        {
            assignRef(ref, { game: game.current, scene: sceneInstance });
        };

        EventBus.on(GameEvent.SceneReady, onSceneReady);

        return () =>
        {
            EventBus.off(GameEvent.SceneReady, onSceneReady);
        }
    }, [ref]);

    return (
        <div id="game-container"></div>
    );
}
