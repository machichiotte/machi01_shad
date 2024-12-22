// src/index.ts
import { startServer } from '@src/server';
import { MongodbService } from '@services/mongodbService';
import { CronTaskService } from '@services/cronTasksService';
import { UpdateService } from './services/updateSevice';
import { ProcessorService } from './services/processorService';
import { ServerConfigService } from './services/serverConfigService';

async function startApp(): Promise<void> {
  startServer()
    .then(() => MongodbService.connectToMongoDB())
    .then(() =>
      ServerConfigService.getServerConfig()
        .then(userConfig => console.log('Configuration utilisateur chargée:', userConfig))
        .catch(error => console.error('Erreur de chargement de la configuration utilisateur:', error))
    )
    .then(() =>
      UpdateService.updateAll()
        .catch(error => console.error(`Erreur lors de l'exécution de updateAll :`, error))
    )
    .then(() =>
      CronTaskService.initializeCronTasks()
        .catch(error => console.error(`Erreur lors de l'exécution de initializeCronTasks :`, error))
    )
    .then(() =>
      ProcessorService.saveMachi()
        .catch(error => console.error(`Erreur lors de l'exécution de saveMachi :`, error))
    )
    .catch(error => {
      console.error('Erreur fatale:', error);
      process.exit(1); // Arrêter le processus en cas d'erreur critique
    });
}

startApp();
