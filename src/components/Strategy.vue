<!-- src/components/Strategy.vue -->
<template>
  <div>
    <div class="button-container">
      <button @click="updateStrat">Save</button>
    </div>
    <div class="text-align-left">
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
    </div>

    <SearchBar :filters="filters" />

    <DataTable :value="tableData" :columns="columns" :paginator="true" :rows="10" scrollable columnResizeMode="fit"
      :filters="filters" showGridlines>
      <Column field="asset" header="Asset" class="centered-column" />
      <Column v-for="platform in platforms" :key="platform" :field="platform" :header="platform"
        class="centered-column">
        <template #body="slotProps">
          <div class="select-container">
            <select :value="slotProps.data[platform].strategy"
              @input="setSelectedStrategy(strat, slotProps.data.asset, platform, $event.target.value)"
              :disabled="slotProps.data[platform].disabled">
              <option value=""></option>
              <option v-for="strategy in strategyLabels" :key="strategy" :value="strategy">
                {{ strategy }}
              </option>
            </select>

            <select :value="slotProps.data[platform].maxExposure"
              @input="setSelectedMaxExposure(strat, slotProps.data.asset, platform, $event.target.value)"
              :disabled="slotProps.data[platform].disabled">
              <option value=""></option>
              <option v-for="exposure in exposures" :key="exposure" :value="exposure">
                {{ exposure }}
              </option>
            </select>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { successSpin, errorSpin } from '../js/utils/spinner';
import { strategies } from '../js/strat/index';
import { useCalculStore } from '../store/calculStore';
import { FilterMatchMode } from 'primevue/api'
import SearchBar from "./machi/SearchBar.vue";
import { getSelectedStrategy, setSelectedStrategy, isDisabled, getSelectedMaxExposure, setSelectedMaxExposure } from '../js/utils/strategyUtils';

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

const balance = computed(() => calculStore.getBalances);
const strat = computed(() => calculStore.getStrats);
const platforms = computed(() => [...new Set(balance.value.map((item) => item.platform))].sort());
const assets = computed(() => [...new Set(balance.value.map((item) => item.base))].sort());

const columns = computed(() => {
  return [
    { field: 'asset', header: 'Asset' },
    ...platforms.value.map(platform => ({ field: platform, header: platform }))
  ];
});

const tableData = computed(() => {
  return assets.value.map(asset => {
    const row = { asset };
    platforms.value.forEach(platform => {
      row[platform] = {
        strategy: getSelectedStrategy(strat, asset, platform),
        maxExposure: getSelectedMaxExposure(strat, asset, platform),
        disabled: isDisabled(strat, asset, platform)
      };
    });
    return row;
  });
});

async function updateAllStrats() {
  successSpin('Saving strategies...');
  try {
    await fetch(`${serverHost}/strategy/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ strategies: strat.value }),
    });
    successSpin('Strategies saved successfully!');
  } catch (error) {
    errorSpin('Error saving strategies: ', error.message);
  }
}

async function updateAllMaxExposure() {
  successSpin('Updating max exposure...');
  try {
    //TODO faire modif ici
    await fetch(`${serverHost}/api/updateMaxExposure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ maxExposure: strat.value }),
    });
    successSpin('Max exposure updated successfully!');
  } catch (error) {
    errorSpin('Error updating max exposure: ', error.message);
  }
}
</script>

<style scoped>
.button-container {
  margin: 20px 0;
}

.text-align-left {
  display: flex;
  justify-content: space-between;
}

.select-container {
  display: flex;
  justify-content: space-between;
}

.centered-column {
  text-align: center;
}
</style>
