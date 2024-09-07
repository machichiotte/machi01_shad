<!-- src/components/Strategy.vue -->
<template>
  <div>
    <div style="display: flex; justify-content: flex-end">
      <button @click="updateStrat">Sauvegarder</button>
    </div>

    <div>
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

    <table>
      <thead>
        <tr>
          <th>Asset</th>
          <th v-for="platform in platforms" :key="platform">{{ platform }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(asset, assetIndex) in assets" :key="assetIndex">
          <td>{{ asset }}</td>

          <td v-for="(platform, platformIndex) in platforms" :key="platformIndex">
            <select data-type="strategy" :value="getSelectedStrategy(asset, platform)"
              @input="setSelectedStrategy(asset, platform, $event.target.value)"
              :disabled="isDisabled(asset, platform)">
              <option value=""></option>
              <option v-for="strategy in strategyLabels" :key="strategy" :value="strategy">
                {{ strategy }}
              </option>
            </select>

            <select data-type="maxExposure" :value="getSelectedMaxExposure(asset, platform)"
              @input="setSelectedMaxExposure(asset, platform, $event.target.value)"
              :disabled="isDisabled(asset, platform)">
              <option value=""></option>
              <option v-for="exposure in exposures" :key="exposure" :value="exposure">
                {{ exposure }}
              </option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { successSpin, errorSpin } from '../js/spinner.js';
import { strategies } from '../js/strategies.js';
import { useCalculStore } from '../store/calcul.js';

const calculStore = useCalculStore();

const selectedStrategy = ref('');
const selectedMaxExposure = ref('');

const strategiesList = ref(strategies);
const exposures = ref([5, 10, 15, 20, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 750, 800, 900, 1000]);
const strategyLabels = computed(() => strategiesList.value.map(strategy => strategy.label));

// Utiliser computed pour obtenir les données du store
const balance = computed(() => calculStore.getBalances);
const strat = computed(() => calculStore.getStrats);
const platforms = computed(() => [...new Set(balance.value.map((item) => item.platform))].sort());
const assets = computed(() => [...new Set(balance.value.map((item) => item.base))].sort());

const updateStrat = async () => {
  const stratMap = [];

  try {
    const rows = document.querySelectorAll('tbody tr');

    rows.forEach((row) => {
      const asset = row.querySelectorAll('td')[0].textContent;
      const strategies = {};
      const maxExposure = {};

      row.querySelectorAll('select').forEach((sel, idx) => {
        const colName = platforms.value[Math.floor(idx / 2)];
        const dataType = sel.dataset.type;
        const selectedOption = sel.selectedOptions[0];

        if (selectedOption && selectedOption.value) {
          switch (dataType) {
            case 'strategy':
              strategies[colName] = selectedOption.value;
              break;
            case 'maxExposure':
              maxExposure[colName] = selectedOption.value;
              break;
            default:
              console.log('updateStrat no dataType');
              break;
          }
        }
      });

      const rowData = {
        asset: asset,
        strategies: strategies,
        maxExposure: maxExposure
      };

      stratMap.push(rowData);
    });

    const response = await fetch(`${serverHost}/strategy/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stratMap)
    });

    const data = await response.json();

    successSpin('Save completed', `Strat : ${stratMap.length}`, true, true);
  } catch (err) {
    console.error(err);
    errorSpin('Error', `${err}`, false, true);
  }
};

const updateAllStrats = () => {
  const selectedStrategyValue = selectedStrategy.value;

  strat.value.forEach((item) => {
    const asset = item.asset;
    const strategies = item.strategies || {};

    platforms.value.forEach((platform) => {
      if (!isDisabled(asset, platform)) {
        strategies[platform] = selectedStrategyValue;
      }
    });

    item.strategies = strategies;
  });
};

const updateAllMaxExposure = () => {
  const selectedMaxExposureValue = selectedMaxExposure.value;

  strat.value.forEach((item) => {
    const asset = item.asset;
    const maxExposure = item.maxExposure || {};

    platforms.value.forEach((platform) => {
      if (!isDisabled(asset, platform)) {
        maxExposure[platform] = selectedMaxExposureValue;
      }
    });

    item.maxExposure = maxExposure;
  });
};

function getSelectedStrategy(asset, platform) {
  const item = strat.value.find((item) => item.asset === asset);
  return item ? item.strategies[platform] || '' : '';
}

function setSelectedStrategy(asset, platform, value) {
  const item = strat.value.find((item) => item.asset === asset);
  if (item) {
    item.strategies[platform] = value;
  }
}

function isDisabled(asset, platform) {
  const assetsFiltered = balance.value.filter((item) => item.base === asset);
  const platformsFiltered = assetsFiltered.map((item) => item.platform);
  return !platformsFiltered.includes(platform);
}

function getSelectedMaxExposure(asset, platform) {
  const item = strat.value.find((item) => item.asset === asset);
  return item ? item.maxExposure[platform] || '' : '';
}

function setSelectedMaxExposure(asset, platform, value) {
  const item = strat.value.find((item) => item.asset === asset);
  if (item) {
    item.maxExposure[platform] = value;
  }
}

// Récupérer les données à l'initialisation du composant
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
