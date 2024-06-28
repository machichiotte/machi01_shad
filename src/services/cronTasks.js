// src/services/cronTasks.js
const cron = require("node-cron");
const nodemailer = require("nodemailer");

const config = require("./config");

const { getAllCalculs } = require("../services/metrics/global.js");

const { errorLogger, infoLogger } = require("../utils/loggerUtil.js");

const { cronUtilsMarkets, cronUtilsTickers } = require("../utils/cronUtil.js");
const { mapTrades } = require("./mapping.js");
const {
  fetchBalancesInDatabase,
  fetchCurrentBalance,
  saveBalanceInDatabase,
} = require("../controllers/balanceController.js");
const {
  fetchOrdersInDatabase,
  updateOrdersFromServer,
} = require("../controllers/ordersController.js");
const {
  fetchTradesInDatabase,
  fetchLastTrades,
  saveTradesToDatabase,
  saveAllTradesToDatabase,
} = require("../controllers/tradesController.js");

const {
  fetchTickersInDatabase,
  getSavedAllTickersByExchange,
} = require("../controllers/tickersController.js");

const { fetchStratsInDatabase } = require("../controllers/strategyController.js");
const { fetchCmcInDatabase } = require("../controllers/cmcController.js");

//const exchangesToUpdate = ["binance", "kucoin", "htx", "okx", "gateio"];
const exchangesToUpdate = ["binance", "kucoin"];
const quoteCurrencies = ["USDT"];
// const quoteCurrencies = ["USDT", "BTC", "ETH", "USDC"];

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

async function executeCronTask(task, isCritical = false, retries = 3) {
  let attempts = 0;
  while (attempts < retries) {
    try {
      await task();
      return; // Exit if successful
    } catch (error) {
      errorLogger.error(`Task execution failed: ${error.message}`, { error });
      if (isCritical) {
        if (attempts < retries - 1) {
          await new Promise(res => setTimeout(res, 5000 * (attempts + 1))); // Exponential backoff
        } else {
          sendMail({
            from: smtp.auth.user,
            to: process.env.EMAIL_ADDRESS_SEND,
            subject: "Critical Error Alert",
            text: `Critical error in scheduled task: ${error.message}`,
          });
        }
      }
      attempts++;
    }
  }
}


async function executeForExchanges(taskName, taskFunction) {
  console.log(`Running the cron job for ${taskName}...`);
  for (const exchangeId of exchangesToUpdate) {
    await executeCronTask(async () => {
      await taskFunction(exchangeId);
    }, true);
  }
}

async function cronTickers() {
  await executeForExchanges("updateTickers", updateTickersForExchange);
}

async function cronMarkets() {
  await executeForExchanges("updateMarkets", updateMarketsForExchange);
}

async function cronBalances() {
  await executeForExchanges("updateBalances", async (exchangeId) => {
    const lastBalance = await fetchBalancesInDatabase();
    const currentBalance = await fetchCurrentBalance(exchangeId, 3);
    const differences = compareBalances(lastBalance, currentBalance);
    if (differences.length > 0) {
      await saveBalanceInDatabase(currentBalance, exchangeId);
      await processBalanceChanges(differences, exchangeId);
      await calculateMetrics(differences, exchangeId);
    }
    await calculateAllMetrics();
  });
}

async function initializeCronTasks() {
  try {
    console.log("Starting to initialize Cron tasks...");
    cron.schedule(cronSchedules.tickers, cronTickers);
    cron.schedule(cronSchedules.markets, cronMarkets);
    cron.schedule(cronSchedules.balances, cronBalances);
    console.log("Cron tasks initialized.");
  } catch (error) {
    errorLogger.error(`Error initializing cron tasks: ${error.message}`, { error });
    throw error;
  }
}

async function processBalanceChanges(differences, exchangeId) {
  // console.log("🚀 ~ processBalanceChanges ~ exchangeId:", exchangeId);
  // console.log("🚀 ~ processBalanceChanges ~ differences:", differences);
  try {
    const update = await updateOrdersFromServer(exchangeId);
    // console.log("🚀 ~ processBalanceChanges ~ update:", update);

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
        // console.log("🚀 ~ processBalanceChanges ~ symbol:", symbol);
        try {
          const tradeList = await fetchLastTrades(exchangeId, symbol);

          const mappedTrades = mapTrades(exchangeId, tradeList);

          // console.log(
          // "🚀 ~ processBalanceChanges ~ mappedTrades.length:",
          // mappedTrades.length
          // );

          newTrades.push(...mappedTrades);
        } catch (err) {
          console.error(`Error fetching trades for ${symbol}: ${err.message}`);
          // Optionally continue with the next symbol instead of throwing an error
          continue;
        }
      } else {
        // console.log(
        // "🚀 ~ processBalanceChanges ~ symbol not available:",
        // symbol
        // );
      }

      if (difference.newSymbol) {
        // console.log(
        // "🚀 ~ processBalanceChanges ~ difference.newSymbol:",
        // difference.newSymbol
        // );
      }
    }

    // console.log(
    // "🚀 ~ processBalanceChanges ~ newTrades.length:",
    // newTrades.length
    // );
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
  const data = await fetchBalancesInDatabase();
  return data.filter((obj) => obj.platform === exchangeId);
}

async function getTradesByPlatform(exchangeId) {
  const data = await fetchTradesInDatabase();
  return data.filter((obj) => obj.platform === exchangeId);
}

async function getOrdersByPlatform(exchangeId) {
  // console.log("🚀 ~ getOrdersByPlatform ~ exchangeId:", exchangeId);
  const data = await fetchOrdersInDatabase();
  // console.log("🚀 ~ getOrdersByPlatform ~ data:", data);
  return data.filter((obj) => obj.platform === exchangeId);
}

async function getTickersByPlatform(exchangeId) {
  // console.log("🚀 ~ getTickersByPlatform ~ exchangeId:", exchangeId);
  const data = await fetchTickersInDatabase();
  // console.log("🚀 ~ getTickersByPlatform ~ data:", data);
  return data.filter((obj) => obj.platform === exchangeId);
}

//TODOOOOO
async function calculateAllMetrics() {
  // console.log("🚀 ~ calculateAllMetrics ~ calculateAllMetrics:");
  // je pense quon a ici recuperer la derniere balance, les trades sont a jour
  // il faut maintenant recalculer certains element ou tous si le fichier ne possede pas les donnees,
  // on possede les differences donc il est simple de savoir pour quels assets sont necessaires les calculs

  // Utilisez Promise.all pour paralléliser les appels de récupération de données
  const [
    lastCmc,
    lastStrategies,
    lastTrades,
    lastOpenOrders,
    lastTickers,
    lastBalance
  ] = await Promise.all([
    fetchCmcInDatabase(),
    fetchStratsInDatabase(),
    fetchTradesInDatabase(),
    fetchOrdersInDatabase(),
    fetchTickersInDatabase(),
    fetchBalancesInDatabase()
  ]);

  // Vérifiez que chaque collection récupérée est valide avant de continuer
  if (!lastCmc || !lastStrategies || !lastTrades || !lastOpenOrders || !lastTickers || !lastBalance) {
    console.error("Error: One or more data retrieval functions returned invalid data.");
    return;
  }

  for (const balance of lastBalance) {
    const assetSymbol = balance.symbol;
    // console.log("🚀 ~ calculateAllMetrics ~ assetSymbol:", assetSymbol);

    const assetPlatform = balance.platform;

    const filteredCmc = lastCmc.find((cmc) => cmc.symbol === assetSymbol);
    const filteredTrades = lastTrades.filter((trade) => trade.altA === assetSymbol);
    const filteredOpenOrders = lastOpenOrders.filter(
      (order) =>
        order.symbol === assetSymbol + "/USDT" ||
        order.symbol === assetSymbol + "/USDC" ||
        order.symbol === assetSymbol + "/BTC"
    );

    // Vérifiez que les stratégies existent pour ce symbole et cette plateforme
    const filteredStrategy = lastStrategies[assetSymbol]?.[assetPlatform];

    // Filtrage des tickers
    const filteredTickers = lastTickers.filter(
      ticker =>
        ticker.symbol.startsWith(`${assetSymbol}/`) &&
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

     console.log("🚀 ~ calculateAllMetrics ~ values:", values.length);
  }
}

async function calculateMetrics(differences, exchangeId) {
  const [
    lastCmc,
    lastBalance,
    lastTrades,
    lastStrategies,
    lastOpenOrders,
    lastTickers
  ] = await Promise.all([
    fetchCmcInDatabase(),
    getBalanceByPlatform(exchangeId),
    getTradesByPlatform(exchangeId),
    fetchStratsInDatabase(),
    getOrdersByPlatform(exchangeId),
    getTickersByPlatform(exchangeId)
  ]);

  // Boucler à travers les éléments uniques présents dans differences
  for (const asset of differences) {
    // console.log("🚀 ~ calculateMetrics ~ asset:", asset);
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

    // console.log("🚀 ~ calculateMetrics ~ values:", values);
    //on remplace ici a chaque fois ou plus tard en une seule fois les differentes lignes du shad
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
  const lastBalancesBySymbol = new Map(lastBalance.map(b => [b.symbol, b]));

  for (const current of currentBalance) {
    const last = lastBalancesBySymbol.get(current.symbol);
    if (last && last.balance !== current.balance && last.platform === current.platform) {
      differences.push({ symbol: current.symbol, balanceDifference: true });
    } else if (!last) {
      differences.push({ symbol: current.symbol, newSymbol: true });
    }
  }
  return differences;
}

async function updateMarketsForExchange(exchangeId) {
  try {
    await cronUtilsMarkets(exchangeId);
    // console.log("🚀 ~ updateMarketsForExchange ~ exchangeId:", exchangeId);
  } catch (error) {
    // console.log("🚀 ~ updateMarketsForExchange ~ error:", error);
    console.error(`Error updating markets for ${exchangeId}:`, error);
    throw error;
  }
}

async function updateTickersForExchange(exchangeId) {
  try {
    await cronUtilsTickers(exchangeId);
    // console.log("🚀 ~ updateTickersForExchange ~ exchangeId:", exchangeId);
  } catch (error) {
    console.error(`Error updating tickers for ${exchangeId}:`, error);
    throw error;
  }
}

module.exports = { initializeCronTasks };
