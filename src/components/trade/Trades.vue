<!-- src/components/trades/Trades.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useCalculStore } from '../../store/calculStore'
import SearchBar from '../machi/SearchBar.vue'
import TradesTable from './TradesTable.vue'
import { Trade, TradeTransformed } from '../../types/responseData'

// Définition des filtres globaux
const filters = ref<{ global: { value: string; matchMode: typeof FilterMatchMode[keyof typeof FilterMatchMode] } }>({
  global: { value: '', matchMode: FilterMatchMode.CONTAINS }
})

// Référence pour la balance réelle saisie par l'utilisateur
const realBalance = ref<number | null>(null)

// Récupération du store
const calculStore = useCalculStore()

// Récupération des trades depuis le store
const trades = computed<Trade[]>(() => calculStore.getTrade)

// Transformation, filtrage et tri des trades
const filteredTrades = computed<TradeTransformed[]>(() => {
  return trades.value
    .filter(item => {
      const searchValue = filters.value.global.value.toLowerCase() || ''
      return item.pair.toLowerCase().startsWith(searchValue) ||
        item.base.toLowerCase().startsWith(searchValue) ||
        item.quote.toLowerCase().startsWith(searchValue) ||
        item.platform.toLowerCase().startsWith(searchValue)
    })
    .map((item: Trade) => {
      let date: string
      let timestampVal = 0
      if (item.timestamp) {
        // Si le timestamp est en secondes, le convertir en millisecondes
        timestampVal =
          item.timestamp.toString().length <= 10 ? item.timestamp * 1000 : item.timestamp
        const formattedDate = new Date(timestampVal)
        const year = formattedDate.getFullYear()
        const month = String(formattedDate.getMonth() + 1).padStart(2, '0')
        const day = String(formattedDate.getDate()).padStart(2, '0')
        const hours = String(formattedDate.getHours()).padStart(2, '0')
        const minutes = String(formattedDate.getMinutes()).padStart(2, '0')
        const seconds = String(formattedDate.getSeconds()).padStart(2, '0')
        date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } else if (typeof item.dateUTC === 'string') {
        date = item.dateUTC
      } else {
        date = 'Invalid date'
      }
      const eqUsd = item.eqUSD !== null ? item.eqUSD : 0
      return {
        base: item.base,
        quote: item.quote,
        dateUTC: date,
        orderid: item.orderid,
        pair: item.pair,
        side: item.side,
        price: item.price,
        amount: item.amount,
        total: item.total,
        eqUSD: eqUsd,
        fee: item.fee,
        feecoin: item.feecoin,
        platform: item.platform,
        timestampVal // propriété utilisée pour le tri
      } as TradeTransformed
    })
    .sort((a, b) => b.timestampVal - a.timestampVal) // Tri décroissant
})

// Calcul des agrégats sur les trades filtrés
const safeSum = (acc: number, value: number) => acc + (value || 0)

const sellTrades = computed(() =>
  filteredTrades.value.filter(item => item.side.toLowerCase() === 'sell')
)
const buyTrades = computed(() =>
  filteredTrades.value.filter(item => item.side.toLowerCase() === 'buy')
)

const totalSell = computed(() =>
  sellTrades.value.reduce((acc, item) => safeSum(acc, item.eqUSD), 0)
)
const amountSell = computed(() =>
  sellTrades.value.reduce((acc, item) => acc + (item.amount || 0), 0)
)
const totalBuy = computed(() =>
  buyTrades.value.reduce((acc, item) => safeSum(acc, item.eqUSD), 0)
)
const amountBuy = computed(() =>
  buyTrades.value.reduce((acc, item) => acc + (item.amount || 0), 0)
)

// Calcul du prix d'achat moyen en fonction de la balance réelle
const averageBuyPrice = computed(() => {
  if (realBalance.value === null || realBalance.value === 0) return 0
  return (totalSell.value - totalBuy.value) / realBalance.value
})

// Chargement des trades depuis le store
const getTradesData = async () => {
  try {
    await calculStore.loadTrade()
    console.info('Trade data retrieved:', trades.value.length)
  } catch (error) {
    console.error('An error occurred while retrieving data:', error)
  }
}

onMounted(async () => {
  await getTradesData()
})
</script>

<template>
  <div class="page">
    <div class="header">
      <SearchBar :filters="filters" />
      <div class="trade-sums">
        <label>Supposed Balance: {{ amountBuy - amountSell }}</label>
        <label>Supposed Avg: {{ (totalSell - totalBuy) / (amountBuy - amountSell) }}</label>
        <label>Buy: -{{ totalBuy.toFixed(2) }} / Sell: +{{ totalSell.toFixed(2) }}</label>
        <label>Diff: {{ (totalSell - totalBuy).toFixed(2) }}</label>
        <div>
          <label>Real Balance:</label>
          <input type="number" v-model.number="realBalance" placeholder="Enter real balance" />
        </div>
        <div>
          <label>Average Buy Price: {{ averageBuyPrice }}</label>
        </div>
      </div>
    </div>
    <div class="card">
      <TradesTable :rows="filteredTrades" />
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.trade-sums {
  display: flex;
  flex-direction: column;
  margin-right: 1rem;
}
</style>
