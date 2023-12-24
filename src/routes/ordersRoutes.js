// ordersRoutes.js
const express = require('express');
const { getOrders, updateOrders, deleteOrder, createBunchOrders, cancelAllOrders} = require('../controllers/ordersController.js');

const router = express.Router();

router.get('/get/orders', getOrders);
router.get('/update/orders/:exchangeId', updateOrders);
router.post('/cancel/order', deleteOrder);
router.post('/bunch-orders', createBunchOrders);
router.post('/cancel/all-orders', cancelAllOrders);

module.exports = router;