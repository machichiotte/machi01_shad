// doc/index.md
# Machi00 Server
Backend pour l'application Machi00, gérant les ordres de trading et les données de marché.

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

## Démarrage rapide

1. Clonez le dépôt
2. Installez les dépendances : `yarn install`
3. Configurez les variables d'environnement dans `.env`
4. Lancez le serveur : `yarn dev`
Le serveur sera accessible à `http://localhost:10000`.

## Architecture

Le backend suit une architecture MVC (Modèle-Vue-Contrôleur) : `./tree.md`.

## Points d'API

Le backend expose les points d'API dans le fichier suivant  : `./routes.md`.

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
