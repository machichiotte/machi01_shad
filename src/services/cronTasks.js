// src/services/cronTasks.js
const cron = require("node-cron");
const nodemailer = require("nodemailer");

const config = require("./config");

const { getAllCalculs } = require("../services/metrics/global.js");

const { errorLogger, infoLogger } = require("../utils/loggerUtil.js");

const { cronUtilsMarkets, cronUtilsTickers } = require("../utils/cronUtil.js");
const { mapTrades } = require("./mapping.js");
const {
  getSavedBalance,
  fetchCurrentBalance,
  saveBalanceInDatabase,
} = require("../controllers/balanceController.js");
const {
  getSavedOrders,
  updateOrdersFromServer,
} = require("../controllers/ordersController.js");
const {
  getSavedTrades,
  fetchLastTrades,
  saveTradesToDatabase,
  saveAllTradesToDatabase,
} = require("../controllers/tradesController.js");

const {
  getSavedAllTickers,
  getSavedAllTickersByExchange,
} = require("../controllers/tickersController.js");

const { getSavedStrat } = require("../controllers/strategyController.js");
const { getSavedCmc } = require("../controllers/cmcController.js");

const exchangesToUpdate = ["binance", "kucoin", "htx", "okx", "gateio"];

const { smtp, cronSchedules } = config;

async function sendMail(options) {
  const transporter = nodemailer.createTransport(smtp);
  transporter.sendMail(options, (error, info) => {
    if (error) {
      errorLogger.error(`Error sending email: ${error.message}`, { error });
    } else {
      infoLogger.info(`Email sent: ${info.response}`);
    }
  });
}

async function executeCronTask(task, isCritical = false) {
  try {
    await task();
  } catch (error) {
    errorLogger.error(`Task execution failed: ${error.message}`, { error });
    if (isCritical) {
      sendMail({
        from: smtp.auth.user,
        to: process.env.EMAIL_ADDRESS_SEND,
        subject: "Critical Error Alert",
        text: `Critical error in scheduled task: ${error.message}`,
      });
    }
  }
}

async function cronShad() {
  console.log("Running the cron job for updateShad...");
  executeCronTask(async () => {
    await calculateAllMetrics();
    // il faudrait mettre a jour la base de donnee shad
  }, true);
}

async function cronTickers() {
  console.log("Running the cron job for updateTickers...");

  for (const exchangeId of exchangesToUpdate) {
    executeCronTask(async () => {
      await updateTickersForExchange(exchangeId);
      // il faudrait mettre a jour la base de donnee shad
    }, true);
  }
}

async function cronMarkets() {
  console.log("Running the cron job for updateMarkets...");

  for (const exchangeId of exchangesToUpdate) {
    executeCronTask(async () => {
      await updateMarketsForExchange(exchangeId);
    }, true);
  }
}

async function cronBalances() {
  console.log("Running the cron job for updating balances...");

  for (const exchangeId of exchangesToUpdate) {
    executeCronTask(async () => {
      const lastBalance = await getSavedBalance();
      const currentBalance = await fetchCurrentBalance(exchangeId);
      const differences = compareBalances(lastBalance, currentBalance);
      saveBalanceInDatabase(currentBalance, exchangeId);
      if (differences.length > 0) {
        await processBalanceChanges(differences, exchangeId);
        //je refais les calculs si il y a certains assets qui ont des differences de balance
        await calculateMetrics(differences, exchangeId);
      }
    }, true);
  }
}

async function cronTrades() {
  console.log("Running the cron job for fetching trades...");

  for (const exchangeId of exchangesToUpdate) {
    executeCronTask(async () => {
      const currentBalance = await fetchCurrentBalance(exchangeId);
      await fetchAndSaveTradesForAllAssets(currentBalance, exchangeId);
    }, true);
  }
}

async function initializeCronTasks() {
  console.log("Start initialize Cron");
  cron.schedule(cronSchedules.shad, cronShad);
  //cron.schedule(cronSchedules.tickers, cronTickers);
  //cron.schedule(cronSchedules.markets, cronMarkets);
  cron.schedule(cronSchedules.balances, cronBalances);
  cron.schedule(cronSchedules.trades, cronTrades);
}

async function fetchAndSaveTradesForAllAssets(balance, exchangeId) {
  try {
    const newTrades = [];

    // Récupérer les marchés disponibles pour l'échange
    const markets = await getSavedAllTickersByExchange(exchangeId);

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

async function processBalanceChanges(differences, exchangeId) {
  try {
    console.log("Starting processBalanceChanges...");
    infoLogger.info("Starting processBalanceChanges...");

    console.log("Updating open orders from server...");
    await updateOrdersFromServer(exchangeId);
    console.log("Open orders updated.");

    const newTrades = [];
    const markets = await getSavedAllTickersByExchange(exchangeId);

    for (const difference of differences) {
      console.log(
        `Processing balance difference for symbol: ${difference.symbol}`
      );

      // Construct the complete trading pair
      const symbol = difference.symbol + "/USDT";

      // Check if the trading pair exists in the saved markets
      const marketExists = markets.some((market) => market.symbol === symbol);

      if (marketExists) {
        console.log(`Fetching last trades for symbol: ${symbol}...`);
        try {
          const tradeList = await fetchLastTrades(exchangeId, symbol);

          const mappedTrades = mapTrades(exchangeId, tradeList);
          console.log(
            `Mapped ${mappedTrades.length} trades for symbol: ${symbol}`
          );

          newTrades.push(...mappedTrades);
        } catch (err) {
          console.error(`Error fetching trades for ${symbol}: ${err.message}`);
          // Optionally continue with the next symbol instead of throwing an error
          continue;
        }
      } else {
        console.log(
          `Market symbol ${symbol} not available on ${exchangeId}, skipping...`
        );
      }

      if (difference.newSymbol) {
        console.log(
          "New symbol detected. Prompting user to choose strategy..."
        );
      }
    }

    console.log(`Total new trades to be saved: ${newTrades.length}`);
    console.log("Saving new trades to database...");
    await saveTradesToDatabase(newTrades);
    console.log("New trades saved to database.");

    console.log("handleBalanceDifferences completed successfully.");
  } catch (error) {
    console.error(
      `Error handling balance differences for ${exchangeId}:`,
      error
    );
    throw error;
  }
}

async function getBalanceByPlatform(exchangeId) {
  const data = await getSavedBalance();
  return data.filter((obj) => obj.platform === exchangeId);
}

async function getTradesByPlatform(exchangeId) {
  const data = await getSavedTrades();
  return data.filter((obj) => obj.platform === exchangeId);
}

async function getOrdersByPlatform(exchangeId) {
  console.log("getOrdersByPlatform getOrdersByPlatform");
  const data = await getSavedOrders();
  console.log("getOrdersByPlatform getOrdersByPlatform 222");

  return data.filter((obj) => obj.platform === exchangeId);
}

async function getTickersByPlatform(exchangeId) {
  const data = await getSavedAllTickers();

  return data.filter((obj) => obj.platform === exchangeId);
}

//TODOOOOO
async function calculateAllMetrics() {
  console.log("calculateAllMetrics");
  // je pense quon a ici recuperer la derniere balance, les trades sont a jour
  // il faut maintenant recalculer certains element ou tous si le fichier ne possede pas les donnees,
  // on possede les differences donc il est simple de savoir pour quels assets sont necessaires les calculs

  // on a besoin des dernieres balances de toute facon puisque cest un element que je veux voir apparaitre dans mon tableau
  const lastCmc = await getSavedCmc();
  console.log("calculateAllMetrics after lastCmc");

  const lastStrategies = await getSavedStrat();
  console.log("calculateAllMetrics after lastStrategies");

  const lastTrades = await getSavedTrades();
  console.log("calculateAllMetrics after lastTrades");

  const lastOpenOrders = await getSavedOrders();
  console.log("calculateAllMetrics after lastOpenOrders");

  const lastTickers = await getSavedAllTickers();
  console.log("calculateAllMetrics after lastTickers");

  const lastBalance = await getSavedBalance();

  console.log("calculateAllMetrics after lastBalance");

  let filteredCmc,
    filteredTrades,
    filteredOpenOrders,
    filteredStrategy,
    filteredTickers;

  for (const balance of lastBalance) {
    const assetSymbol = balance.symbol;
    console.log("valvalval :", assetSymbol);

    const assetPlatform = balance.platform;

    filteredCmc = lastCmc.find((cmc) => cmc.symbol === assetSymbol);
    filteredTrades = lastTrades.filter((trade) => trade.altA === assetSymbol);
    filteredOpenOrders = lastOpenOrders.filter(
      (order) =>
        order.symbol === assetSymbol + "/USDT" ||
        order.symbol === assetSymbol + "/USDC" ||
        order.symbol === assetSymbol + "/BTC"
    );
    filteredStrategy = lastStrategies[assetSymbol][assetPlatform];
    filteredTickers = lastTickers.filter(
      (ticker) =>
        ticker.symbol.startsWith(assetSymbol + "/") &&
        ticker.platform === assetPlatform
    );
    const values = getAllCalculs(
      assetSymbol,
      assetPlatform,
      filteredCmc,
      balance,
      filteredTrades,
      filteredOpenOrders,
      filteredStrategy,
      filteredTickers
    );

    console.log("valvalval :" + assetSymbol, values);
  }
}

async function calculateMetrics(differences, exchangeId) {
  console.log("calculateMetrics");
  // je pense quon a ici recuperer la derniere balance, les trades sont a jour
  // il faut maintenant recalculer certains element ou tous si le fichier ne possede pas les donnees,
  // on possede les differences donc il est simple de savoir pour quels assets sont necessaires les calculs

  // on a besoin des dernieres balances de toute facon puisque cest un element que je veux voir apparaitre dans mon tableau
  const lastCmc = await getSavedCmc();
  const lastBalance = await getBalanceByPlatform(exchangeId);
  const lastTrades = await getTradesByPlatform(exchangeId);
  const lastStrategies = await getSavedStrat();
  const lastOpenOrders = await getOrdersByPlatform(exchangeId);
  const lastTickers = await getTickersByPlatform(exchangeId);

  console.log("calculateMetrics lastCmc", lastCmc.length);
  console.log("calculateMetrics lastBalance", lastBalance.length);
  console.log("calculateMetrics lastTrades", lastTrades.length);
  console.log("calculateMetrics lastStrategies", lastStrategies.length);
  console.log("calculateMetrics lastOpenOrders", lastOpenOrders.length);
  console.log("calculateMetrics lastTickers", lastTickers.length);

  // Boucler à travers les éléments uniques présents dans differences
  for (const asset of differences) {
    console.log("calculateMetrics loooop");
    // Récupérer les valeurs correspondantes à l'actif + échange dancs lastBalance, lastTrades, lastOpenOrders, lastStrategies et lastTickers
    const values = getAllCalculs(
      asset,
      exchangeId,
      lastCmc,
      lastBalance,
      lastTrades,
      lastOpenOrders,
      lastStrategies,
      lastTickers
    );

    console.log("valvalval", values);

    //on remplace ici a chaque foois ou plus tard en une seule fois les differentes lignes du shad
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
    await cronUtilsMarkets(exchangeId);
    console.log(`updateMarkets completed for ${exchangeId}`);
  } catch (error) {
    console.error(`Error updating markets for ${exchangeId}:`, error);
    throw error;
  }
}

async function updateTickersForExchange(exchangeId) {
  try {
    await cronUtilsTickers(exchangeId);
    console.log(`updateTickers completed for ${exchangeId}`);
  } catch (error) {
    console.error(`Error updating tickers for ${exchangeId}:`, error);
    throw error;
  }
}

module.exports = { initializeCronTasks };
