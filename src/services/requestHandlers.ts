// src/services/requestHandlers.ts
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";

const PORT = process.env.PORT || 10000;

const app = express();

// Middleware CORS
app.use(cors());

// Middleware pour les requêtes `OPTIONS` pour les pré-requêtes CORS
app.options("*", cors());

// Configuration des middlewares
app.use(express.static("dist"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

interface Routes {
  [key: string]: express.Router;
}

const routes: Routes = {
  converter: require("../routes/converterRoutes"),
  auth: require("../routes/authRoutes"),
  balance: require("../routes/balanceRoutes"),
  cmc: require("../routes/cmcRoutes"),
  strategy: require("../routes/strategyRoutes"),
  orders: require("../routes/ordersRoutes"),
  market: require("../routes/marketsRoutes"),
  prices: require("../routes/pricesRoutes"),
  trades: require("../routes/tradesRoutes"),
  tickers: require("../routes/tickersRoutes"),
  lastUpdate: require("../routes/lastUpdateRoutes"),
  shad: require("../routes/shadRoutes"),
};

// Utilisation des routes avec une boucle
Object.entries(routes).forEach(([name, router]) => {
  app.use(`/api/${name}`, router);
});

// Middleware de gestion des erreurs
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Middleware de gestion des erreurs 404
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: "Not Found" });
});

// Fonction pour démarrer le serveur
function startServer(): Promise<any> {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port: ${PORT}`);
      resolve(server);
    });
    server.on("error", reject);
  });
}

export { app, startServer };
