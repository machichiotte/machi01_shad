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
  converter: require("../routes/converterRoutes").default,
  auth: require("../routes/authRoutes").default,
  balance: require("../routes/balanceRoutes").default,
  cmc: require("../routes/cmcRoutes").default,
  strategy: require("../routes/strategyRoutes").default,
  orders: require("../routes/ordersRoutes").default,
  market: require("../routes/marketsRoutes").default,
  prices: require("../routes/pricesRoutes").default,
  trades: require("../routes/tradesRoutes").default,
  tickers: require("../routes/tickersRoutes").default,
  lastUpdate: require("../routes/lastUpdateRoutes").default,
  shad: require("../routes/shadRoutes").default,
};

// Utilisation des routes avec une boucle
Object.entries(routes).forEach(([name, router]) => {
  if (router && typeof router === 'function') {
    app.use(`/api/${name}`, router);
  } else {
    console.error(`La route ${name} n'est pas une fonction middleware valide.`);
  }
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
