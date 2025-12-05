// backend/doc/sprint.md

---
# CONSIGNES (Non Modifiable)

## Avant de commencer une tâche :

1. **Contexte** : Toujours vérifier le contexte dans `backend/doc/index.md` ainsi que la structure du projet dans `backend/doc/tree.md`.
2. **Conventions** : Respecter les conventions dans `backend/doc/contributing.md`, notamment les fonctionnalités et l'architecture.
3. **Cohérence** : Assurer la cohérence avec :
   - Les dépendances critiques.
   - Les configurations indiquées dans les fichiers existants.

## Pendant la réalisation :

1. **Code** :
   - Produire du code **lisible**, **optimisé** et **sécurisé**.
   - Ajouter des **commentaires clairs** et des exemples concrets pour tout nouveau code.
2. **Fichiers critiques** :
   - Ne jamais modifier directement les fichiers critiques sans demande explicite et documentée dans `./sprint.md`.
3. **Sécurité** :
   - Appliquer les consignes liées aux cryptomonnaies (gestion des API, données sensibles).
4. **Documentation** :
   - Documenter les erreurs et solutions dans `backend/doc/error.md`.
   - Mettre à jour les fichiers suivants si applicable :
     - `backend/doc/routes.md` : en cas d’ajout ou modification de routes.
     - `backend/doc/tests.md` : pour tout ajout ou modification de tests.
     - `backend/doc/tree.md` : en cas d’ajout ou modification de fichiers.
     - `backend/doc/log.md` : en cas d’ajout ou modification d'événements.
     - `backend/doc/sprint.md` : en cas d’ajout ou modification de tâches.

## Après la tâche :
1. **Division des tâches** :
   - Si un **objectif global** est défini (ex. : créer un système d'alarme), mais qu'aucune **liste de tâches détaillées** n'est encore disponible dans le bloc SPRINT, divisez cet objectif en **sous-tâches claires, fonctionnelles et réalisables individuellement**.
   - Les sous-tâches doivent être structurées pour avancer progressivement vers l'objectif principal, en assurant la modularité et la clarté.
   - Chaque sous-tâche doit pouvoir être testée et validée indépendamment.

2. **Suivi des tâches** :
   - Mettre à jour les tâches réalisées dans `backend/doc/done-tasks.md` après chaque commit.
   - Vérifier que tous les fichiers nécessaires (`backend/doc/error.md`, `backend/doc/tests.md`, etc.) ont bien été modifiés si besoin.

## Templates à respecter :

- **Commits** : Respecter les templates pour un suivi précis et efficace.
- **Documentation** : Toujours inclure les détails des solutions et des erreurs.
# FIN
---
# OBJECTIF (Non Modifiable)
Je veux créer un système d'alarme : le client choisit prix, base et platform. cote serveur ici donc, on recoit ces donnees, les enregistre. Ensuite dans mon code j'ai deja un cron qui va aller chercher les tickers. C'est en comparant ces tickers avec mes alarmes que je vais savoir si il y a une alarme a declencher et donc une notification a envoyer. Je pense envoyer d'autres types de notifications aussi mais pas tout de suite (separe bien notification de alarme donc, ce sont 2 choses distinctes).  
Information recueillie côté client : {price, base, platform}  
Type de notification : push (web / android)  
Stockage alarmes sur mongodb possible : {price, base, platform, createdAt, updatedAt, status}  
# FIN
---

---
# Liste des Tâches à Effectuer (Modifiable)
## Étape 1 : Gestion des Notifications

### 1.1 Création de la structure de base pour les notifications
- [ ] Créer un fichier serviceNotification.ts dans le répertoire backend/src/services.
- [ ] Ajouter une fonction sendPushNotification(data: NotificationInput) pour envoyer des notifications push.
      - Données attendues : {title, message, platform}.
- [ ] Ajouter une fonction logNotification(data: NotificationLog) pour enregistrer les notifications envoyées.

### 1.2 Intégration avec la gestion des alarmes
- [ ] Modifier la fonction checkAndTriggerAlarms pour appeler sendPushNotification en cas de déclenchement d'alarme.

### 1.3 Tests unitaires et validations
- [ ] Créer un fichier serviceNotification.test.ts dans le répertoire tests/services.
- [ ] Écrire des tests pour les fonctions suivantes :
      - sendPushNotification : Valider l'envoi pour différentes plateformes (web, android).
      - logNotification : Vérifier la création correcte des logs.

### 1.4 Documentation et validation finale
- [ ] Mettre à jour les fichiers suivants :
      - tests.md : Détails des tests pour serviceNotification.
      - error.md : Documenter les erreurs possibles liées aux notifications.
- [ ] Vérifier que tous les tests passent et qu'il n'y a pas d'erreurs dans error.md.

### 1.5 Commit
- [ ] Créer un commit dédié pour la gestion des notifications avec une description claire.
# FIN