# Documentation des Nouvelles Méthodes d'investissement

## Objectifs des Nouvelles Méthodes d'investissement
1. Ajouter des méthodes simples utilisées en investissement.
2. Permettre le calcul des TP (Take Profit) selon ces nouvelles méthodes.
3. Documenter chaque méthode avec des exemples d'utilisation.

## Méthodes à Ajouter
- **Stratégie de vente progressive** : Vendre un pourcentage fixe à des paliers de prix.
- **Stratégie de vente par tranche** : Vendre des montants fixes à des paliers de prix.
- **Stratégie de vente à seuil** : Vendre lorsque le prix atteint un certain seuil.

## Marche à Suivre
1. **Créer un fichier Markdown** pour documenter les étapes.
2. **Implémenter chaque méthode** dans le fichier `index.ts`.
3. **Tester chaque méthode** pour s'assurer de leur bon fonctionnement.
4. **Mettre à jour la documentation** avec des exemples et des explications.

## Étapes à Suivre
- [x] Créer le fichier Markdown dans le dossier `src/services/cryptoAnalytics/invest/`.
- [x] Documenter les objectifs et la marche à suivre.
- [x] Implémenter la stratégie de vente progressive dans le fichier `progressiveSell.ts`.
- [x] Implémenter la stratégie de vente par tranche dans le fichier `tieredSell.ts`.
- [x] Implémenter la stratégie de vente à seuil dans le fichier `thresholdSell.ts`.
- [x] Tester chaque méthode pour s'assurer de leur bon fonctionnement. (dossier tests/unit)
- [x] Mettre à jour la documentation avec des exemples et des explications.

## Exemples d'Utilisation

### Stratégie de vente progressive
```typescript
import { calculateProgressiveSell } from './progressiveSell';

const totalAmount = 1000; // Montant total à vendre
const sellPercentage = 20; // Pourcentage à vendre à chaque étape
const steps = 5; // Nombre d'étapes de vente
const amountsToSell = calculateProgressiveSell(totalAmount, sellPercentage, steps);
console.log('Montants à vendre à chaque étape:', amountsToSell);
```

### Stratégie de vente par tranche
```typescript
import { calculateTieredSell } from './tieredSell';

const totalAmount = 1000; // Montant total à vendre
const tieredAmounts = [300, 200, 500]; // Montants à vendre à chaque palier
const amountsToSell = calculateTieredSell(totalAmount, tieredAmounts);
console.log('Montants à vendre à chaque palier:', amountsToSell);
```

### Stratégie de vente à seuil
```typescript
import { calculateThresholdSell } from './thresholdSell';

const totalAmount = 1000; // Montant total à vendre
const thresholdPrice = 150; // Prix seuil pour vendre
const currentPrice = 160; // Prix actuel de la crypto
const amountToSell = calculateThresholdSell(totalAmount, thresholdPrice, currentPrice);
console.log('Montant à vendre:', amountToSell);
```
