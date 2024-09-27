// src/index.ts
import { startServer } from '@src/server'
import { MongodbService } from '@services/mongodbService'
import { BalanceService } from '@services/balanceService'
//import { CronTaskService } from '@src/services/cronTasksService'
//import { MigrationSwapService } from './services/migrationSwapService'

async function startApp(): Promise<void> {
  try {
    startServer().catch(error => {
      console.error('Erreur lors du démarrage du serveur:', error)
      process.exit(1)
    })

    await MongodbService.connectToMongoDB()

    //await MigrationSwapService.handleMigrationSwap()

    await BalanceService.cronBalance()

    //await CronTaskService.initializeCronTasks()

  } catch (error) {
    console.error('Error during server initialization:', error)
    process.exit(1) // Exit the process if initialization fails
  }
}

startApp()