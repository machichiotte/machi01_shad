// src/utils/processorUtil.ts
import { MappedBalance, BalanceWithDifference } from '@typ/balance';
import { MappedTrade } from '@typ/trade';
import { MappedTicker } from '@typ/ticker';
import { MappedCmc } from '@typ/cmc';
import { MappedStrat } from '@typ/strat';
import { MappedOrder } from '@typ/order';
import { Asset } from '@typ/cryptoAnalytics';
import { logger } from '@utils/loggerUtil';

const myUtil = 'ProcessorUtil';



// Cette fonction est spécifiquement pour logger, donc on utilise logger.debug
function logDifferenceType(difference: BalanceWithDifference): void {
    const operation = 'logDifferenceType';
    const context = { module: myUtil, operation, platform: difference.platform, base: difference.base };

    if (difference.newSymbol) {
        logger.debug('New symbol detected.', context);
    }

    if (difference.balanceDifference) {
        logger.debug('Balance difference detected.', { ...context, diffValue: difference.balanceDifference });
    }

    if (difference.zeroBalance) {
        logger.debug('Zero balance symbol detected.', context);
    }
}

function areAllDataValid(
    dbCmc: MappedCmc[] | null | undefined, // Permettre null/undefined pour la vérification
    dbStrategies: MappedStrat[] | null | undefined,
    dbTrades: MappedTrade[] | null | undefined,
    dbOpenOrders: MappedOrder[] | null | undefined,
    dbTickers: MappedTicker[] | null | undefined,
    dbBalances: MappedBalance[] | null | undefined
): boolean {
    const operation = 'areAllDataValid';
    const invalidData: string[] = [];
    // Vérifier si les données sont null, undefined ou potentiellement des tableaux vides si cela est considéré invalide
    // Ici, on vérifie juste la présence (non null/undefined)
    if (!dbCmc) invalidData.push('CMC');
    if (!dbStrategies) invalidData.push('Strategies');
    if (!dbTrades) invalidData.push('Trades');
    if (!dbOpenOrders) invalidData.push('Open Orders');
    if (!dbTickers) invalidData.push('Tickers');
    if (!dbBalances) invalidData.push('Balances');

    if (invalidData.length > 0) {
        logger.error('Invalid data detected during validation check.', {
            module: myUtil,
            operation,
            invalidDataSources: invalidData // Utiliser une clé structurée
        });
        return false;
    }
    // Optionnel: log de succès en debug
    // logger.debug('All required data sources appear valid.', { module, operation });
    return true;
}

function isValidAssetMetrics(asset: Asset | null): boolean {
    // Vérification plus robuste pour la possession
    const currentPossession = asset?.liveData?.currentPossession;
    return (
        asset !== null &&
        typeof asset.cmc?.rank === 'number' &&
        asset.cmc.rank > 0 &&
        typeof currentPossession === 'number' && // Vérifier que c'est un nombre
        currentPossession > 0
    );
}

function removeDuplicates(differences: BalanceWithDifference[]): BalanceWithDifference[] {
    const uniqueDifferences = new Map<string, BalanceWithDifference>();
    differences.forEach((difference) => {
        const key = `${difference.base}-${difference.platform}`;
        if (!uniqueDifferences.has(key)) {
            uniqueDifferences.set(key, difference);
        }
    });
    return Array.from(uniqueDifferences.values());
}

export { logDifferenceType, areAllDataValid, isValidAssetMetrics, removeDuplicates };