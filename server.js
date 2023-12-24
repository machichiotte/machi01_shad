// server.js
const dotenv = require('dotenv');
const { connectMDB } = require('./src/services/mongodb.js');
const { app, startServer } = require('./src/routes/requestHandlers.js');
const { setupCronTasks } = require('./src/routes/cronTasks.js');

dotenv.config();

const isOfflineMode = process.env.OFFLINE_MODE === 'true';
app.offlineMode = isOfflineMode;

async function initializeServer() {
  try {
    await connectMDB();
    setupCronTasks();
    startServer();
  } catch (error) {
    console.error('Error during server initialization:', error);
    process.exit(1); // Exit the process if initialization fails
  }
}

initializeServer();
