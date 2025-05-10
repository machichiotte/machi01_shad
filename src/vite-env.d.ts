/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SERVER_HOST: string
    // Ajoutez ici d'autres variables d'environnement si nécessaire
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}