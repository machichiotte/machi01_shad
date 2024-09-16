// src/index.ts
import dotenv from 'dotenv'
import {
  connectToMongoDB,
  cleanCollectionTrades
} from './services/mongodbService'
import { startServer } from './server'
import { initializeCronTasks } from './services/cron/cronTasks'

import { cronBalances } from './services/cron/taskExecutor'
import { handleMigrationSwaps } from './services/migrationSwapsService'

dotenv.config()

async function startApp(): Promise<void> {
  try {
    startServer().catch(error => {
      console.error('Erreur lors du démarrage du serveur:', error)
      process.exit(1)
    })

    await connectToMongoDB()

    await cleanCollectionTrades()

    await handleMigrationSwaps()

    await cronBalances()

    await initializeCronTasks()

  } catch (error) {
    console.error('Error during server initialization:', error)
    process.exit(1) // Exit the process if initialization fails
  }
}

startApp()
