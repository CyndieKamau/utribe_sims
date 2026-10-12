import { useRef } from 'react';
import { PhaserGame, type IRefPhaserGame } from './PhaserGame';
import styles from './App.module.css';

function App ()
{
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div className={styles.root}>
            <PhaserGame ref={phaserRef} />
            <div className={styles.overlay} data-testid="overlay-root" />
        </div>
    );
}

export default App;
