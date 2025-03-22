<!-- src/components/strat/Strategy.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { successSpin, errorSpin } from '../../js/utils/spinner';
import { strategies } from '../../js/strat/index';
import { useCalculStore } from '../../store/calculStore';
import { FilterMatchMode } from 'primevue/api'
import SearchBar from "../machi/SearchBar.vue";
import StrategyTable from "./StrategyTable.vue";
import { getSelectedStrategy, setSelectedStrategy, isVisible, getSelectedMaxExposure, setSelectedMaxExposure } from '../../js/utils/strategyUtils';

const serverHost = import.meta.env.VITE_SERVER_HOST;

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const calculStore = useCalculStore();

const selectedStrategy = ref('');
const selectedMaxExposure = ref('');

const strategiesList = ref(strategies);
const exposures = ref([5, 10, 15, 20, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 750, 800, 900, 1000]);
const strategyLabels = computed(() => strategiesList.value.map(strategy => strategy.label));

const balance = computed(() => calculStore.getBalance);

const strat = computed(() => calculStore.getStrat);

const platforms = computed(() => [...new Set(balance.value.map((item) => item.platform))].sort());
const bases = computed(() => [...new Set(balance.value.map((item) => item.base))].sort());
const columns = computed(() => {
  return [
    { field: 'base', header: 'Base' },
    ...platforms.value.map(platform => ({ field: platform, header: platform }))
  ];
});

const tableData = computed(() => {
  if (!bases.value.length) {
    console.error('Aucune base trouvée');
    return [];
  }

  return bases.value.map(base => {

    const row = { base };

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

const getStrategyData = async () => {
  try {
    await calculStore.loadStrat();
    await calculStore.loadBalance();
  } catch (error) {
    console.error("An error occurred while retrieving data:", error);
  }
};

async function updateAllStrats() {
  successSpin('Saving strategies...');
  try {
    await updateStrategies(strat.value)
    successSpin('Strategies saved successfully!');
  } catch (error) {
    errorSpin('Error saving strategies: ', error.message);
  }
}

async function updateAllMaxExposure() {
  successSpin('Updating max exposure...');
  try {
    await updateMaxExposure(strat.value)
    successSpin('Max exposure updated successfully!');
  } catch (error) {
    errorSpin('Error updating max exposure: ', error.message);
  }
}

onMounted(async () => {
  await getStrategyData();
});
</script>

<template>
  <div>


    <div class="text-align-left">
      <SearchBar :filters="filters" />

      <select v-model="selectedStrategy" @change="updateAllStrats">
        <option value="">Select a strategy</option>
        <option v-for="strategy in strategyLabels" :key="strategy" :value="strategy">
          {{ strategy }}
        </option>
      </select>

      <select v-model="selectedMaxExposure" @change="updateAllMaxExposure">
        <option value="">Select max exposure</option>
        <option v-for="exposure in exposures" :key="exposure" :value="exposure">
          {{ exposure }}
        </option>
      </select>

      <button @click="updateStrat">Save</button>
    </div>


    <!-- Wrap the table in a div to apply the centering -->
    <div class="data-table-wrapper">
      <StrategyTable :tableData="tableData" :platforms="platforms" :strategyLabels="strategyLabels"
        :exposures="exposures" :setSelectedStrategy="setSelectedStrategy"
        :setSelectedMaxExposure="setSelectedMaxExposure" :globalFilter="filters.global.value" />
    </div>
  </div>

</template>

<style scoped>
.p-datatable {
  max-width: 100%;
  width: 90%;
  overflow-x: auto;
  background-color: #333;
  border: 1px solid #222;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  color: #ccc;
}

.p-datatable thead {
  background-color: #333;
  color: #ccc;
}

.p-datatable tbody tr {
  border-bottom: 1px solid #222;
  color: #ccc;
}

.p-datatable tbody tr:last-child {
  border-bottom: none;
}

button {
  background: #007bff;
  color: white;
  padding: 0.3rem 0.7rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.text-align-left {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.select-container {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.centered-column {
  text-align: center;
}

.data-table-wrapper {
  display: flex;
  justify-content: center;
  margin: 0 auto;
}
</style>