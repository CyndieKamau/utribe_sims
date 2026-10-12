import { AUTO, Game, Scale, type Types } from 'phaser';
import { Boot } from './scenes/Boot';

const SHELL_BACKGROUND_COLOR = '#1b1b1b';

const config: Types.Core.GameConfig = {
    type: AUTO,
    parent: 'game-container',
    backgroundColor: SHELL_BACKGROUND_COLOR,
    scale: {
        mode: Scale.RESIZE,
        autoCenter: Scale.CENTER_BOTH,
    },
    scene: [Boot],
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
