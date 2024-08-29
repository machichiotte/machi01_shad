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
// Importing necessary modules and functions
import { ref, onMounted, computed } from 'vue'

import { successSpin, errorSpin } from '../js/spinner.js'
import { saveStrategyToIndexedDB } from '../js/indexedDB'
import { FETCH_STRATS, FETCH_BALANCES, GET_BALANCES, GET_STRATS } from '@/store/storeconstants.js';
import { strategies } from '../js/strategies.js';

import { useStore } from 'vuex'
const store = useStore()

// Define server host
const serverHost = import.meta.env.VITE_SERVER_HOST

// Define reactive data
const balance = ref([])
const platforms = ref([])
const assets = ref([])
const strat = ref([])
const stratMap = ref([])
const selectedStrategy = ref('')
const selectedMaxExposure = ref('')

const strategiesList = ref(strategies);

const exposures = ref([5, 10, 15, 20, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 750, 800, 900, 1000])

const strategyLabels = computed(() => strategiesList.value.map(strategy => strategy.label));

// Define methods
async function getData() {
  try {
    await store.dispatch('calcul/' + FETCH_BALANCES)

    balance.value = store.getters['calcul/' + GET_BALANCES]
    platforms.value = [...new Set(balance.value.map((item) => item.platform))].sort()
    assets.value = [...new Set(balance.value.map((item) => item.base))].sort()
  } catch (err) {
    console.error(err)
  }
}

async function getStrat() {
  try {
    await store.dispatch('calcul/' + FETCH_STRATS)
    const data = store.getters['calcul/' + GET_STRATS];
    if (data.length === 0) {
      assets.value.forEach((asset) => {
        let assetStrat = {
          symbol: asset,
          strategies: {},
          maxExposure: {}
        }
        console.log(`🚀 ~ file: Strategy.vue:118 ~ assets.value.forEach ~ assetStrat:`, assetStrat)
        platforms.value.forEach((platform) => {
          assetStrat.strategies[platform] = ''
          assetStrat.maxExposure[platform] = ''
        })

        strat.value.push(assetStrat)
      })
    } else {
      strat.value = data
    }
  } catch (err) {
    console.error(err)
  }
}

async function updateStrat() {
  stratMap.value = []
  try {
    const rows = document.querySelectorAll('tbody tr')

    rows.forEach(async (row) => {
      const asset = row.querySelectorAll('td')[0].textContent
      const strategies = {}
      const maxExposure = {}

      row.querySelectorAll('select').forEach((sel, idx) => {
        const colName = platforms.value[Math.floor(idx / 2)]

        const dataType = sel.dataset.type
        const selectedOption = sel.selectedOptions[0]

        if (selectedOption && selectedOption.value) {
          switch (dataType) {
            case 'strategy':
              strategies[colName] = selectedOption.value
              break
            case 'maxExposure':
              maxExposure[colName] = selectedOption.value
              break
            default:
              console.log('updateStrat no dataType')
              break
          }
        }
      })

      const rowData = {
        asset: asset,
        strategies: strategies,
        maxExposure: maxExposure
      }

      stratMap.value.push(rowData)
    })

    const response = await fetch(`${serverHost}/strategy/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stratMap.value)
    })

    const data = await response.json()
    await saveStrategyToIndexedDB(data)

    successSpin('Save completed', `Strat : ${stratMap.value.length}`, true, true)
  } catch (err) {
    console.error(err)
    errorSpin('Error', `${err}`, false, true)
  }
}

async function updateAllStrats() {
  const selectedStrategyValue = selectedStrategy.value

  strat.value.forEach((item) => {
    const asset = item.asset
    const strategies = item.strategies || {}

    platforms.value.forEach((platform) => {
      if (!isDisabled(asset, platform)) {
        strategies[platform] = selectedStrategyValue
      }
    })

    item.strategies = strategies
  })
}

async function updateAllMaxExposure() {
  const selectedMaxExposureValue = selectedMaxExposure.value

  strat.value.forEach((item) => {
    const asset = item.asset
    const maxExposure = item.maxExposure || {}

    platforms.value.forEach((platform) => {
      if (!isDisabled(asset, platform)) {
        maxExposure[platform] = selectedMaxExposureValue
      }
    })

    item.maxExposure = maxExposure
  })
}

function getSelectedStrategy(asset, platform) {
  const item = strat.value.find((item) => item.asset === asset)
  return item ? item.strategies[platform] || '' : ''
}

function setSelectedStrategy(asset, platform, value) {
  const item = strat.value.find((item) => item.asset === asset)
  if (item) {
    item.strategies[platform] = value
  }
}

function isDisabled(asset, platform) {
  const assetsFiltered = balance.value.filter((item) => item.base === asset)
  const platformsFiltered = assetsFiltered.map((item) => item.platform)
  return !platformsFiltered.includes(platform)
}

function getSelectedMaxExposure(asset, platform) {
  const item = strat.value.find((item) => item.asset === asset)
  return item ? item.maxExposure[platform] || '' : ''
}

function setSelectedMaxExposure(asset, platform, value) {
  const item = strat.value.find((item) => item.asset === asset)
  if (item) {
    item.maxExposure[platform] = value
  }
}

// Fetch data on component mount
onMounted(async () => {
  await getData()
  await getStrat()
})
</script>