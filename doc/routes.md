// doc/routes.md
# Points d'API
## Données de marché et CMC
- `GET /api/cmc/get`: Obtenir les données CMC
- `GET /api/cmc/update`: Mettre à jour les données CMC
- `GET /api/market/get`: Obtenir les données de marché
- `GET /api/tickers/get`: Obtenir tous les tickers
- `GET /api/tickers/update`: Mettre à jour tous les tickers

## Données de trading
- `GET /api/balance/get`: Obtenir le solde du compte
- `GET /api/balance/update/:platform`: Mettre à jour le solde pour une plateforme spécifique
- `GET /api/orders/get`: Obtenir les ordres de trading actifs.
- `GET /api/orders/update/:platform`: Mettre à jour les ordres pour une plateforme spécifique.
- `GET /api/strategy/get`: Obtenir les données de stratégie.
- `POST /api/strategy/update`: Mettre à jour les données de stratégie.
- `POST /api/strategy/updateById`: Mettre à jour une stratégie par son ID.
- `POST /api/strategy/updateByIds`: Mettre à jour plusieurs stratégies par leurs IDs.
- `GET /api/trades/get`: Obtenir les trades historiques.
- `POST /api/trades/add`: Ajouter des trades manuellement.
- `GET /api/trades/fetch/:platform/:base`: Récupérer les derniers trades d'une plateforme pour une base spécifique.
- `GET /api/trades/update/:platform`: Mettre à jour les trades pour une plateforme spécifique.

## Gestion des ordres
- `POST /api/orders/cancel`: Annuler un ordre spécifique.
- `POST /api/orders/cancel/all`: Annuler tous les ordres.
- `POST /api/orders/cancel/all/sell`: Annuler tous les ordres de vente.
- `POST /api/orders/cancel/all/buy`: Annuler tous les ordres d'achat.
- `POST /api/orders/market-buy-order`: Créer un ordre d'achat au marché.
- `POST /api/orders/market-sell-order`: Créer un ordre de vente au marché.
- `POST /api/orders/limit-buy-order`: Créer un ordre d'achat limite.
- `POST /api/orders/limit-sell-order`: Créer un ordre de vente limite.

## Gestion des configurations API
- `GET /api/config/get`: Récupérer la configuration actuelle de l'API.
- `POST /api/config/update`: Mettre à jour la configuration de l'API.
- `POST /api/config/update-api-key`: Mettre à jour une clé API.

## Gestion des fichiers
- `POST /api/converter/post` : Convertir un fichier CSV (nécessite un fichier dans le payload).

## Authentification
- `POST /api/auth/login` : Connexion utilisateur.
- `POST /api/auth/register` : Inscription utilisateur.

## Gestion des timestamps
- `GET /api/timestamp/get` : Obtenir la dernière mise à jour globale.
- `GET /api/timestamp/get/:type/:platform` : Obtenir une mise à jour spécifique.
- `GET /api/timestamp/update/:type` : Mettre à jour une information par type.

## Alarme
- `POST /api/alarm/set` : Définir une alarme.

## Gestion des stratégies (Machi)
- `GET /api/machi/get` : Récupérer les stratégies Machi.
- `POST /api/machi/trailing` : Gérer un trailing stop hedge.