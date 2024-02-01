    // src/routes/ordersRoutes.js
    const express = require('express');
    const { getOrders, updateOrders, deleteOrder, createBunchOrders, cancelAllOrders} = require('../controllers/ordersController.js');

    const router = express.Router();

    router.get('/get', getOrders);
    router.get('/update/:exchangeId', updateOrders);
    router.post('/cancel', deleteOrder);
    router.post('/bunch-orders', createBunchOrders);
    router.post('/cancel/all', cancelAllOrders);

    module.exports = router;