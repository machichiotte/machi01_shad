# Architecture du Backend

Le backend suit une architecture modulaire et organisée, basée sur des principes MVC (Modèle-Vue-Contrôleur) et des services. Voici une vue d'ensemble des dossiers et fichiers principaux.

---

## 1. **Configuration**

### Dossier : `config/`
Contient les fichiers de configuration pour l'application.

- **`default.ts`** : Définit les valeurs par défaut pour les configurations.
- **`index.ts`** : Charge les configurations en fonction de l'environnement (`dev`, `prod`, `test`).
- **`types.ts`** : Définit les types pour les configurations (API, serveur, etc.).

---

## 2. **Contrôleurs**

### Dossier : `src/ctrl/`
Gère les requêtes entrantes et les réponses.

- **`ctrlAuth.ts`** : Gestion des requêtes liées à l'authentification.
- **`ctrlBalance.ts`** : Gestion des soldes des utilisateurs.
- **`ctrlCmc.ts`** : Gestion des données CoinMarketCap.
- **`ctrlMarket.ts`** : Gestion des données de marché.
- **`ctrlDashboard.ts`** : Gestion des stratégies Dashboard.
- **`ctrlOrder.ts`** : Gestion des ordres de trading.
- **`ctrlRss.ts`** : Gestion des flux RSS.
- **`ctrlStrategy.ts`** : Gestion des stratégies de trading.
- **`ctrlTicker.ts`** : Gestion des tickers.
- **`ctrlTimestamp.ts`** : Gestion des timestamps.
- **`ctrlTrade.ts`** : Gestion des historiques de trades.
- **`ctrlAlarm.ts`** : Gestion des alarmes.
- **`ctrlNotification.ts`** : Gestion des notifications push.

---

## 3. **Routes**

### Dossier : `src/routes/`
Définit les points d'API pour chaque fonctionnalité.

- **`routeAlarm.ts`** : Routes pour la gestion des alarmes.
- **`routeAuth.ts`** : Routes pour l'authentification.
- **`routeBalance.ts`** : Routes pour les soldes.
- **`routeCmc.ts`** : Routes pour les données CoinMarketCap.
- **`routeConfigApi.ts`** : Routes pour la configuration de l'API.
- **`routeConverter.ts`** : Routes pour la conversion de fichiers CSV.
- **`routeDashboard.ts`** : Routes pour les stratégies Dashboard.
- **`routeMarket.ts`** : Routes pour les données de marché.
- **`routeOrder.ts`** : Routes pour les ordres de trading.
- **`routeRss.ts`** : Routes pour les flux RSS.
- **`routeStrategy.ts`** : Routes pour les stratégies de trading.
- **`routeTicker.ts`** : Routes pour les tickers.
- **`routeTimestamp.ts`** : Routes pour les timestamps.
- **`routeTrade.ts`** : Routes pour les historiques de trades.
- **`routeWs.ts`** : Routes pour les connexions WebSocket.

---

## 4. **Services**

### Dossier : `src/services/`
Contient la logique métier et les interactions avec les API externes.

#### **Sous-dossier : `api/`**
- **`serviceApi.ts`** : Gestion des appels API externes.

##### **Sous-dossier : `database/`**
- **`serviceDatabase.ts`** : Gestion générale des bases de données.
- **`serviceMongodb.ts`** : Gestion des interactions avec MongoDB.
- **`serviceMongodbOperations.ts`** : Opérations spécifiques pour MongoDB.
- **`serviceStrategy.ts`** : Gestion des stratégies liées aux bases de données.
- **`serviceTimestamp.ts`** : Gestion des timestamps dans les bases de données.

##### **Sous-dossier : `gemini/`**
- **`client.ts`** : Client pour interagir avec l'API Gemini.
- **`constants.ts`** : Constantes spécifiques à Gemini.
- **`quotaManager.ts`** : Gestion des quotas pour l'API Gemini.
- **`serviceGemini.ts`** : Gestion des appels à l'API Gemini.
- **`types.ts`** : Types spécifiques à Gemini.
- **`utils.ts`** : Fonctions utilitaires pour Gemini.

##### **Sous-dossier : `platform/`**
- **`mappingPlatform.ts`** : Mapping des données entre différentes plateformes.
- **`serviceBalance.ts`** : Gestion des soldes des plateformes.
- **`serviceBinanceWs.ts`** : Gestion des WebSockets pour Binance.
- **`serviceCcxt.ts`** : Intégration avec la bibliothèque CCXT.
- **`serviceDashboard.ts`** : Gestion des stratégies Dashboard.
- **`serviceMarket.ts`** : Gestion des données de marché.
- **`serviceOrderBalance.ts`** : Gestion des ordres et des soldes.
- **`serviceOrderMarket.ts`** : Gestion des ordres de marché.
- **`serviceSwap.ts`** : Gestion des swaps entre actifs.
- **`serviceTicker.ts`** : Gestion des tickers.
- **`serviceTrade.ts`** : Gestion des trades.

- **`serviceCmc.ts`** : Gestion des données CoinMarketCap.

#### **Sous-dossier : `config/`**
- **`serviceConfigApi.ts`** : Gestion des configurations liées aux API.
- **`serviceConfigServer.ts`** : Gestion des configurations du serveur.

#### **Sous-dossier : `content/`**
- **`serviceContentScraper.ts`** : Extraction de contenu dynamique.
- **`serviceRssFetcher.ts`** : Récupération des flux RSS.
- **`serviceRssProcessor.ts`** : Traitement des flux RSS.

#### **Sous-dossier : `cryptoAnalytics/`**
##### **Sous-dossier : `indicator/`**
- **`bollingerBands.ts`** : Calcul des bandes de Bollinger.
- **`movingAverageCross.ts`** : Détection des croisements de moyennes mobiles.
- **`rsi.ts`** : Calcul de l'indicateur RSI.
- **`indicator.md`** : Documentation des indicateurs.

##### **Sous-dossier : `invest/`**
- **`index.ts`** : Point d'entrée pour les stratégies d'investissement.
- **`invest.md`** : Documentation des stratégies d'investissement.
- **`progressiveSell.ts`** : Stratégie de vente progressive.
- **`shad.ts`** : Stratégie SHAD.
- **`thresholdSell.ts`** : Stratégie de vente par seuil.
- **`tieredSell.ts`** : Stratégie de vente par paliers.

- **`cmc.ts`** : Gestion des données CoinMarketCap.
- **`defaultAssets.ts`** : Gestion des actifs par défaut.
- **`tradeCalculations.ts`** : Calculs liés aux trades.
- **`tradingUtils.ts`** : Fonctions utilitaires pour le trading.

#### **Sous-dossier : `update/`**
- **`updateManager.ts`** : Gestion des mises à jour globales.
- **`updateManagerGeneral.ts`** : Gestion des mises à jour générales.
- **`updateManagerPlatform.ts`** : Gestion des mises à jour spécifiques aux plateformes.

#### **Fichiers principaux**
- **`serviceAlarm.ts`** : Gestion des alarmes.
- **`serviceAuth.ts`** : Gestion de l'authentification.
- **`serviceCache.ts`** : Gestion du cache en mémoire.
- **`serviceConverter.ts`** : Gestion de la conversion de fichiers.
- **`serviceCron.ts`** : Gestion des tâches planifiées (CRON).
- **`serviceEmail.ts`** : Gestion des envois d'emails.
- **`serviceProcessor.ts`** : Calcul des métriques pour les actifs.
- **`serviceTrailingStop.ts`** : Gestion des trailing stops.

---

## 5. **Dépôts**

### Dossier : `src/repo/`
Gère l'accès aux données dans la base de données. Chaque fichier correspond à une entité ou fonctionnalité spécifique.

- **`repoAlarm.ts`** : Accès aux données des alarmes.
- **`repoAuth.ts`** : Accès aux données d'authentification.
- **`repoBalance.ts`** : Accès aux données des soldes.
- **`repoCmc.ts`** : Accès aux données CoinMarketCap.
- **`repoConfigApi.ts`** : Accès aux données de configuration des API.
- **`repoConfigServer.ts`** : Accès aux données de configuration du serveur.
- **`repoHighPrice.ts`** : Accès aux données des prix élevés (high prices).
- **`repoDashboard.ts`** : Accès aux données des stratégies Dashboard.
- **`repoMarket.ts`** : Accès aux données de marché.
- **`repoOrderBalance.ts`** : Accès aux données des ordres et des soldes.
- **`repoRss.ts`** : Accès aux données des flux RSS.
- **`repoStrategy.ts`** : Accès aux données des stratégies de trading.
- **`repoTicker.ts`** : Accès aux données des tickers.
- **`repoTimestamp.ts`** : Accès aux données des timestamps.
- **`repoTrade.ts`** : Accès aux données des historiques de trades.
- **`repoTrailingStop.ts`** : Accès aux données des trailing stops.

---

## 6. **Middlewares**

### Dossier : `src/middlewares/`
Contient les middlewares pour le traitement des requêtes.

- **`fileUploadMiddleware.ts`** : Middleware pour la gestion des uploads de fichiers.

---

## 7. **Utilitaires**

### Dossier : `src/utils/`
Contient des fonctions utilitaires réutilisables.

- **`cronUtil.ts`** : Fonctions utilitaires pour la gestion des tâches CRON.
- **`encryption.ts`** : Fonctions pour le chiffrement et le déchiffrement.
- **`errorUtil.ts`** : Gestion des erreurs.
- **`loggerUtil.ts`** : Gestion des logs avec Winston.
- **`mappingUtil.ts`** : Fonctions pour mapper les données entre différents formats.
- **`metricsUtil.ts`** : Calcul des métriques et statistiques.
- **`mockUtil.ts`** : Génération de données factices pour les tests.
- **`platformUtil.ts`** : Fonctions utilitaires pour les plateformes.
- **`processorUtil.ts`** : Fonctions utilitaires pour le traitement des données.
- **`retryUtil.ts`** : Gestion des tentatives automatiques pour les appels réseau.
- **`timeUtil.ts`** : Fonctions utilitaires pour la gestion du temps.
- **`validationUtil.ts`** : Fonctions pour valider les entrées utilisateur.

---

## 8. **Types**

### Dossier : `src/types/`
Définit les types TypeScript utilisés dans le projet.

- **`auth.ts`** : Types pour l'authentification.
- **`balance.ts`** : Types pour les soldes.
- **`cmc.ts`** : Types pour les données CoinMarketCap.
- **`order.ts`** : Types pour les ordres.
- **`trade.ts`** : Types pour les trades.
- **`rss.ts`** : Types pour les flux RSS.
- **`platform.ts`** : Types pour les plateformes.
- **`cron.ts`** : Types pour les tâches CRON.

---

## 9. **Tests**

### Dossier : `tests/`
Contient les tests unitaires et d'intégration.

- **`unit/`** : Tests unitaires pour les contrôleurs, services et utilitaires.
- **`integration/`** : Tests d'intégration pour les routes et les services.

---

## 10. **Fichiers Racine**

- **`index.ts`** : Point d'entrée principal du backend.
- **`server.ts`** : Configuration et démarrage du serveur Express.
- **`jest.config.ts`** : Configuration pour les tests avec Jest.
- **`tsconfig.json`** : Configuration TypeScript.
- **`.env`** : Variables d'environnement.

---

## 11. **Documentation**

### Dossier : `doc/`
Contient la documentation du projet.

- **`contributing.md`** : Guide pour contribuer au projet.
- **`done-tasks.md`** : Liste des tâches terminées.
- **`error.md`** : Documentation des erreurs courantes et leur résolution.
- **`index.md`** : Page d'accueil de la documentation.
- **`log.md`** : Historique des modifications et des journaux.
- **`routes.md`** : Documentation des points d'API.
- **`sprint.md`** : Liste des tâches à effectuer.
- **`tests.md`** : Documentation des tests unitaires et d'intégration.
- **`tree.md`** : Structure détaillée du projet.

---

Si vous identifiez d'autres fichiers ou fonctionnalités manquants, je peux les ajouter à cette structure. Faites-moi savoir si vous souhaitez des ajustements ou des détails supplémentaires !