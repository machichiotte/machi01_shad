# Machi GPT Shad Server

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Backend pour l'application Machi GPT Shad, gérant les ordres de trading et les données de marché.

## Table des matières

- [Description](#description)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Démarrage rapide](#démarrage-rapide)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [API](#api)
- [Sécurité](#sécurité)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Contribution](#contribution)
- [Licence](#licence)
- [Contact](#contact)

## Description

Le backend Machi GPT Shad Server est construit avec Node.js et Express.js. Il gère les ordres de trading en temps réel, récupère et met à jour les données de marché, et s'intègre à plusieurs plateformes d'échange de cryptomonnaies.

## Fonctionnalités principales

- 🚀 Gestion des ordres de trading en temps réel
- 📊 Récupération et mise à jour des données de marché
- 🔗 Intégration avec plusieurs plateformes d'échange
- 🔒 Système d'authentification sécurisé
- 📈 Gestion des stratégies de trading
- 🔄 Conversion de fichiers CSV pour l'importation de données
- ⏱️ Planification de tâches automatisées

## Démarrage rapide

1. Clonez le dépôt
2. Installez les dépendances : `npm install` / `yarn install`
3. Configurez les variables d'environnement dans `.env`
4. Lancez le serveur : `npm run dev` / `yarn dev`

Le serveur sera accessible à `http://localhost:10000`.

## Prérequis

Avant d'installer et d'exécuter ce projet, assurez-vous d'avoir les éléments suivants installés sur votre système :

- Node.js (version 14 ou supérieure recommandée)
- npm ou yarn
- MongoDB (installé localement ou accès à une instance distante)
- Git

## Installation

1. Clonez le dépôt depuis GitHub :

```bash
git clone https://github.com/machichiotte/machi-shad-backend.git
```

2. Installez les dépendances :
   `npm install` / `yarn install`

## Configuration

Avant d'exécuter le backend, assurez-vous de configurer les variables d'environnement. Créez un fichier `.env` dans le répertoire racine du backend avec le contenu suivant :

- `MONGODB_URI=votre_chaine_de_connexion_mongodb`
- `CMC_APIKEY=votre_cle_api_coinmarketcap`
- `MONGODB_COLLECTION_CMC=nom_de_votre_collection_cmc`
- `TYPE_CMC=type_de_donnees_cmc`
- `OFFLINE_MODE=true_ou_false`

Remplacez les valeurs par vos propres paramètres.

## Utilisation

Pour démarrer le serveur backend, exécutez la commande suivante :
`npm run dev` ou `yarn dev`

Le serveur démarrera sur `http://localhost:10000`. Le backend est maintenant prêt à traiter les requêtes entrantes.

## Architecture

Le backend suit une architecture MVC (Modèle-Vue-Contrôleur) :

- config/
- ├── envConfig.ts
- ├── index.ts
- ├── types.ts
- src/
- ├── models/ # Modèles de données
- │ ├── dbTypes.ts
- │ ├── express.d.ts
- │ ├── processorTypes.ts
- │ ├── strategyModel.ts
- ├── controllers/ # Contrôleurs pour gérer les requêtes
- │ ├── authController.ts
- │ ├── balanceController.ts
- │ ├── cmcController.ts
- │ ├── converterController.ts
- │ ├── timestampController.ts
- │ ├── marketController.ts
- │ ├── orderBalanceController.ts
- │ ├── orderMarketController.ts
- │ ├── shadController.ts
- │ ├── strategyController.ts
- │ ├── tickerController.ts
- │ ├── tradeController.ts
- ├── services/ # Services pour la logique métier
- │ │ ├─ metrics/
- │ │ │ ├─ cmc.ts
- │ │ │ ├─ global.ts
- │ │ │ ├─ strategies.ts
- │ │ │ ├─ trades.ts
- │ │ │ ├─ utils.ts
- │ ├── cronTasksService.ts
- │ ├── emailService.ts
- │ ├── authService.ts
- │ ├── balanceService.ts
- │ ├── cmcService.ts
- │ ├── converterService.ts
- │ ├── databaseOperationsService.ts
- │ ├── timestampService.ts
- │ ├── mappingService.ts
- │ ├── marketService.ts
- │ ├── migrationSwapService.ts
- │ ├── mongodbService.ts
- │ ├── orderBalanceService.ts
- │ ├── orderMarketService.ts
- │ ├── processorService.ts
- │ ├── shadService.ts
- │ ├── strategyService.ts
- │ ├── tickerService.ts
- │ ├── tradeService.ts
- │ ├── trailingStopService.ts
- ├── routes/ # Définition des routes API
- │ ├── authRoutes.ts
- │ ├── balanceRoutes.ts
- │ ├── cmcRoutes.ts
- │ ├── converterRoutes.ts
- │ ├── timestampRoutes.ts
- │ ├── marketRoutes
- │ ├── orderRoutes
- │ ├── shadRoutes
- │ ├── strategyRoutes
- │ ├── tickerRoutes
- │ ├── tradeRoutes
- ├── middleware/ # Middleware pour l'authentification, etc.
- │ ├── authMiddleware.ts
- │ ├── errorMiddleware.ts
- ├── utils/ # Utilitaires et helpers
- │ ├── errorUtil.ts
- │ ├── taskExecutor.ts
- │ ├── loggerUtil.ts
- │ ├── mappingUtil.ts
- │ ├── mockUtil.ts
- │ ├── platformUtil.ts
- │ ├── processorUtil.ts
- │ ├── retryUtil.ts
- ├── constants.ts
- ├── server.ts
- └── index.ts
- tests/
- ├── unit/
- │ ├── config.test.ts
- │ ├── services/
- │ │ ├── balanceService.test.ts
- │ │ ├── orderService.test.ts
- │ │ ├── marketDataService.test.ts
- │ │ ├── authService.test.ts
- │ │ ├── strategyService.test.ts
- │ │ ├── tradeService.test.ts
- │ │ ├── shadService.test.ts
- │ │ ├── converterService.test.ts
- │ ├── controllers/
- │ │ ├── orderController.test.ts
- │ │ ├── marketDataController.test.ts
- │ │ ├── authController.test.ts
- │ │ ├── strategyController.test.ts
- │ │ ├── tradeController.test.ts
- │ │ ├── shadController.test.ts
- │ │ ├── converterController.test.ts
- │ ├── models/
- │ │ ├── userModel.test.ts
- │ │ ├── orderModel.test.ts
- │ │ ├── marketDataModel.test.ts
- │ │ ├── strategyModel.test.ts
- │ │ ├── tradeModel.test.ts
- │ │ ├── shadModel.test.ts
- │ │ ├── converterModel.test.ts
- ├── integration/
- │ ├── orderIntegration.test.ts
- │ ├── marketDataIntegration.test.ts
- │ ├── authIntegration.test.ts
- │ ├── strategyIntegration.test.ts
- │ ├── tradeIntegration.test.ts
- │ ├── shadIntegration.test.ts
- │ ├── converterIntegration.test.ts
- └── **mocks**/
-     ├── config.ts
- jest.config.js
- tsconfig.json
- package.json
- .env
- .env.dev
- .env.prod
- .env.test

## Sécurité

- Utilisation de bcrypt pour le hachage des mots de passe
- Implémentation de JWT (JSON Web Tokens) pour l'authentification
- Protection contre les attaques CSRF et XSS grâce à Helmet
- Validation des entrées utilisateur
- Gestion sécurisée des clés API et des secrets via les variables d'environnement

## Points d'API

Le backend expose les points d'API suivants :

### Données de marché et CMC

- `GET /api/cmc/get`: Obtenir les données CMC
- `GET /api/cmc/update`: Mettre à jour les données CMC
- `GET /api/market/get`: Obtenir les données de marché
- `GET /api/prices/get/history/btc`: Obtenir l'historique des prix BTC
- `GET /api/prices/get/history/eth`: Obtenir l'historique des prix ETH
- `GET /api/tickers/get`: Obtenir tous les tickers
- `GET /api/tickers/update`: Mettre à jour tous les tickers

### Données de trading

- `GET /api/balance/get`: Obtenir le solde du compte
- `GET /api/balance/update/:platform`: Mettre à jour le solde actuel pour une plateforme spécifique
- `GET /api/orders/get`: Obtenir les ordres de trading actifs
- `GET /api/orders/update/:platform`: Mettre à jour les ordres pour une plateforme spécifique
- `GET /api/strategy/get`: Obtenir les données de stratégie
- `POST /api/strategy/update`: Mettre à jour les données de stratégie
- `GET /api/trades/get`: Obtenir les trades historiques
- `POST /api/trades/add`: Ajouter des trades manuellement
- `GET /api/trades/update/:platform`: Mettre à jour les trades pour une plateforme spécifique
- `GET /api/shad/get`: Obtenir les données SHAD

### Gestion des ordres

- `POST /api/orders/cancel`: Annuler un ordre spécifique
- `POST /api/orders/cancel/all`: Annuler tous les ordres
- `POST /api/orders/cancel/all/sell`: Annuler tous les ordres de vente
- `POST /api/orders/market-buy-order`: Créer un ordre d'achat au marché
- `POST /api/orders/market-sell-order`: Créer un ordre de vente au marché
- `POST /api/orders/bunch-limit-buy-orders`: Créer plusieurs ordres d'achat limites
- `POST /api/orders/bunch-limit-sell-orders`: Créer plusieurs ordres de vente limites

### Autres

- `POST /api/converter/post`: Convertir un fichier CSV
- `POST /api/auth/login`: Connexion utilisateur
- `POST /api/auth/register`: Inscription utilisateur
- `GET /api/timestamp/get`: Obtenir la dernière mise à jour
- `GET /api/timestamp/get/:type/:platform`: Obtenir une mise à jour spécifique
- `GET /api/timestamp/update/:type`: Mettre à jour par type

## Dépendances

Le backend utilise les packages Node.js suivants :

- `bcrypt`: Pour le hachage des mots de passe
- `body-parser`: Middleware pour analyser les requêtes HTTP entrantes
- `ccxt`: Bibliothèque pour accéder aux plateformes de cryptomonnaies
- `cors`: Middleware pour gérer les problèmes de partage de ressources entre origines (CORS)
- `dotenv`: Bibliothèque pour charger les variables d'environnement à partir d'un fichier `.env`
- `express`: Framework web pour gérer les requêtes HTTP et les routes
- `fs`: Module système de fichiers pour lire et écrire des fichiers
- `helmet`: Middleware pour sécuriser les applications Express
- `mongodb`: Pilote MongoDB pour Node.js pour se connecter et interagir avec une base de données MongoDB
- `multer`: Middleware pour gérer les données multipart/form-data
- `node-cron`: Pour planifier des tâches
- `nodemailer`: Pour envoyer des emails
- `papaparse`: Pour analyser les fichiers CSV
- `winston`: Pour la journalisation

## Tests

Pour exécuter les tests, utilisez la commande suivante :

```bash
npm test
```

ou si vous utilisez yarn :

```bash
yarn test
```

## Déploiement

Le backend peut être déployé sur diverses plateformes cloud comme Heroku, AWS, ou Google Cloud Platform. Assurez-vous de configurer correctement les variables d'environnement sur votre plateforme de déploiement.

Pour un déploiement sur Heroku, par exemple :

1. Créez une application Heroku
2. Connectez votre dépôt GitHub à Heroku
3. Configurez les variables d'environnement dans les paramètres de l'application
4. Déployez l'application via le tableau de bord Heroku ou en poussant vers la branche main

## Surveillance et journalisation

Nous utilisons Winston pour la journalisation. Configurez des alertes dans votre outil de surveillance préféré pour être informé des erreurs critiques.

## Roadmap

Voici quelques fonctionnalités prévues pour les futures versions :

- Implémenter un mode hors ligne robuste pour les tests, utilisant des fichiers JSON comme données simulées
- Améliorer la couverture des tests en incluant des scénarios pour le mode hors ligne
- Développer un outil pour générer et maintenir facilement les données de test JSON
- Intégrer le mode hors ligne dans le pipeline CI/CD pour des tests plus fiables

- Intégration de WebSockets pour les mises à jour en temps réel
- Ajout de nouvelles stratégies de trading automatisées
- Amélioration de l'analyse des données historiques
- Intégration avec plus de plateformes d'échange
- Mise en place d'un système de notifications avancé

## Contribution

Les contributions à ce projet sont les bienvenues. Pour contribuer :

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus d'informations.

## Contact

Si vous avez des questions ou besoin d'aide supplémentaire, n'hésitez pas à nous contacter à [machichiotte@gmail.com](mailto:machichiotte@gmail.com).
