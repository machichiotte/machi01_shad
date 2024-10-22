import { startServer } from '@src/server';
import { PLATFORM } from './types/platform';
import { MongodbService } from '@services/mongodbService';
import { TimestampService } from '@services/timestampService';
import { CmcService } from '@services/cmcService';
import { BalanceService } from '@services/balanceService';
import { MarketService } from '@services/marketService';
import { TickerService } from '@services/tickerService';
import { CronTaskService } from '@services/cronTasksService';

// Fonction pour comparer les timestamps
function hasTimeElapsed(lastTimestamp: string, intervalInMs: number): boolean {
  if (isNaN(parseInt(lastTimestamp))) {
    return false;
  }
  const currentTime = Date.now();
  return (currentTime - parseInt(lastTimestamp)) > intervalInMs;
}

async function startApp(): Promise<void> {
  try {
    // Démarrer le serveur
    startServer().catch(error => {
      console.error('Erreur lors du démarrage du serveur:', error);
      process.exit(1);
    });

    // Connexion à MongoDB
    await MongodbService.connectToMongoDB();
    await updateAll();

    // await MigrationSwapService.handleMigrationSwap();

  } catch (error) {
    console.error('Error during server initialization:', error);
    process.exit(1); // Exit the process if initialization fails
  }
}

async function updateAll() {
  // Récupérer les timestamps depuis MongoDB via ton service dédié (TickerService, ou autre)
  const timestamps = await TimestampService.fetchDatabaseTimestamp();

  // Récupération des timestamps pertinents
  const lastCmcUpdate = timestamps.cmc.$numberLong ? timestamps.cmc.$numberLong : '0';  // Timestamp pour CMC

  // Vérifier si l'intervalle est dépassé pour CMC (24 heures = 86400000ms)
  if (hasTimeElapsed(lastCmcUpdate, 24 * 60 * 60 * 1000)) {
    console.log('CMC data is outdated, updating now...');
    await CmcService.updateCmcData();
  }

  // --- Gérer les balances pour chaque plateforme ---
  const balanceTimestamps = timestamps.balance;

  // Délai de 5 minutes pour les balances
  const balanceUpdateInterval = 5 * 60 * 1000; // 5 minutes en millisecondes

  // Parcourir les plateformes dans les timestamps de balance
  for (const platform in balanceTimestamps) {
    const lastBalanceUpdate = balanceTimestamps[platform]?.$numberLong || '0';

    // Vérifier si l'intervalle de temps est dépassé pour chaque plateforme
    if (hasTimeElapsed(lastBalanceUpdate, balanceUpdateInterval)) {
      console.log(`Balance for ${platform} is outdated, updating now...`);
      await BalanceService.updateBalancesForPlatform(platform as PLATFORM);
    }
  }

  // --- Gérer les marchés pour chaque plateforme
  const marketTimestamps = timestamps.market;
  const marketUpdateInterval = 24 * 60 * 60 * 1000; // 5 minutes en millisecondes

  for (const platform in marketTimestamps) {
    const lastMarketUpdate = marketTimestamps[platform]?.$numberLong || '0';
    if (hasTimeElapsed(lastMarketUpdate, marketUpdateInterval)) {
      console.log(`Market data for ${platform} is outdated, updating now...`);
      await MarketService.updateMarketsForPlatform(platform as PLATFORM);
    }
  }

  // --- Gérer les tickers pour chaque plateforme
  const tickerTimestamps = timestamps.ticker;
  const tickerUpdateInterval = 1 * 60 * 1000;

  for (const platform in tickerTimestamps) {
    const lastTickerUpdate = tickerTimestamps[platform]?.$numberLong || '0';
    if (hasTimeElapsed(lastTickerUpdate, tickerUpdateInterval)) {
      console.log(`Ticker data for ${platform} is outdated, updating now...`);
      await TickerService.updateTickersForPlatform(platform as PLATFORM);
    }
  }

  // Exécuter les tâches Cron restantes
  await CronTaskService.initializeCronTasks();
}


startApp();
