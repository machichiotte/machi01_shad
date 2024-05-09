// server.js
const dotenv = require('dotenv');
const { connectToMongoDB } = require('./src/services/mongodb.js');
const { app, startServer } = require('./src/services/requestHandlers.js');
const { initializeCronTasks } = require('./src/services/cronTasks.js');

dotenv.config();

const isOfflineMode = process.env.OFFLINE_MODE === 'true';
app.offlineMode = isOfflineMode;

async function initializeServer() {
  try {
    await connectToMongoDB();
    initializeCronTasks();
    startServer();
  } catch (error) {
    console.error('Error during server initialization:', error);
    process.exit(1); // Exit the process if initialization fails
  }
}

initializeServer();
