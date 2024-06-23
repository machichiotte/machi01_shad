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
      const currentBalance = await fetchCurrentBalance(exchangeId, 3);
      const differences = compareBalances(lastBalance, currentBalance);
      if (differences.length > 0) {
        await saveBalanceInDatabase(currentBalance, exchangeId);

        await processBalanceChanges(differences, exchangeId);
        //je refais les calculs si il y a certains assets qui ont des differences de balance
        await calculateMetrics(differences, exchangeId);
      }

      calculateAllMetrics()
    }, true);
  }
}

async function initializeCronTasks() {
  console.log("Start initialize Cron");
  cron.schedule(cronSchedules.tickers, cronTickers);
  cron.schedule(cronSchedules.markets, cronMarkets);
  cron.schedule(cronSchedules.balances, cronBalances);
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
  const data = await getSavedBalance();
  return data.filter((obj) => obj.platform === exchangeId);
}

async function getTradesByPlatform(exchangeId) {
  const data = await getSavedTrades();
  return data.filter((obj) => obj.platform === exchangeId);
}

async function getOrdersByPlatform(exchangeId) {
  // console.log("🚀 ~ getOrdersByPlatform ~ exchangeId:", exchangeId);
  const data = await getSavedOrders();
  // console.log("🚀 ~ getOrdersByPlatform ~ data:", data);
  return data.filter((obj) => obj.platform === exchangeId);
}

async function getTickersByPlatform(exchangeId) {
  // console.log("🚀 ~ getTickersByPlatform ~ exchangeId:", exchangeId);
  const data = await getSavedAllTickers();
  // console.log("🚀 ~ getTickersByPlatform ~ data:", data);
  return data.filter((obj) => obj.platform === exchangeId);
}

//TODOOOOO
async function calculateAllMetrics() {
  // console.log("🚀 ~ calculateAllMetrics ~ calculateAllMetrics:");
  // je pense quon a ici recuperer la derniere balance, les trades sont a jour
  // il faut maintenant recalculer certains element ou tous si le fichier ne possede pas les donnees,
  // on possede les differences donc il est simple de savoir pour quels assets sont necessaires les calculs

  // on a besoin des dernieres balances de toute facon puisque cest un element que je veux voir apparaitre dans mon tableau
  const lastCmc = await getSavedCmc();
  // console.log("🚀 ~ calculateAllMetrics ~ lastCmc:", lastCmc);

  const lastStrategies = await getSavedStrat();
  // console.log("🚀 ~ calculateAllMetrics ~ lastStrategies:", lastStrategies);

  const lastTrades = await getSavedTrades();
  // console.log("🚀 ~ calculateAllMetrics ~ lastTrades:", lastTrades);

  const lastOpenOrders = await getSavedOrders();
  // console.log("🚀 ~ calculateAllMetrics ~ lastOpenOrders:", lastOpenOrders);

  const lastTickers = await getSavedAllTickers();
  // console.log("🚀 ~ calculateAllMetrics ~ lastTickers:", lastTickers);

  const lastBalance = await getSavedBalance();
  // console.log("🚀 ~ calculateAllMetrics ~ lastBalance:", lastBalance);

  let filteredCmc,
    filteredTrades,
    filteredOpenOrders,
    filteredStrategy,
    filteredTickers;

  for (const balance of lastBalance) {
    const assetSymbol = balance.symbol;
    // console.log("🚀 ~ calculateAllMetrics ~ assetSymbol:", assetSymbol);

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

    // console.log("🚀 ~ calculateAllMetrics ~ values:", values);
  }
}

async function calculateMetrics(differences, exchangeId) {
  // console.log("🚀 ~ calculateMetrics ~ exchangeId:", exchangeId);
  // console.log("🚀 ~ calculateMetrics ~ differences:", differences);
  // je pense quon a ici recuperer la derniere balance, les trades sont a jour
  // il faut maintenant recalculer certains element ou tous si le fichier ne possede pas les donnees,
  // on possede les differences donc il est simple de savoir pour quels assets sont necessaires les calculs

  // on a besoin des dernieres balances de toute facon puisque cest un element que je veux voir apparaitre dans mon tableau
  const lastCmc = await getSavedCmc();
  // console.log("🚀 ~ calculateMetrics ~ lastCmc:", lastCmc);
  const lastBalance = await getBalanceByPlatform(exchangeId);
  // console.log("🚀 ~ calculateMetrics ~ lastBalance:", lastBalance);
  const lastTrades = await getTradesByPlatform(exchangeId);
  // console.log("🚀 ~ calculateMetrics ~ lastTrades:", lastTrades);
  const lastStrategies = await getSavedStrat();
  // console.log("🚀 ~ calculateMetrics ~ lastStrategies:", lastStrategies);
  const lastOpenOrders = await getOrdersByPlatform(exchangeId);
  // console.log("🚀 ~ calculateMetrics ~ lastOpenOrders:", lastOpenOrders);
  const lastTickers = await getTickersByPlatform(exchangeId);
  // console.log("🚀 ~ calculateMetrics ~ lastTickers:", lastTickers);

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
