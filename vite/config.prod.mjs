import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: './',
    plugins: [
        react(),
    ],
    logLevel: 'warning',
    build: {
        rolldownOptions: {
            output: {
                codeSplitting: {
                    groups: [
                        { name: 'phaser', test: /node_modules[\\/]phaser[\\/]/ }
                    ]
                }
            }
        }
    }
});
