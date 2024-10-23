// src/utils/processorUtil.ts
import { STABLECOINS } from '@src/constants'
import { MappedTrade } from '@typ/trade'
import { MappedTicker } from '@typ/ticker'
import { MappedBalance, BalanceWithDifference } from '@typ/balance'
import { MappedCmc } from '@typ/cmc'
import { MappedStrat } from '@typ/strat'
import { AssetMetrics } from '@typ/metrics'
import { MappedOrder } from '@typ/order'

function removeDuplicateDifferences(differences: BalanceWithDifference[]): BalanceWithDifference[] {
    const uniqueMap = new Map<string, BalanceWithDifference>()
    differences.forEach((v) => {
        const key = `${v.base}-${v.platform}`
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, v)
        }
    })
    return Array.from(uniqueMap.values())
}

function logDifferenceType(difference: BalanceWithDifference): void {
    if (difference.newSymbol) {
        console.log(`New symbol detected: ${difference.base}`)
    }

    if (difference.balanceDifference) {
        console.log(`Balance difference detected for symbol: ${difference.base}`)
    }

    if (difference.zeroBalance) {
        console.log(`Zero balance symbol detected: ${difference.base}`)
    }
}

function areAllDataValid(
    dbCmc: MappedCmc[],
    dbStrategies: MappedStrat[],
    dbTrades: MappedTrade[],
    dbOpenOrders: MappedOrder[],
    dbTickers: MappedTicker[],
    dbBalances: MappedBalance[]
): boolean {
    const invalidData: string[] = []
    if (!dbCmc) invalidData.push('CMC')
    if (!dbStrategies) invalidData.push('Strategies')
    if (!dbTrades) invalidData.push('Trades')
    if (!dbOpenOrders) invalidData.push('Open Orders')
    if (!dbTickers) invalidData.push('Tickers')
    if (!dbBalances) invalidData.push('Balances')

    if (invalidData.length > 0) {
        console.error(
            `Erreur : Les fonctions de récupération de données suivantes ont renvoyé des données invalides : ${invalidData.join(', ')}`
        )
        return false
    }
    return true
}

function isValidAssetMetrics(values: AssetMetrics | null): values is AssetMetrics {
    return values !== null && typeof values.rank === 'number' && values.rank > 0 && !!values.currentPossession
}

function removeDuplicatesAndStablecoins(differences: BalanceWithDifference[]): BalanceWithDifference[] {
    // Utiliser un Map pour supprimer les doublons
    const uniqueDifferences = new Map<string, BalanceWithDifference>()

    differences.forEach((difference) => {
        const key = `${difference.base}-${difference.platform}` // Créez une clé unique en combinant 'base' et 'platform'

        // Vérifiez que 'base' n'est pas un stablecoin et ajoutez-le au Map s'il n'est pas encore présent
        if (!STABLECOINS.includes(difference.base) && !uniqueDifferences.has(key)) {
            uniqueDifferences.set(key, difference)
        }
    })

    // Convertissez le Map en tableau
    return Array.from(uniqueDifferences.values())
}

export { removeDuplicateDifferences, logDifferenceType, areAllDataValid, isValidAssetMetrics, removeDuplicatesAndStablecoins }

