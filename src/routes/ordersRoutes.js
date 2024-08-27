// src/routes/ordersRoutes.js
const express = require("express");
const {
  getOrders,
  updateOrders,
  deleteOrder,
  createMarketBuyOrder,
  createMarketSellOrder,
  createBunchLimitBuyOrders,
  createBunchLimitSellOrders,
  cancelAllOrders,
  cancelAllSellOrders,
} = require("../controllers/ordersController.js");

const router = express.Router();

router.get("/get", getOrders);
router.get("/update/:platform", updateOrders);
router.post("/cancel", deleteOrder);
router.post("/market-buy-order", createMarketBuyOrder);
router.post("/market-sell-order", createMarketSellOrder);
router.post("/bunch-limit-sell-orders", createBunchLimitSellOrders);
router.post("/bunch-limit-buy-orders", createBunchLimitBuyOrders);
router.post("/cancel/all", cancelAllOrders);
router.post("/cancel/all/sell", cancelAllSellOrders);

module.exports = router;
