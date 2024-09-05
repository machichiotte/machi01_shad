const { handleErrorResponse } = require("../utils/errorUtil.js");
const { errorLogger } = require("../utils/loggerUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil");
const marketService = require("../services/marketService");

validateEnvVariables(["MONGODB_COLLECTION_LOAD_MARKETS", "TYPE_LOAD_MARKETS"]);

async function getMarkets(req, res) {
  try {
    const data = await marketService.getSavedMarkets();
    res.json(data);
  } catch (error) {
    errorLogger.error("Failed to retrieve market data.", {
      error: error.message,
    });
    handleErrorResponse(res, error, "getMarkets");
  }
}

async function updateMarkets(req, res) {
  const { platform } = req.params;
  try {
    const marketData = await marketService.fetchMarketData(platform);
    const updatedData = await marketService.updateMarketDataInDatabase(marketData, platform);
    res.status(200).json(updatedData);
  } catch (error) {
    console.log(
      `🚀 ~ file: marketsController.js:175 ~ updateMarkets ~ error:`,
      error
    );
    handleErrorResponse(res, error, "updateMarkets");
  }
}

module.exports = {
  getMarkets,
  updateMarkets,
};