// src/index.ts
import { startServer } from '@src/server'
import { ServiceMongodb } from '@services/api/database/serviceMongodb'
import { ServiceCron } from '@services/serviceCron'
//import { UpdateService } from '@services/update/updateSevice'
//import { UpdateManager } from '@services/update/updateManager'
//import { ServiceProcessor } from '@services/serviceProcessor'
import { ServiceConfigServer } from '@services/config/serviceConfigServer'
import { ServiceConfigApi } from '@services/config/serviceConfigApi'
import { ServiceCache } from '@services/serviceCache'
//import { config, loadServerConfig } from '@config/index';
import { loadServerConfig, loadApiConfig } from '@config/index'

async function startApp(): Promise<void> {
  try {
    // Étape 0 : Vider le cache
    await ServiceCache.clearAllCache()

    // Étape 1 : Démarrer MongoDB
    await ServiceMongodb.connectToMongoDB()

    // Étape 2 : Charger la configuration utilisateur + server depuis MongoDB
    const serverConfig = await ServiceConfigServer.getConfig()
    await loadServerConfig(serverConfig) // Fusionne la configuration de la base

    const apiConfig = await ServiceConfigApi.getConfig()
    await loadApiConfig(apiConfig)

    // Étape 3 : Mettre à jour les services
    //  await UpdateManager.updateAll()

    // Étape 4 : Initialiser les tâches CRON
    await ServiceCron.initializeCronTasks()

    // Étape 5 : Exécuter les autres tâches
    //   await ServiceProcessor.saveMachi()

    // Étape 6 : Démarrer le serveur
    await startServer()
  } catch (error) {
    console.error("Erreur fatale lors du démarrage de l'application :", error)
    process.exit(1) // Arrête le processus en cas d'erreur critique
  }
}

startApp()
