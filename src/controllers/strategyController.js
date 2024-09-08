// src/controllers/strategyController.js
const { handleErrorResponse } = require("../utils/errorUtil.js");

const lastUpdateService = require("../services/lastUpdateService.js");
const strategyService = require("../services/strategyService.js");

/**
 * Retrieves strategies from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function getStrat(req, res) {
  try {
    const data = await strategyService.fetchDatabaseStrategies();
    res.json(data);
  } catch (error) {
    console.log(
      `🚀 ~ file: strategyController.js:23 ~ getStrat ~ error:`,
      error
    );
    //console.error("Failed to get strats", { error: error.message });
    handleErrorResponse(res, error, "getStrat");
  }
}

/**
 * Updates strategies in the database.
 * @param {Object} req - The request object containing the strategy data in the body.
 * @param {Object} res - The response object.
 */
async function updateStrat(req, res) {
  const strat = req.body;
  try {
    const data = await strategyService.updateStrategies(strat);
    await lastUpdateService.saveLastUpdateToDatabase(process.env.TYPE_STRATEGY, "");
    res.json(data);
  } catch (err) {
    console.log("🚀 ~ updateStrat ~ err:", err);
    res.status(500).send({ error: err.name + ": " + err.message });
  }
}

/**
 * Updates a specific strategy by its ID.
 * @param {Object} req - The request object containing the strategyId in params and updated strategy data in body.
 * @param {Object} res - The response object.
 */
async function updateStrategyById(req, res) {
  const { strategyId } = req.params;
  const updatedStrategy = req.body;
  try {
    const result = await strategyService.updateStrategyById(strategyId, updatedStrategy);
    res.json(result);
  } catch (error) {
    handleErrorResponse(res, error, "updateStrategyById");
  }
}

module.exports = { getStrat, updateStrat, updateStrategyById };
