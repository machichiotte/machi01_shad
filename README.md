# Machi00 Server

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Backend pour l'application Machi00, gérant les ordres de trading et les données de marché.

## Table des matières

- [Description](#description)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Fonctionnalités secondaires](#fonctionnalités-secondaires)
- [Démarrage rapide](#démarrage-rapide)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [Sécurité](#sécurité)
- [Points d'API](#points-dapi)
- [Dépendances](#dependances)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Surveillance et journalisation](#surveillance-et-journalisation)
- [Roadmap](#roadmap)
- [Contribution](#contribution)
- [Licence](#licence)
- [Contact](#contact)

## Description

Machi00 Server est le backend du projet Machi00, construit avec Node.js et Express.js et TypeScript.

## Fonctionnalités principales

- 🚀 Gestion des ordres de trading en temps réel
- 📊 Récupération et mise à jour des données de marché
- 🔗 Intégration avec plusieurs plateformes d'échange de cryptomonnaies
- 🔒 Système d'authentification sécurisé
- 📈 Gestion des stratégies de trading
- 📋 Planification de tâches automatisées
- ⏱️ Gestion des alarmes

## Fonctionnalités secondaires

- 🔄 Conversion de fichiers CSV pour l'importation de données historiques

## Prérequis

Avant d'installer et d'exécuter ce projet, assurez-vous d'avoir les éléments suivants installés sur votre système :

- Node.js (>=14)
- yarn
- MongoDB
- Git

## Démarrage rapide

1. Clonez le dépôt
2. Installez les dépendances : `npm install` / `yarn install`
3. Configurez les variables d'environnement dans `.env`
4. Lancez le serveur : `npm run dev` / `yarn dev`

Le serveur sera accessible à `http://localhost:10000`.

## Prérequis

Avant d'installer et d'exécuter ce projet, assurez-vous d'avoir les éléments suivants installés sur votre système :

- Node.js (>=14)
- yarn
- MongoDB
- Git

## Installation

1. Clonez le dépôt depuis GitHub :

```bash
git clone https://github.com/machichiotte/machi-shad-backend.git
```

2. Installez les dépendances :
   `yarn install`

## Configuration

Avant d'exécuter le backend, assurez-vous de configurer les variables d'environnement. Créez un fichier `.env` dans le répertoire racine du backend avec le contenu suivant :

- `PORT=`
- `OFFLINE_MODE=true_ou_false`

### Connect MongoDb
- `MONGODB_USER=`
- `MONGODB_PASSWORD=`
- `MONGODB_CLUSTER=`
- `MONGODB_DATABASE=`

### Collections MongoDb
- `MONGODB_COLLECTION_BALANCE=`
- `MONGODB_COLLECTION_CMC=`
- `MONGODB_COLLECTION_TIMESTAMP=`
- `MONGODB_COLLECTION_MACHI=`
- `MONGODB_COLLECTION_MARKET=`
- `MONGODB_COLLECTION_ORDER=`
- `MONGODB_COLLECTION_STRAT=`
- `MONGODB_COLLECTION_SWAP=`
- `MONGODB_COLLECTION_TRADE=`
- `MONGODB_COLLECTION_TICKER=`
- `MONGODB_COLLECTION_USER=`
- `MONGODB_COLLECTION_HIGHEST_PRICE=`
- `MONGODB_COLLECTION_PRICE_BTC=`
- `MONGODB_COLLECTION_PRICE_ETH=`
- `MONGODB_COLLECTION_SERVER_CONFIG=`
- `MONGODB_COLLECTION_API_CONFIG=`
- `MONGODB_COLLECTION_ALARM=`

### ApiKeys
- `ENCRYPTION_KEY=`
- `APIKEY_CMC=`
- `APIKEY_BINANCE=`
- `SECRETKEY_BINANCE=`

Remplacez les valeurs par vos propres paramètres.

## Utilisation

Pour démarrer le serveur backend, exécutez la commande suivante :
`yarn dev`

Le serveur démarrera sur `http://localhost:10000`. Le backend est maintenant prêt à traiter les requêtes entrantes.

## Architecture

Le backend suit une architecture MVC (Modèle-Vue-Contrôleur) : `./doc/tree.md`.

## Sécurité

- Utilisation de bcrypt pour le hachage des mots de passe
- Protection contre les attaques CSRF et XSS grâce à Helmet
- Validation des entrées utilisateur
- Gestion sécurisée des clés API et des secrets via les variables d'environnement

## Points d'API

Le backend expose les points d'API dans le fichier suivant  : `./doc/routes.md`.

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
