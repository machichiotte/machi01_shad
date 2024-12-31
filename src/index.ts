// src/index.ts
import { startServer } from '@src/server'
import { MongodbService } from '@src/services/api/database/mongodbService'
import { CronTaskService } from '@services/cronTasksService'
//import { UpdateService } from './services/update/updateSevice'
import { ProcessorService } from './services/processorService'
import { ServerConfigService } from './services/config/serverConfigService'
import { ApiConfigService } from './services/config/apiConfigService'
import { CacheService } from '@services/cacheService'
//import { config, loadServerConfig } from '@config/index';
import { loadServerConfig, loadApiConfig } from '@config/index'

async function startApp(): Promise<void> {
  try {
    // Étape 0 : Vider le cache
    await CacheService.clearAllCache()

    // Étape 1 : Démarrer MongoDB
    await MongodbService.connectToMongoDB()

    // Étape 2 : Charger la configuration utilisateur depuis MongoDB
    const serverConfig = await ServerConfigService.getServerConfig()
    await loadServerConfig(serverConfig) // Fusionne la configuration de la base

    const apiConfig = await ApiConfigService.getApiConfig()
    await loadApiConfig(apiConfig)

    // Étape 3 : Mettre à jour les services
    // await UpdateService.updateAll()

    // Étape 4 : Initialiser les tâches CRON
    await CronTaskService.initializeCronTasks()

    // Étape 5 : Exécuter les autres tâches
    await ProcessorService.saveMachi()

    // Étape 6 : Démarrer le serveur
    await startServer()
  } catch (error) {
    console.error("Erreur fatale lors du démarrage de l'application :", error)
    process.exit(1) // Arrête le processus en cas d'erreur critique
  }
}

startApp()
