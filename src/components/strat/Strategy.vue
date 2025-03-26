<script setup lang="ts">
/**
 * File Path: src/components/strat/Strategy.vue
 * This component is responsible for loading the strategy and balance data,
 * and for providing the filtered strategy table data to the child component.
 */
import { ref, onMounted } from 'vue';
import { useCalculStore } from '../../store/calculStore';
import SearchBar from "../machi/SearchBar.vue";
import StrategyTable from "./StrategyTable.vue";
import { useStrategyData } from '../../composables/useStrategyData';
import {
  setSelectedStrategy,
  setSelectedMaxExposure
} from '../../js/utils/strategyUtils';
import { FilterMatchMode } from 'primevue/api';

// Global filter for the SearchBar component
const filters = ref<{ global: { value: string; matchMode: string } }>({
  global: { value: '', matchMode: FilterMatchMode.CONTAINS }
});

// Retrieve the store and load the data asynchronously
const calculStore = useCalculStore();

// Destructure the computed values from the composable
const { tableData, platforms, strategyLabels, exposures } = useStrategyData();

/**
 * Handler for setting the selected strategy.
 * It passes the updated value along with the base and platform to the utility function.
 */
const handleSetSelectedStrategy = (base: string, platform: string, value: string): void => {
  setSelectedStrategy(calculStore.getStrat, base, platform, value);
};

/**
 * Handler for setting the selected maxExposure.
 * It converts the value to a number if necessary.
 */
const handleSetSelectedMaxExposure = (base: string, platform: string, value: number | string): void => {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  setSelectedMaxExposure(calculStore.getStrat, base, platform, numericValue);
};

/**
 * Async function to load strategy and balance data from the store.
 */
const getStrategyData = async (): Promise<void> => {
  try {
    await calculStore.loadStrat();
    await calculStore.loadBalance();
  } catch (error) {
    console.error("An error occurred while retrieving data:", error);
  }
};

onMounted(async () => {
  await getStrategyData();
});
</script>

<template>
  <div>
    <div class="text-align-left">
      <SearchBar :filters="filters" />
    </div>
    <!-- Wrapper to center the strategy table -->
    <div class="data-table-wrapper">
      <StrategyTable :tableData="tableData" :platforms="platforms" :strategyLabels="strategyLabels"
        :exposures="exposures" :setSelectedStrategy="handleSetSelectedStrategy"
        :setSelectedMaxExposure="handleSetSelectedMaxExposure" :globalFilter="filters.global.value" />
    </div>
  </div>
</template>

<style scoped>
.button {
  background: #007bff;
  color: white;
  padding: 0.3rem 0.7rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

/* Center the SearchBar */
.text-align-left {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

/* Center the table container */
.data-table-wrapper {
  display: flex;
  justify-content: center;
  margin: 0 auto;
}
</style>
