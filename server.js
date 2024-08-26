// server.js
const dotenv = require('dotenv');
const { connectToMongoDB, cleanCollectionTrades } = require('./src/services/mongodbService.js');
const { app, startServer } = require('./src/services/requestHandlers.js');
const { initializeCronTasks } = require('./src/services/cron/cronTasks.js');

const {
  cronTickers,
  cronMarkets,
  cronBalances
} = require("./src/services/cron/taskExecutor.js");

dotenv.config();

const isOfflineMode = process.env.OFFLINE_MODE === 'true';
app.offlineMode = isOfflineMode;

async function initializeServer() {
  try {
    await connectToMongoDB();

    //await cleanCollectionTrades();
    //await cronTickers();
    //await cronMarkets();
    await cronBalances();

    await initializeCronTasks();
    startServer();
  } catch (error) {
    console.error('Error during server initialization:', error);
    process.exit(1); // Exit the process if initialization fails
  }
}

initializeServer();
