// config/index.ts
import dotenv from 'dotenv';
import path from 'path';
import { EnvironmentConfig } from '@config/types';

import { envConfig } from '@config/envConfig';

// Charger le fichier .env correspondant à l'environnement
const envFilePath = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || "dev"}`);
dotenv.config({ path: envFilePath });

// Charger des configurations spécifiques selon l'environnement
const environmentConfig = (): EnvironmentConfig => {
    return envConfig;
};

// Fusionner la configuration par défaut avec celle de l'environnement
const config: EnvironmentConfig = { ...envConfig, ...environmentConfig() };

export default config;