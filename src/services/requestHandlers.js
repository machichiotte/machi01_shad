// src/services/requestHandlers.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const PORT = process.env.PORT || 10000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://machi-shad.onrender.com",
];

const app = express();

// Middleware CORS
app.use(cors());

// Middleware pour les requêtes `OPTIONS` pour les pré-requêtes CORS
app.options("*", cors());

// Configuration des middlewares
app.use(express.static("dist"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routes = {
  converter: require("../routes/converterRoutes.js"),
  auth: require("../routes/authRoutes.js"),
  balance: require("../routes/balanceRoutes.js"),
  cmc: require("../routes/cmcRoutes.js"),
  strategy: require("../routes/strategyRoutes.js"),
  orders: require("../routes/ordersRoutes.js"),
  market: require("../routes/marketsRoutes.js"),
  prices: require("../routes/pricesRoutes.js"),
  trades: require("../routes/tradesRoutes.js"),
  tickers: require("../routes/tickersRoutes.js"),
  lastUpdate: require("../routes/lastUpdateRoutes.js"),
  shad: require("../routes/shadRoutes.js"),
};

// Utilisation des routes avec une boucle
Object.entries(routes).forEach(([name, router]) => {
  app.use(`/api/${name}`, router);
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Middleware de gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Fonction pour démarrer le serveur
function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port: ${PORT}`);
      resolve(server);
    });
    server.on("error", reject);
  });
}

module.exports = { app, startServer };
