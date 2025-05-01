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
    <div class="card">
      <SearchBar :filters="filters" />
      <TradesTable :rows="filteredTrades" />
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 1rem;
}
</style>
