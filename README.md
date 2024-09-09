# Machi GPT Shad Server

Ce projet est le backend de l'application Machi GPT Shad. Il sert de logique côté serveur pour gérer les ordres de trading et les données de marché.

## Description

Le backend est construit avec Node.js et Express.js, ainsi que d'autres bibliothèques nécessaires pour gérer les requêtes HTTP, se connecter à MongoDB et récupérer des données de sources externes.

## Installation

1. Clonez le dépôt depuis GitHub : `git clone https://github.com/machichiotte/machi-shad-backend.git`
2. Installez les dépendances : `npm install`

## Prérequis

Avant d'installer et d'exécuter ce projet, assurez-vous d'avoir les éléments suivants installés sur votre système :

- Node.js (version 14 ou supérieure recommandée)
- npm ou yarn
- MongoDB (installé localement ou accès à une instance distante)
- Git

## Configuration

Avant d'exécuter le backend, assurez-vous de configurer les variables d'environnement. Créez un fichier `.env` dans le répertoire racine du backend avec le contenu suivant :

- MONGODB_URI=votre_chaine_de_connexion_mongodb
- CMC_APIKEY=votre_cle_api_coinmarketcap
- MONGODB_COLLECTION_CMC=nom_de_votre_collection_cmc
- TYPE_CMC=type_de_donnees_cmc
- OFFLINE_MODE=true_ou_false

Remplacez les valeurs par vos propres paramètres.

## Utilisation

Pour démarrer le serveur backend, exécutez la commande suivante : `yarn dev`

Le serveur démarrera sur `http://localhost:10000`. Le backend est maintenant prêt à traiter les requêtes entrantes.

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
- `GET /api/lastUpdate/get`: Obtenir la dernière mise à jour
- `GET /api/lastUpdate/get/:type/:platform`: Obtenir une mise à jour spécifique
- `GET /api/lastUpdate/update/:type`: Mettre à jour par type

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
