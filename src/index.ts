// src/index.ts
import { startServer } from '@src/server';
import { ServiceMongodb } from '@services/api/database/serviceMongodb';
import { ServiceCron } from '@services/serviceCron';
// import { UpdateService } from '@services/update/updateSevice';
// import { UpdateManager } from '@services/update/updateManager';
// import { ServiceProcessor } from '@services/serviceProcessor';
import { ServiceBinanceWs } from '@services/api/platform/serviceBinanceWs'; // Import du service WebSocket

import { ServiceConfigServer } from '@services/config/serviceConfigServer';
import { ServiceConfigApi } from '@services/config/serviceConfigApi';
import { ServiceCache } from '@services/serviceCache';
import { loadServerConfig, loadApiConfig } from '@config/index';
import path from 'path'; import { logger } from '@utils/loggerUtil'; // Importer le logger Winston
import { formatErrorForLog } from '@utils/errorUtil'; // Importer le helper

async function startApp(): Promise<void> {
  const operation = 'startApp';
  logger.info('Starting application initialization...', { module: path.parse(__filename).name, operation });
  try {
    // Étape 0 : Vider le cache
    logger.info('[Step 0] Clearing all cache...', { module: path.parse(__filename).name, operation });
    await ServiceCache.clearAllCache();
    logger.info('[Step 0] Cache cleared.', { module: path.parse(__filename).name, operation });

    // Étape 1 : Démarrer MongoDB
    logger.info('[Step 1] Connecting to MongoDB...', { module: path.parse(__filename).name, operation });
    await ServiceMongodb.connectToMongoDB();
    logger.info('[Step 1] MongoDB connected.', { module: path.parse(__filename).name, operation });

    // Étape 2 : Charger la configuration depuis MongoDB
    logger.info('[Step 2] Loading Server configuration from DB...', { module: path.parse(__filename).name, operation });
    const serverConfig = await ServiceConfigServer.getConfig();
    await loadServerConfig(serverConfig); // Fusionne la config DB dans l'objet config global
    logger.info('[Step 2] Server configuration loaded and merged.', { module: path.parse(__filename).name, operation });

    logger.info('[Step 2] Loading API configuration from DB...', { module: path.parse(__filename).name, operation });
    const apiConfig = await ServiceConfigApi.getConfig();
    await loadApiConfig(apiConfig); // Fusionne la config API
    logger.info('[Step 2] API configuration loaded and merged.', { module: path.parse(__filename).name, operation });

    // Étape 3 : Mettre à jour les services 
    // logger.info('[Step 3] Updating services via UpdateManager...', { module: moduleName, operation });
    // await UpdateManager.updateAll();
    // logger.info('[Step 3] Services updated.', { module: moduleName, operation });

    // Étape 4 : Initialiser les tâches CRON
    logger.info('[Step 4] Initializing CRON tasks...', { module: path.parse(__filename).name, operation });
    await ServiceCron.initializeCronTasks();
    logger.info('[Step 4] CRON tasks initialized.', { module: path.parse(__filename).name, operation }); // Le détail est loggué par ServiceCron

    // Étape 5 : Démarrer la WebSocket Binance
    logger.info('[Step 5] Starting Binance WebSocket...');
    await ServiceBinanceWs.init() // Initialisation des paramètres de souscription
    ServiceBinanceWs.connect(); // Démarrage de la WebSocket
    logger.info('[Step 5] Binance WebSocket started.');

    // Étape 6 : Exécuter les autres tâches 
    // logger.info('[Step 6] Executing other tasks (ServiceProcessor)...', { module: path.parse(__filename).name, operation });
    // await ServiceProcessor.saveDashboard();
    // logger.info('[Step 6] Other tasks executed.', { module: path.parse(__filename).name, operation });

    // Étape 7 : Démarrer le serveur Express
    logger.info('[Step 7] Starting Express server...', { module: path.parse(__filename).name, operation });
    await startServer(); // La fonction startServer loggue déjà son succès/échec
    logger.info('[Step 7] Express server start process initiated.', { module: path.parse(__filename).name, operation });

    logger.info('Application initialized successfully!', { module: path.parse(__filename).name, operation });

  } catch (error) {
    logger.error('Fatal error during application startup:', {
      module: path.parse(__filename).name,
      operation,
      error: formatErrorForLog(error) // Utiliser le helper
    });
    // Arrêter le processus en cas d'échec critique du démarrage
    process.exit(1);
  }
}

// Lancer l'application
startApp();

// --- Gestion des signaux d'arrêt (BONNE PRATIQUE) ---
// (Déplacé de server.ts pour être au niveau application globale)
const gracefulShutdown = async (signal: string) => {
  logger.warn(`Received ${signal}. Starting graceful shutdown...`, { module: path.parse(__filename).name, signal });
  // Ajoutez ici la logique pour fermer proprement les connexions (DB, etc.)
  // Exemple :
  await ServiceMongodb.disconnect(); // Assurez-vous que cette méthode existe et fonctionne

  logger.info('Graceful shutdown completed.');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Capturé par Ctrl+C