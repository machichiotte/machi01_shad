// src/utils/platformUtil.js
const ccxt = require("ccxt");
const { AuthenticationError } = require("ccxt");
//const PLATFORMS = ["binance", "kucoin", "htx", "okx", "gateio"];
const PLATFORMS = ["binance", "kucoin"];

// Fonction utilitaire pour créer une instance d'échange
function createPlatformInstance(platform) {
  const apiKey = process.env[`${platform.toUpperCase()}_API_KEY`];
  const secret = process.env[`${platform.toUpperCase()}_SECRET_KEY`];
  const passphrase = process.env[`${platform.toUpperCase()}_PASSPHRASE`] || "";

  if (!apiKey) {
    throw new Error(`API key missing for platform: ${platform}`);
  }

  if (!secret) {
    throw new Error(`API secret missing for platform: ${platform}`);
  }

  // Ajoutez ceci pour vérifier si la platforme est pris en charge
  if (!PLATFORMS.includes(platform)) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  try {
    // Vérifier si la classe CCXT existe
    if (!(platform in ccxt)) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const platformParams = {
      apiKey,
      secret,
      ...(passphrase && { password: passphrase }),
      timeout: 20000, // Timeout pour les requêtes
      enableRateLimit: true, // Activer le contrôle de taux
    };

    return new ccxt[platform](platformParams);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // Gérer spécifiquement les erreurs d'authentification
      throw new AuthenticationError(
        `Authentication error for ${platform}: ${error.message}`
      );
    } else {
      // Gérer les autres erreurs
      throw new Error(
        `Error creating platform instance for ${platform}: ${error.message}`
      );
    }
  }
}

function getSymbolForPlatform(platform, base, quote = "USDT") {
  let symbol;

  switch (platform) {
    case "kucoin":
      symbol = `${base}-${quote.toUpperCase()}`;
      break;
    case "binance":
      symbol = `${base}${quote.toUpperCase()}`;
      break;
    case "htx":
      symbol = `${base.toLowerCase()}${quote.toLowerCase()}`;
      break;
    case "gateio":
      symbol = `${base.toUpperCase()}_${quote.toUpperCase()}`;
      break;
    case "okx":
      symbol = `${base}-${quote.toUpperCase()}`;
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  return symbol;
}

function getPlatforms() {
  return PLATFORMS;
}

module.exports = {
  createPlatformInstance,
  getSymbolForPlatform,
  getPlatforms,
};
