// src/services/requestHandlers.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet"); // For added security

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.static("dist"));

// Define the CORS options
const corsOptions = {
  credentials: true,
  origin: ['http://localhost:5173', 'https://machi-shad.onrender.com/'] // Whitelist the domains you want to allow
};

app.use(cors(corsOptions));

//app.use(helmet()); // Adds security headers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Import Routes
const converterRoutes = require("../routes/converterRoutes.js");
const authRoutes = require("../routes/authRoutes.js");
const balanceRoutes = require("../routes/balanceRoutes.js");
const cmcRoutes = require("../routes/cmcRoutes.js");
const strategyRoutes = require("../routes/strategyRoutes.js");
const ordersRoutes = require("../routes/ordersRoutes.js");
const marketRoutes = require("../routes/marketsRoutes.js");
const pricesRoutes = require("../routes/pricesRoutes.js");
const tradesRoutes = require("../routes/tradesRoutes.js");
const tickersRoutes = require("../routes/tickersRoutes.js");
const lastUpdateRoutes = require("../routes/lastUpdateRoutes.js");

// Use Routes
app.use("/api/converter", converterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/cmc", cmcRoutes);
app.use("/api/strategy", strategyRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/prices", pricesRoutes);
app.use("/api/trades", tradesRoutes);
app.use("/api/tickers", tickersRoutes);
app.use("/api/lastUpdate", lastUpdateRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 404 Handling Middleware
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

function startServer() {
  app.listen(PORT, () => {
    console.log("🚀 ~ app.listen ~ PORT:", PORT);
  });
}

module.exports = { app, startServer };
