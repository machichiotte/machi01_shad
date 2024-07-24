// src/utils/exchangeUtil.js
const ccxt = require("ccxt");
const { AuthenticationError } = require("ccxt");
//const EXCHANGES = ["binance", "kucoin", "htx", "okx", "gateio"];
const EXCHANGES = ['binance', "kucoin"];

// Fonction utilitaire pour créer une instance d'échange
function createExchangeInstance(exchangeId) {
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase =
    process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || "";

  if (!apiKey) {
    throw new Error(`API key missing for exchange: ${exchangeId}`);
  }

  if (!secret) {
    throw new Error(`API secret missing for exchange: ${exchangeId}`);
  }

  // Ajoutez ceci pour vérifier si l'échange est pris en charge
  if (!EXCHANGES.includes(exchangeId)) {
    throw new Error(`Unsupported exchange: ${exchangeId}`);
  }

  try {
    // Vérifier si la classe CCXT existe
    if (!(exchangeId in ccxt)) {
      throw new Error(`Unsupported exchange: ${exchangeId}`);
    }

    const exchangeParams = {
      apiKey,
      secret,
      ...(passphrase && { password: passphrase }),
      timeout: 20000, // Timeout pour les requêtes
      enableRateLimit: true, // Activer le contrôle de taux
    };

    const exchange = new ccxt[exchangeId](exchangeParams);

    return exchange;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // Gérer spécifiquement les erreurs d'authentification
      throw new AuthenticationError(
        `Authentication error for ${exchangeId}: ${error.message}`
      );
    } else {
      // Gérer les autres erreurs
      throw new Error(
        `Error creating exchange instance for ${exchangeId}: ${error.message}`
      );
    }
  }
}

// Fonction utilitaire pour créer une instance d'échange avec la demande
function createExchangeInstanceWithReq(exchangeId, req) {
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase =
    process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || "";
  const asset = req.body.asset;
  const symbol = getSymbolForExchange(exchangeId, asset);

  const exchangeParams = {
    apiKey,
    secret,
    ...(passphrase && { password: passphrase }), // Ajout de passphrase aux paramètres s'il existe
  };

  return {
    symbol,
    exchangeParams,
  };
}

function getSymbolForExchange(exchangeId, asset) {
  let symbol;

  switch (exchangeId) {
    case "kucoin":
      symbol = `${asset}-USDT`;
      break;
    case "binance":
      symbol = `${asset}USDT`;
      break;
    case "htx":
      symbol = `${asset.toLowerCase()}usdt`;
      break;
    case "gateio":
      symbol = `${asset.toUpperCase()}_USDT`;
      break;
    case "okx":
      symbol = `${asset}-USDT`;
      break;
    default:
      throw new Error(`Unsupported exchange: ${exchangeId}`);
  }

  return symbol;
}

function getExchanges() {
  return EXCHANGES;
};

module.exports = {
  createExchangeInstance,
  createExchangeInstanceWithReq,
  getSymbolForExchange,
  getExchanges
};
