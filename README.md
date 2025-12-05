# Machi Shad - Monorepo

Ce projet combine le frontend et le backend de l'application Machi Shad dans un seul repository monorepo.

## Structure du Projet

```
.
├── frontend/          # Application frontend (Vue.js/TypeScript)
├── backend/           # API backend (Node.js/TypeScript)
└── README.md          # Ce fichier
```

## Historique

Ce monorepo a été créé en fusionnant deux repositories distincts tout en préservant l'historique complet des commits :

- **Frontend** : https://github.com/machichiotte/machi-shad-frontend (494 commits)
- **Backend** : https://github.com/machichiotte/machi-shad-backend (390 commits)

**Total des commits préservés** : 887 commits

## Frontend

Le frontend est une application Vue.js avec TypeScript. Pour plus de détails, consultez le [README du frontend](./frontend/README.md).

### Démarrage rapide - Frontend

```bash
cd frontend
yarn install
yarn dev
```

## Backend

Le backend est une API Node.js avec TypeScript. Pour plus de détails, consultez le [README du backend](./backend/README.md).

### Démarrage rapide - Backend

```bash
cd backend
yarn install
yarn dev
```

## Scripts Globaux (Optionnel)

Vous pouvez ajouter des scripts npm à la racine pour gérer les deux projets simultanément en utilisant des workspaces ou des outils comme `concurrently`.

## Licence

Voir les fichiers LICENSE respectifs dans chaque sous-projet.
