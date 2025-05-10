<!-- src/components/strat/StrategyTable.vue -->
<script setup lang="ts">
import { computed } from 'vue';

// Define the structure for a platform cell in the table
interface PlatformData {
    strategy: string;
    maxExposure: number | string;
    isVisible: boolean;
}

// Define the structure for a table row (each row corresponds to a base)
interface TableRow {
    base: string;
    // Dynamic keys for each platform holding PlatformData
    [platform: string]: PlatformData | string;
}

// Declare component props
const props = defineProps<{
    tableData: TableRow[];
    platforms: string[];
    strategyLabels: string[];
    exposures: Array<number | string>;
    setSelectedStrategy: (base: string, platform: string, value: string) => void;
    setSelectedMaxExposure: (base: string, platform: string, value: number | string) => void;
    globalFilter?: string;
}>();

// Filter the table rows based on the global filter value
const filteredTableData = computed(() => {
    if (!props.globalFilter || props.globalFilter.trim() === '') {
        return props.tableData;
    }
    const filterText = props.globalFilter.toLowerCase();
    return props.tableData.filter(row => {
        // Filter on the 'base' field
        if (row.base.toLowerCase().includes(filterText)) {
            return true;
        }
        // Also filter on the values of each platform (strategy and maxExposure)
        return props.platforms.some(platform => {
            const cell = row[platform] as PlatformData;
            if (cell && cell.isVisible) {
                return cell.strategy.toLowerCase().includes(filterText) ||
                    String(cell.maxExposure).toLowerCase().includes(filterText);
            }
            return false;
        });
    });
});

/**
 * Event handler for when the strategy dropdown changes.
 */
const onStrategyChange = (base: string, platform: string, event: Event) => {
    const target = event.target as HTMLSelectElement | null;
    if (target) {
        props.setSelectedStrategy(base, platform, target.value);
    }
};

/**
 * Event handler for when the maxExposure dropdown changes.
 */
const onMaxExposureChange = (base: string, platform: string, event: Event) => {
    const target = event.target as HTMLSelectElement | null;
    if (target) {
        props.setSelectedMaxExposure(base, platform, target.value);
    }
};
</script>

<template>
    <!-- Container for the strategy table -->
    <div class="table-container">
        <table class="table">
            <thead>
                <tr>
                    <th>Base</th>
                    <!-- Dynamic creation of columns for each platform -->
                    <th v-for="platform in props.platforms" :key="platform">{{ platform }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in filteredTableData" :key="rowIndex">
                    <td>{{ row.base }}</td>
                    <td v-for="platform in props.platforms" :key="platform">
                        <!-- If the cell is visible, display dropdowns -->
                        <div v-if="(row[platform] as PlatformData)?.isVisible">
                            <!-- Dropdown for strategy selection -->
                            <select :value="(row[platform] as PlatformData).strategy"
                                @change="(e) => onStrategyChange(row.base, platform, e)">
                                <option value=""></option>
                                <option v-for="strategy in props.strategyLabels" :key="strategy" :value="strategy">
                                    {{ strategy }}
                                </option>
                            </select>
                            <!-- Dropdown for maxExposure selection -->
                            <select :value="(row[platform] as PlatformData).maxExposure"
                                @change="(e) => onMaxExposureChange(row.base, platform, e)">
                                <option value=""></option>
                                <option v-for="exposure in props.exposures" :key="exposure" :value="exposure">
                                    {{ exposure }}
                                </option>
                            </select>
                        </div>
                        <!-- Otherwise, display an indicator -->
                        <div v-else>
                            -
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
/* Fixed width for the first column (base) */
.table th:first-child,
.table td:first-child {
    width: 100px;
}

/* Fixed width for platform columns */
.table th:not(:first-child),
.table td:not(:first-child) {
    width: 200px;
}
</style>
