import { startServer } from '@src/server';
import { MongodbService } from '@services/mongodbService';
import { CronTaskService } from '@services/cronTasksService';
import { UpdateService } from './services/updateSevice';
import { ProcessorService } from './services/processorService';

async function startApp(): Promise<void> {
  try {
    // Démarrer le serveur
    startServer().catch(error => {
      console.error('Erreur lors du démarrage du serveur:', error);
      process.exit(1);
    });

    // Connexion à MongoDB
    await MongodbService.connectToMongoDB();

    // Appeler la fonction updateAll du service dédié
    try {
      await UpdateService.updateAll();
    } catch (error) {
      console.error(
        'Erreur lors de l’exécution de updateAll :', error
      );
      // Continuer sans arrêter le serveur
    }

    // await MigrationSwapService.handleMigrationSwap();
    await CronTaskService.initializeCronTasks();

    await ProcessorService.saveMachi();

  } catch (error) {
    console.error('Error during server initialization:', error);
    process.exit(1); // Exit the process if initialization fails
  }
}

startApp();
