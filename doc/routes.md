// doc/routes.md

# Documentation des Routes

## Alarmes

- **Routeur** : [`routeAlarm.ts`](../src/routes/routeAlarm.ts)
- **Endpoints** :
  - `POST /api/alarm/set` : Définir une alarme.

## Authentification

- **Routeur** : [`routeAuth.ts`](../src/routes/routeAuth.ts)
- **Endpoints** :
  - `POST /api/auth/login` : Connexion utilisateur.
  - `POST /api/auth/register` : Inscription utilisateur.

## Solde et Portefeuille

- **Routeur** : [`routeBalance.ts`](../src/routes/routeBalance.ts)
- **Endpoints** :
  - `GET /api/balance/get` : Obtenir le solde du compte.
  - `GET /api/balance/update/:platform` : Mettre à jour le solde pour une plateforme spécifique.

## Données de marché et CMC

- **Routeurs** : [`routeCmc.ts`](../src/routes/routeCmc.ts), [`routeMarket.ts`](../src/routes/routeMarket.ts), [`routeTicker.ts`](../src/routes/routeTicker.ts)
- **Endpoints** :
  - `GET /api/cmc/get` : Obtenir les données CMC.
  - `GET /api/cmc/update` : Mettre à jour les données CMC.
  - `GET /api/market/get` : Obtenir les données de marché.
  - `GET /api/tickers/get` : Obtenir tous les tickers.
  - `GET /api/tickers/update` : Mettre à jour tous les tickers.

## Gestion des configurations API

- **Routeur** : [`routeConfigApi.ts`](../src/routes/routeConfigApi.ts)
- **Endpoints** :
  - `GET /api/config/get` : Récupérer la configuration actuelle de l'API.
  - `POST /api/config/update` : Mettre à jour la configuration de l'API.
  - `POST /api/config/update/key` : Mettre à jour une clé API.

## Conversion de fichiers

- **Routeur** : [`routeConverter.ts`](../src/routes/routeConverter.ts)
- **Endpoints** :
  - `POST /api/converter/post` : Convertir un fichier CSV.

## Stratégies Machi

- **Routeur** : [`routeMachi.ts`](../src/routes/routeMachi.ts)
- **Endpoints** :
  - `GET /api/machi/get` : Récupérer les stratégies Machi.
  - `POST /api/machi/trailing` : Gérer un trailing stop hedge.

## Ordres de trading

- **Routeur** : [`routeOrder.ts`](../src/routes/routeOrder.ts)
- **Endpoints** :
  - `GET /api/orders/get` : Obtenir les ordres actifs.
  - `GET /api/orders/update/:platform` : Mettre à jour les ordres pour une plateforme spécifique.
  - `POST /api/orders/cancel` : Annuler un ordre spécifique.
  - `POST /api/orders/cancel/all` : Annuler tous les ordres.
  - `POST /api/orders/cancel/all/sell` : Annuler tous les ordres de vente.
  - `POST /api/orders/cancel/all/buy` : Annuler tous les ordres d'achat.
  - `POST /api/orders/market-buy-order` : Créer un ordre d'achat au marché.
  - `POST /api/orders/market-sell-order` : Créer un ordre de vente au marché.
  - `POST /api/orders/limit-buy-order` : Créer un ordre d'achat limite.
  - `POST /api/orders/limit-sell-order` : Créer un ordre de vente limite.

## Flux RSS

- **Routeur** : [`routeRss.ts`](../src/routes/routeRss.ts)
- **Endpoints** :
  - `GET /api/rss/get` : Récupérer les flux RSS.
  - `POST /api/rss/add` : Ajouter un nouveau flux RSS.
  - `DELETE /api/rss/delete/:id` : Supprimer un flux RSS.

## Stratégies de trading

- **Routeur** : [`routeStrategy.ts`](../src/routes/routeStrategy.ts)
- **Endpoints** :
  - `GET /api/strategy/get` : Récupérer toutes les stratégies de trading.
  - `POST /api/strategy/update` : Mettre à jour une stratégie existante.
  - `POST /api/strategy/updateById` : Mettre à jour une stratégie spécifique par son ID.
  - `POST /api/strategy/updateByIds` : Mettre à jour plusieurs stratégies par leurs IDs.
  - `DELETE /api/strategy/delete/:id` : Supprimer une stratégie spécifique par son ID.

## Gestion des timestamps

- **Routeur** : [`routeTimestamp.ts`](../src/routes/routeTimestamp.ts)
- **Endpoints** :
  - `GET /api/timestamp/get` : Obtenir la dernière mise à jour globale.
  - `GET /api/timestamp/get/:type/:platform` : Obtenir une mise à jour spécifique.
  - `GET /api/timestamp/update/:type` : Mettre à jour une information spécifique.

## Historique de trades

- **Routeur** : [`routeTrade.ts`](../src/routes/routeTrade.ts)
- **Endpoints** :
  - `GET /api/trades/get` : Obtenir les trades historiques.
  - `POST /api/trades/add` : Ajouter des trades manuellement.
  - `GET /api/trades/fetch/:platform/:base` : Récupérer les derniers trades d'une base spécifique.
  - `GET /api/trades/update/:platform` : Mettre à jour les trades pour une plateforme.

## WebSocket

- **Routeur** : [`routeWs.ts`](../src/routes/routeWs.ts)
- **Endpoints** :
  - `GET /api/ws/connect` : Établir une connexion WebSocket.
  - `POST /api/ws/send` : Envoyer un message via WebSocket.
  - `GET /api/ws/status` : Vérifier l'état de la connexion WebSocket.

