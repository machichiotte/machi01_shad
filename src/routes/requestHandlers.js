// src/routes/requestHandlers.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(express.static('dist'));
app.use(cors());

// Use body-parser as a global middleware for all requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//converter
const converterRoutes  = require('../routes/converterRoutes.js');
app.use('/api/converter', converterRoutes);

//balance
const balanceRoutes  = require('../routes/balanceRoutes.js');
app.use('/api/balance', balanceRoutes);

//cmc
const cmcRoutes  = require('../routes/cmcRoutes.js');
app.use('/api/cmcData', cmcRoutes);

//strat
const strategyRoutes  = require('../routes/strategyRoutes.js');
app.use('/api/strategy', strategyRoutes);

//orders
const ordersRoutes  = require('../routes/ordersRoutes.js');
app.use('/api/orders', ordersRoutes);

//load markets
const loadMarkesRoutes  = require('../routes/loadMarketsRoutes.js');
app.use('/api/loadMarkets', loadMarkesRoutes);

//prices
const pricesRoutes  = require('../routes/pricesRoutes.js');
app.use('/api/prices', pricesRoutes);

//trades
const tradesRoutes  = require('../routes/tradesRoutes.js');
app.use('/api/trades', tradesRoutes);

//tickers
const tickersRoutes  = require('../routes/tickersRoutes.js');
app.use('/api/tickers', tickersRoutes);

//last update
const lastUpdateRoutes  = require('../routes/lastUpdateRoutes.js');
app.use('/api/lastUpdate', lastUpdateRoutes);

function startServer() {
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  }

module.exports = { app, startServer };