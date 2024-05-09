// src/services/cronTasks.js
const cron = require("node-cron");
const winston = require("winston");
const nodemailer = require('nodemailer');

const { cronMarkets } = require("./utils.js");
const { mapTrades } = require("./mapping.js");
const {
  getSavedBalance,
  fetchCurrentBalance,
  saveBalanceInDatabase,
} = require("../controllers/balanceController.js");
const {
  updateOrdersFromServer,
} = require("../controllers/ordersController.js");
const {
  fetchLastTrades,
  saveTradesToDatabase,
  saveAllTradesToDatabase,
} = require("../controllers/tradesController.js");

const {
  getSavedAllTickersByExchange,
} = require("../controllers/tickersController.js");

const exchangesToUpdate = ["binance", "kucoin", "htx", "okx", "gateio"];
const CRON_MARKETS = "* */12 * * *";
const CRON_BALANCES = "*/2 * * * *";
const CRON_TRADES = "44 10 * * *";

// Configuration du logger
const logger = winston.createLogger({
  level: "error", // Niveau de journalisation
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log" }), // Destination des journaux
  ],
});

async function executeTask(task, isCritical = false) {
  try {
    await task();
  } catch (error) {
    logger.error(`Erreur lors de l'exécution de la tâche : ${error.message}`, {
      error,
    });
    if (isCritical) {
      sendAlertNotification(error);
    }
  }
}

function sendAlertNotification(error) {
  // Configuration du transporteur SMTP pour l'envoi d'e-mails
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,

    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Configuration du destinataire, expéditeur, sujet et corps de l'e-mail
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: process.env.EMAIL_ADDRESS_SEND,
    subject: 'Alerte : Erreur critique dans la tâche planifiée',
    text: `Une erreur critique s'est produite dans la tâche planifiée : ${error.message}`
  };

  // Envoi de l'e-mail
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
    } else {
      console.log('E-mail envoyé avec succès :', info.response);
    }
  });
}

function setupCronTasks() {
  //cron.schedule(CRON_TICKERS) a preparer afin de recuperer les prix actuels sur les differents exchanges

  cron.schedule(CRON_MARKETS, async () => {
    console.log("Running the cron job for updateMarkets...");

    for (const exchangeId of exchangesToUpdate) {
      executeTask(async () => {
        await updateMarketsForExchange(exchangeId);
      },true);
    }
  });

  cron.schedule(CRON_BALANCES, async () => {
    console.log("Running the cron job for updating balances...");

    for (const exchangeId of exchangesToUpdate) {
      executeTask(async () => {
        const lastBalance = await getSavedBalance();
        const currentBalance = await fetchCurrentBalance(exchangeId);
        const differences = compareBalances(lastBalance, currentBalance);
        saveBalanceInDatabase(currentBalance, exchangeId);
        if (differences.length > 0) {
          await handleBalanceDifferences(differences, exchangeId);
        }
      },true);
    }
  });

  cron.schedule(CRON_TRADES, async () => {
    console.log("Running the cron job for fetching trades...");

    for (const exchangeId of exchangesToUpdate) {
      executeTask(async () => {
        const currentBalance = await fetchCurrentBalance(exchangeId);
        await handleTradesForAllAssets(currentBalance, exchangeId);
      }, true);
    }
  });
}

async function handleTradesForAllAssets(balance, exchangeId) {
  try {
    const newTrades = [];

    // Récupérer les marchés disponibles pour l'échange
    const markets = await getSavedAllTickersByExchange(exchangeId);

    console.log("marketss", markets);
    for (const asset of balance) {
      const symbol = asset.symbol;
      const quoteCurrencies = ["USDT"];
      // const quoteCurrencies = ["USDT", "BTC", "ETH", "USDC"];

      for (const quote of quoteCurrencies) {
        if (symbol != quote) {
          // Vérifier si la paire de trading existe sur le marché
          const marketExists = markets.some(
            (market) => market.symbol === symbol + "/" + quote
          );

          const tradingPair = symbol + "/" + quote;

          if (marketExists) {
            // Récupérer les derniers trades pour la paire de trading
            console.log(`Fetching all trades for pair: ${tradingPair}...`);
            const tradeList = await fetchLastTrades(exchangeId, tradingPair);

            // Mapper les trades pour la paire de trading
            const mappedTrades = mapTrades(exchangeId, tradeList);
            console.log(
              `Mapped ${mappedTrades.length} trades for pair: ${tradingPair}`
            );

            newTrades.push(...mappedTrades);
          } else {
            console.log(
              `Trading pair ${tradingPair} not available on ${exchangeId}`
            );
          }
        }
      }
    }

    // Enregistrer les nouveaux trades dans la base de données MongoDB
    console.log(
      `Total new trades to be saved for ${exchangeId}: ${newTrades.length}`
    );
    await saveAllTradesToDatabase(newTrades);
  } catch (error) {
    console.error(
      `Error handling trades for all assets for ${exchangeId}:`,
      error
    );
    throw error;
  }
}

async function handleBalanceDifferences(differences, exchangeId) {
  try {
    console.log("Starting handleBalanceDifferences...");

    // Mettre à jour les ordres ouverts depuis le serveur
    console.log("Updating open orders from server...");
    await updateOrdersFromServer(exchangeId);
    console.log("Open orders updated.");

    const newTrades = [];

    // Parcourir les différences pour mettre à jour les trades
    for (const difference of differences) {
      console.log(
        `Processing balance difference for symbol: ${difference.symbol}`
      );

      // Ajouter "/USDT" au symbole pour obtenir la paire complète
      const symbol = difference.symbol + "/USDT";

      // Récupérer les derniers trades pour la paire de trading
      console.log(`Fetching last trades for symbol: ${symbol}...`);
      const tradeList = await fetchLastTrades(exchangeId, symbol);

      // Mapper les trades en fonction de la plateforme
      const mappedTrades = mapTrades(exchangeId, tradeList);
      console.log(`Mapped ${mappedTrades.length} trades for symbol: ${symbol}`);

      newTrades.push(...mappedTrades);

      // Vérifier si la différence concerne un nouveau symbole
      if (difference.newSymbol) {
        // Afficher un message pour indiquer qu'une nouvelle stratégie doit être choisie par l'utilisateur
        console.log(
          "New symbol detected. Prompting user to choose strategy..."
        );
      }
    }

    console.log(`Total new trades to be saved: ${newTrades.length}`);

    // Enregistrer les nouveaux trades dans la base de données MongoDB
    console.log("Saving new trades to database...");
    await saveTradesToDatabase(newTrades);
    console.log("New trades saved to database.");

    console.log("handleBalanceDifferences completed successfully.");
  } catch (error) {
    // Gérer les erreurs éventuelles
    console.error(
      `Error handling balance differences for ${exchangeId}:`,
      error
    );
    throw error;
  }
}

/**
 * Compares two balance arrays and returns the differences detected.
 * @param {Array} lastBalance - The array representing the last recorded balance.
 * @param {Array} currentBalance - The array representing the current balance.
 * @returns {Array} - An array containing the differences between the two balances.
 */
function compareBalances(lastBalance, currentBalance) {
  const differences = [];

  // Créer un objet pour stocker les balances précédentes par symbole pour une recherche plus efficace
  const lastBalancesBySymbol = {};
  for (const balance of lastBalance) {
    lastBalancesBySymbol[balance.symbol] = balance;
  }

  // Parcourir les balances actuelles pour comparer avec les balances précédentes
  for (const current of currentBalance) {
    // Vérifier si le symbole existe dans les balances précédentes
    if (lastBalancesBySymbol.hasOwnProperty(current.symbol)) {
      // Récupérer la balance précédente correspondante
      const last = lastBalancesBySymbol[current.symbol];

      // Comparer les balances
      if (
        last.balance !== current.balance &&
        last.platform == current.platform
      ) {
        // Si les balances sont différentes, ajouter à la liste des différences
        differences.push({ symbol: current.symbol, balanceDifference: true });
      }
    } else {
      // Si le symbole est nouveau, ajouter à la liste des différences
      differences.push({ symbol: current.symbol, newSymbol: true });
    }
  }

  return differences;
}

async function updateMarketsForExchange(exchangeId) {
  try {
    await cronMarkets(exchangeId);
    console.log(`updateMarkets completed for ${exchangeId}`);
  } catch (error) {
    console.error(`Error updating markets for ${exchangeId}:`, error);
  }
}

module.exports = { setupCronTasks };
