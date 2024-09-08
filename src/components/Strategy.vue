<!-- src/components/Strategy.vue -->
<template>
  <div>
    <div style="display: flex; justify-content: flex-end">
      <button @click="updateStrat">Sauvegarder</button>
    </div>
    <div style="text-align: left">
      <select v-model="selectedStrategy" @change="updateAllStrats">
        <option value="">Sélectionner une stratégie</option>
        <option v-for="strategy in strategyLabels" :key="strategy" :value="strategy">
          {{ strategy }}
        </option>
      </select>

      <select v-model="selectedMaxExposure" @change="updateAllMaxExposure">
        <option value="">Sélectionner une exposition max</option>
        <option v-for="exposure in exposures" :key="exposure" :value="exposure">
          {{ exposure }}
        </option>
      </select>
    </div>

    <SearchBar :filters="filters" />

    <DataTable :value="tableData" :columns="columns" :paginator="true" :rows="10" scrollable columnResizeMode="fit"
      :filters="filters" showGridlines>
      <Column field="asset" header="Asset" style="text-align: center;" />
      <Column v-for="platform in platforms" :key="platform" :field="platform" :header="platform"
        style="text-align: center;" headerStyle="text-align: center;">
        <template #body="slotProps">
          <div style="display: flex; flex-direction: row; align-items: center;">
            <select :value="slotProps.data[platform].strategy"
              @input="setSelectedStrategy(strat, slotProps.data.asset, platform, $event.target.value)"
              :disabled="slotProps.data[platform].disabled" style="margin-right: 5px;">
              <option value=""></option>
              <option v-for="strategy in strategyLabels" :key="strategy" :value="strategy">
                {{ strategy }}
              </option>
            </select>

            <select :value="slotProps.data[platform].maxExposure"
              @input="setSelectedMaxExposure(strat, slotProps.data.asset, platform, $event.target.value)"
              :disabled="slotProps.data[platform].disabled" style="margin-left:  5px;">
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
import { successSpin, errorSpin } from '../js/spinner.js';
import { strategies } from '../js/strategies.js';
import { useCalculStore } from '../store/calcul.js';
import { FilterMatchMode } from 'primevue/api'
import SearchBar from "./shad/SearchBar.vue";
import { getSelectedStrategy, setSelectedStrategy, isDisabled, getSelectedMaxExposure, setSelectedMaxExposure } from '../js/utils/strategyUtils.js';

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
        disabled: isDisabled(balance, asset, platform)
      };
    });
    return row;
  });
});

/**
 * @returns {Promise<void>}
 */
const updateStrat = async () => {
  const stratMap = tableData.value.map(row => {
    const strategies = {};
    const maxExposure = {};

    platforms.value.forEach(platform => {
      if (!row[platform].disabled) {
        strategies[platform] = row[platform].strategy;
        maxExposure[platform] = row[platform].maxExposure;
      }
    });

    return {
      asset: row.asset,
      strategies: strategies,
      maxExposure: maxExposure
    };
  });

  try {
    const response = await fetch(`${serverHost}/strategy/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stratMap)
    });

    await response.json();

    successSpin('Sauvegarde terminée', `Strat : ${stratMap.length}`, true, true);
  } catch (err) {
    console.error(err);
    errorSpin('Erreur', `${err}`, false, true);
  }
};

/**
 * @returns {void}
 */
const updateAllStrats = () => {
  const selectedStrategyValue = selectedStrategy.value;

  strat.value.forEach((item) => {
    const asset = item.asset;
    const strategies = item.strategies || {};

    platforms.value.forEach((platform) => {
      if (!isDisabled(balance, asset, platform)) {
        strategies[platform] = selectedStrategyValue;
      }
    });

    item.strategies = strategies;
  });
};

/**
 * @returns {void}
 */
const updateAllMaxExposure = () => {
  const selectedMaxExposureValue = selectedMaxExposure.value;

  strat.value.forEach((item) => {
    const asset = item.asset;
    const maxExposure = item.maxExposure || {};

    platforms.value.forEach((platform) => {
      if (!isDisabled(balance, asset, platform)) {
        maxExposure[platform] = selectedMaxExposureValue;
      }
    });

    item.maxExposure = maxExposure;
  });
};

onMounted(async () => {
  try {
    await calculStore.fetchBalances();
    await calculStore.fetchStrats();
    console.log("Données Strats récupérées:", strat.value);
    console.log("Données Balances récupérées:", balance.value);
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error);
  }
});
</script>
