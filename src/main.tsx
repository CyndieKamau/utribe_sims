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

renderApp();
