/**
 * File Path: src/composables/useStrategyData.ts
 * This composable encapsulates the logic for computing the strategy table data.
 * It extracts the available platforms, bases, and constructs the rows to be displayed.
 */
import { ref, computed } from 'vue';
import { strategies } from '../strat/index';
import { useCalculStore } from '../store/calculStore';
import { getSelectedStrategy, getSelectedMaxExposure, isVisible } from '../utils/strategyUtils';

// Interface declarations for better type-checking
interface Strategy {
    label: string;
}

interface BalanceItem {
    platform: string;
    base: string;
}

interface TableRow {
    base: string;
    // Dynamic keys for each platform
    [platform: string]: any;
}

export function useStrategyData() {
    const calculStore = useCalculStore();

    // List of available strategies from the imported module
    const strategiesList = ref<Strategy[]>(strategies);

    // Exposure values list, can be adjusted as needed
    const exposures = ref<(number | string)[]>([
        5, 10, 15, 20, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 750, 800, 900, 1000
    ]);

    // Extract strategy labels for dropdowns
    const strategyLabels = computed<string[]>(() => strategiesList.value.map(strategy => strategy.label));

    // Retrieve balance and strategy state from the store
    const balance = computed<BalanceItem[]>(() => calculStore.getBalance);
    const strat = computed<any>(() => calculStore.getStrat);

    // Extract unique platforms and bases from the balance data
    const platforms = computed<string[]>(() => {
        return [...new Set(balance.value.map(item => item.platform))].sort();
    });

    const bases = computed<string[]>(() => {
        return [...new Set(balance.value.map(item => item.base))].sort();
    });

    // Build table rows using bases as rows and platforms as dynamic columns
    const tableData = computed<TableRow[]>(() => {
        if (!bases.value.length) {
            console.error('No bases found');
            return [];
        }
        return bases.value.map(base => {
            const row: TableRow = { base };
            platforms.value.forEach(platform => {
                row[platform] = {
                    strategy: getSelectedStrategy(strat.value, base, platform),
                    maxExposure: getSelectedMaxExposure(strat.value, base, platform),
                    isVisible: isVisible(strat.value, base, platform)
                };
            });
            return row;
        });
    });

    return { tableData, platforms, strategyLabels, exposures };
}
