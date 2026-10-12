import React from 'react';
import ReactDOM from 'react-dom/client';
import './ui/global.css';
import App from './ui/App';

function renderApp ()
{
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}

// The test hook must be installed before React renders so the scene-ready event can't be missed.
const testHookEnabled = import.meta.env.DEV || import.meta.env.VITE_GOLD_RUN_DEV === 'true';

const ready = testHookEnabled
    ? import('./dev/testHook').then(({ installTestHook }) => installTestHook())
    : Promise.resolve();

ready.then(renderApp, (error: unknown) =>
{
    console.error(error);
    renderApp();
});
