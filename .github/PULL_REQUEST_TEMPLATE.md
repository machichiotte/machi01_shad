## 📝 Description

<!-- Décrivez brièvement les changements apportés -->

## 🎯 Type de changement

<!-- Cochez les cases appropriées -->

- [ ] 🐛 Bug fix (changement non-breaking qui corrige un problème)
- [ ] ✨ Nouvelle fonctionnalité (changement non-breaking qui ajoute une fonctionnalité)
- [ ] 💥 Breaking change (correction ou fonctionnalité qui causerait un dysfonctionnement des fonctionnalités existantes)
- [ ] 📚 Documentation (mise à jour de la documentation uniquement)
- [ ] 🎨 Style (formatage, point-virgules manquants, etc.)
- [ ] ♻️ Refactoring (ni correction de bug ni ajout de fonctionnalité)
- [ ] ⚡ Performance (amélioration des performances)
- [ ] ✅ Tests (ajout ou modification de tests)
- [ ] 🔧 Chore (maintenance, dépendances, etc.)

## 🔗 Issue liée

<!-- Lien vers l'issue GitHub si applicable -->

Closes #(numéro de l'issue)

## 🧪 Comment tester ?

<!-- Décrivez les étapes pour tester vos changements -->

1. Étape 1
2. Étape 2
3. Étape 3

## 📸 Captures d'écran (si applicable)

<!-- Ajoutez des captures d'écran pour illustrer les changements visuels -->

## ✅ Checklist

<!-- Cochez toutes les cases avant de soumettre la PR -->

### Code Quality

- [ ] Mon code suit les standards du projet (voir [CONTRIBUTING.md](../CONTRIBUTING.md))
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai commenté mon code, particulièrement dans les zones complexes
- [ ] J'ai utilisé des noms de variables et fonctions descriptifs
- [ ] J'ai évité la duplication de code

### Documentation

- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] J'ai ajouté des commentaires JSDoc pour les fonctions publiques
- [ ] J'ai mis à jour le CHANGELOG.md si applicable

### Tests

- [ ] J'ai ajouté des tests qui prouvent que ma correction est efficace ou que ma fonctionnalité fonctionne
- [ ] Les tests unitaires passent localement (`yarn test`)
- [ ] Les nouveaux tests et les tests existants passent avec mes changements
- [ ] La couverture de code n'a pas diminué

### Qualité du code

- [ ] Le linting passe sans erreurs (`yarn lint`)
- [ ] Le formatage est correct (`yarn format`)
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai vérifié qu'il n'y a pas de `console.log` ou de code de debug

### TypeScript (si applicable)

- [ ] Tous les types sont correctement définis
- [ ] Aucune utilisation de `any` (sauf si absolument nécessaire et justifié)
- [ ] Les interfaces et types sont exportés si nécessaires ailleurs

### Performance

- [ ] J'ai vérifié que mes changements n'impactent pas négativement les performances
- [ ] J'ai optimisé les requêtes API si applicable
- [ ] J'ai évité les re-renders inutiles (frontend)

### Sécurité

- [ ] J'ai vérifié qu'il n'y a pas de failles de sécurité évidentes
- [ ] Les données sensibles ne sont pas exposées
- [ ] Les entrées utilisateur sont validées
- [ ] Pas de clés API ou secrets en dur dans le code

### Git

- [ ] Mes commits suivent le format Conventional Commits
- [ ] J'ai rebasé ma branche sur la dernière version de `main`/`develop`
- [ ] Il n'y a pas de conflits de merge

## 📊 Impact

<!-- Décrivez l'impact de vos changements -->

### Frontend

- [ ] Aucun impact
- [ ] Changements mineurs
- [ ] Changements majeurs

### Backend

- [ ] Aucun impact
- [ ] Changements mineurs
- [ ] Changements majeurs

### Base de données

- [ ] Aucun impact
- [ ] Migration nécessaire
- [ ] Changements de schéma

## 🔄 Breaking Changes

<!-- Si vous avez coché "Breaking change" ci-dessus, décrivez les changements incompatibles -->

<!--
Exemple :
- L'endpoint `/api/orders` nécessite maintenant un paramètre `userId`
- La fonction `createOrder()` a une nouvelle signature
-->

## 📝 Notes additionnelles

<!-- Toute autre information pertinente pour les reviewers -->

## 👀 Reviewers

<!-- Mentionnez les personnes que vous souhaitez voir reviewer cette PR -->

@machichiotte

---

**Merci pour votre contribution ! 🙏**
