import { Scene } from 'phaser';
import { EventBus, GameEvent } from '../EventBus';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    create ()
    {
        EventBus.emit(GameEvent.SceneReady, this);
    }
}
