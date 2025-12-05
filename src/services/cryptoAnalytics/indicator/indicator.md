# Documentation des Nouvelles Stratégies de Trading

## Objectifs des Nouvelles Stratégies

1. Ajouter des stratégies simples utilisées en trading.
2. Permettre le calcul des TP (Take Profit) selon ces nouvelles stratégies.
3. Documenter chaque stratégie avec des exemples d'utilisation.

## Stratégies à Ajouter

- **Stratégie de Croisement de Moyennes Mobiles** : Utiliser deux moyennes mobiles pour identifier les tendances.
- **Stratégie de RSI (Relative Strength Index)** : Utiliser l'indice de force relative pour déterminer les conditions de surachat ou de survente.
- **Stratégie de Bandes de Bollinger** : Utiliser les bandes de Bollinger pour identifier les niveaux de prix extrêmes.

## Marche à Suivre

1. **Créer un fichier Markdown** pour documenter les étapes.
2. **Implémenter chaque stratégie** dans le fichier `strategies.ts`.
3. **Tester chaque stratégie** pour s'assurer de leur bon fonctionnement.
4. **Mettre à jour la documentation** avec des exemples et des explications.

## Étapes à Suivre

- [x] Créer le fichier Markdown dans le dossier `src/services/cryptoAnalytics/indicator/`.
- [x] Documenter les objectifs et la marche à suivre.
- [x] Créer le fichier `movingAverageCross.ts` et y ajouter la logique.
- [x] Créer le fichier `rsi.ts` et y ajouter la logique.
- [x] Créer le fichier `bollingerBands.ts` et y ajouter la logique.
- [x] Tester toutes les stratégies.
- [x] Mettre à jour la documentation avec des exemples.

## Exemples d'Utilisation

### Stratégie de Croisement de Moyennes Mobiles

```typescript
import { calculateMovingAverageCross } from './movingAverageCross'

const prices = [1, 2, 1, 3, 2, 4, 3, 5, 4, 6]
const shortPeriod = 3
const longPeriod = 5
const signals = calculateMovingAverageCross(prices, shortPeriod, longPeriod)
```

### Stratégie de RSI

```typescript
import { calculateRSI } from './rsi'

const prices = [1, 2, 1, 3, 2, 4, 3, 5, 4, 6]
const period = 5
const rsiValue = calculateRSI(prices, period)
```

### Stratégie de Bandes de Bollinger

```typescript
import { calculateBollingerBands } from './bollingerBands'

const prices = [1, 2, 1, 3, 2, 4, 3, 5, 4, 6]
const period = 5
const stdDevMultiplier = 2
const bands = calculateBollingerBands(prices, period, stdDevMultiplier)
```
