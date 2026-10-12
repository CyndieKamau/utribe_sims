/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOLD_RUN_DEV?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
