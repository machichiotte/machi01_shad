<!-- src/components/Strategy.vue -->
<template>
    <div>
        <div style="display:flex; justify-content:flex-end;">
            <button @click="updateStrat">Sauvegarder</button>
        </div>

        <div>
            <select v-model="selectedStrategy" @change="updateAllStrats">
                <option value="">Sélectionner une stratégie</option>
                <option value="strategy1">Shad</option>
                <option value="strategy2">Shad skip x2</option>
                <option value="strategy3">Strategy 3</option>
            </select>
        </div>

        <table ref="stratTable">
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
                        <select :value="getStratValue(asset, platform)"
                            @input="setStratValue(asset, platform, $event.target.value)"
                            :disabled="isDisabled(asset, platform)">
                            <option value=""></option>
                            <option value="strategy1">Shad</option>
                            <option value="strategy2">Shad skip x2</option>
                            <option value="strategy3">Strategy 3</option>
                        </select>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
  
<script setup>
// Importing necessary modules and functions
import { ref, onMounted } from 'vue';

import { getBalances, getStrategy } from '../js/getter.js';
import { successSpin, errorSpin } from '../js/spinner.js';
import { saveStrategyToIndexedDB } from '../js/indexedDB';

// Define server host
const serverHost = import.meta.env.VITE_SERVER_HOST;

// Define reactive data
const balance = ref([]);
const platforms = ref([]);
const assets = ref([]);
const strat = ref([]);
const stratMap = ref([]);
const selectedStrategy = ref("");

// Define methods
async function getData() {
  try {
    balance.value = await getBalances();
    platforms.value = [...new Set(balance.value.map(item => item.platform))].sort();
    assets.value = [...new Set(balance.value.map(item => item.symbol))].sort();
  } catch (err) {
    console.error(err);
  }
}

async function getStrat() {
  try {
    const data = await getStrategy();
    console.log('data', data);
    if (data.length === 0) {
      assets.value.forEach((asset) => {
        let assetStrat = {
          symbol: asset,
          strategies: {},
        };
        platforms.value.forEach((platform) => {
          assetStrat.strategies[platform] = "";
        });
        strat.value.push(assetStrat);
      });
    } else {
      strat.value = data;
    }
  } catch (err) {
    console.error(err);
  }
}

async function updateStrat() {
  stratMap.value = [];
  try {
    const rows = document.querySelectorAll('tbody tr');

    rows.forEach((row) => {
      let asset = "";
      let strategies = {};

      const cells = row.querySelectorAll('td');

      cells.forEach((cell, index) => {
        if (index === 0) {
          asset = cell.textContent;
        } else {
          const colName = platforms.value[index - 1];
          const selectEl = cell.querySelector('select');
          strategies[colName] = selectEl.value;
        }
      });
      let rowData = {
        asset: asset,
        strategies: strategies,
      };
      stratMap.value.push(rowData);
    });

    // Make the API call
    const response = await fetch(`${serverHost}/strategy/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stratMap.value),
    });

    // Get the API call result
    const data = await response.json();

    // Save data to IndexedDB
    await saveStrategyToIndexedDB(data);

    successSpin('Save completed', `Strat : ${stratMap.value.length}`, true, true);

  } catch (err) {
    console.error(err);
    // Show an error alert within the existing alert
    errorSpin('Error', `${err}`, false, true);
  }
}

async function updateAllStrats() {
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
}

function getStratValue(asset, platform) {
  const item = strat.value.find((item) => item.asset === asset);
  return item ? item.strategies[platform] || '' : '';
}

function setStratValue(asset, platform, value) {
  const item = strat.value.find((item) => item.asset === asset);
  if (item) {
    item.strategies[platform] = value;
  }
}

function isDisabled(asset, platform) {
  const assetsFiltered = balance.value.filter(item => item.symbol === asset);
  const platformsFiltered = assetsFiltered.map(item => item.platform);
  return !platformsFiltered.includes(platform);
}

// Fetch data on component mount
onMounted(async () => {
  await getData();
  await getStrat();
});
</script>