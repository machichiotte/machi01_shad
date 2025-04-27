<!-- src/components/machi/card/CardAssetHeader.vue -->
<script setup lang="ts">
import { computed, ref, PropType, onMounted } from 'vue'; // Import PropType, onMounted
import { Asset, Order, Trade } from '../../../types/responseData';
import { formatPrice, formatNumberWithDynamicPrecision } from '../../../utils/formatter'; // Assuming this utility exists
import { QUOTE_CURRENCIES_FIAT } from '../../../constants/assets';
import { useLiveDataStore } from '../../../store/liveDataStore'; // <-- IMPORT THE STORE
import {
  FIAT,
  MAJOR_CRYPTO_PAIRS,
  STABLECOINS_USD,
  STABLECOINS_EUR
} from '../../../constants/assets';

// 1: Define component props - Remove livePrice and liveChangePercent
const props = defineProps({
  asset: { type: Object as PropType<Asset>, required: true },
  orders: { type: Array as PropType<Order[]>, required: true },
  trades: { type: Array as PropType<Trade[]>, required: true },
  isDetailsVisible: { type: Boolean, required: true },
  availableMarkets: { type: Array as PropType<string[]>, default: () => [] }
});

// 2: Instantiate the store
const liveDataStore = useLiveDataStore();

// 3: Alias for easier access to asset prop
const asset = props.asset;
// Ref for the selected market in the dropdown
const selectedMarket = ref<string | null>(null);

// --- Computed Properties ---

// 4: Total Buy (uses data within the asset prop, assuming calculated upstream)
const formattedTotalBuy = computed(() => formatPrice(asset.orders?.trade?.totalBuy || 0));
// 5: Total Sell (uses data within the asset prop)
const formattedTotalSell = computed(() => formatPrice(asset.orders?.trade?.totalSell || 0));

// 6: In Order Amount (calculated from the filtered orders passed as prop)
const inOrderAmount = computed(() => {
  return props.orders.reduce((total, order) => total + (order.amount || 0), 0);
});

// 7: Use live data prop for price, fallback to asset data if not available
const displayPrice = computed(() => {
  // 1. Vérifier si un marché est sélectionné
  if (!selectedMarket.value) {
    return '...'; // Indicateur simple si aucun marché n'est choisi
  }

  // 2. Obtenir le prix brut depuis le store
  const price = liveDataStore.getCurrentPrice(selectedMarket.value);

  // 3. Vérifier si le prix est un nombre valide
  //    (pas undefined, null, NaN)
  if (typeof price !== 'number' || isNaN(price)) {
    return '...'; // Indicateur simple si le prix n'est pas (encore) disponible
  }

  // 4. Obtenir la devise de cotation pour déterminer la précision
  const quote = quoteCurrency.value; // Utilise la computed property existante

  // 5. Déterminer la précision requise
  let precision: number = 2;

  if (quote && MAJOR_CRYPTO_PAIRS.includes(quote)) {
    // Si la devise de cotation est BTC, ETH, ou BNB
    precision = 8; // Utiliser jusqu'à 8 décimales
  } 

  return formatNumberWithDynamicPrecision(price, precision);
});

// 8: Calculate live change percentage based on selectedMarket and liveDataStore
const liveChangePercentValue = computed(() => { // Raw value for logic
  if (!selectedMarket.value) return undefined;
  return liveDataStore.getChangePercent(selectedMarket.value);
});

const formattedLiveChangePercent = computed(() => {
  const change = liveChangePercentValue.value;
  return change !== undefined ? change.toFixed(2) : "N/A";
});

// Determine CSS class based on live change percentage
const liveChangeClass = computed(() => {
  const change = liveChangePercentValue.value; // Use the reactive value
  if (change === undefined) return 'neutral'; // Default if no data
  return change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
});

// 9: Profit percentage (from asset prop, assumed calculated upstream)
const formattedProfit = computed(() => {
  return asset.profit !== undefined
    ? asset.profit.toFixed(2)
    : "0.00";
});

const currentPossessionValue = computed(() => {
  // 1. Récupérer le prix BRUT actuel depuis le store
  const currentRawPrice = selectedMarket.value
    ? liveDataStore.getCurrentPrice(selectedMarket.value)
    : undefined;

  // 2. Récupérer la quantité possédée BRUTE
  const currentAmount = asset.liveData?.currentPossession;

  // 3. Vérifier que les deux valeurs sont des nombres valides
  if (typeof currentRawPrice === 'number' && typeof currentAmount === 'number' && !isNaN(currentRawPrice) && !isNaN(currentAmount)) {
    // 4. Calculer la valeur totale
    const totalValue = currentRawPrice * currentAmount;

    // 5. Déterminer la précision basée sur la devise de cotation
    const quote = quoteCurrency.value; // Utilise la computed property créée précédemment
    let precision = 2; // Précision par défaut (pour USDT ou inconnue)
    if (quote && quote !== 'USDT') {
      // Si c'est BTC, ETH, etc., utiliser 8 décimales
      precision = 8;
    }

    // 6. Formater la valeur en utilisant la NOUVELLE fonction formatWithPrecision
    return formatNumberWithDynamicPrecision(totalValue, precision); // <--- Changement ici

  } else {
    // 7. Retourner une valeur par défaut si le calcul est impossible
    return 'N/A'; // Ou formatWithPrecision(0, precision) si vous préférez afficher 0.00 ou 0.00000000
  }
});

const quoteCurrency = computed(() => {
  if (!selectedMarket.value) return null;
  // Trouve la devise de cotation (ex: USDT, BTC, ETH) dans la liste QUOTE_CURRENCIES
  return QUOTE_CURRENCIES_FIAT.find(q => selectedMarket.value!.endsWith(q)) || null;
});

// Propriété calculée pour obtenir le symbole à afficher (ex: $, BTC, ETH)
const quoteCurrencySymbol = computed(() => {
  const quote = quoteCurrency.value; // Get the current quote currency value

  // Handle null or empty case
  if (!quote) return '';

  // 1. Major Crypto Pairs (return ticker)
  if (MAJOR_CRYPTO_PAIRS.includes(quote)) {
    // Handles BTC, ETH, BNB
    return quote;
  }

  // 2. EUR Stablecoins (return €)
  if (STABLECOINS_EUR.includes(quote)) {
    // Handles EURC, EURR
    return '€*';
  }

  // 3. USD Stablecoins (return $)
  if (STABLECOINS_USD.includes(quote)) {
    // Handles USDC, USDR, USDT, BUSD, DAI, TUSD, PAX, GUSD, HUSD, USDN
    return '$*';
  }

  // 4. Fiat Currencies (check for specific symbols, otherwise return code)
  // Using a switch for cleaner handling of specific fiat codes
  switch (quote) {
    // Explicit Fiat Symbols
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'GBP': // British Pound
      return '£';
    case 'JPY': // Japanese Yen
      return '¥';
    case 'CAD': return 'C$'; // Canadian Dollar
    case 'AUD': return 'A$'; // Australian Dollar
    case 'CNY': return '¥'; // Chinese Yuan (can conflict with JPY, consider 'CN¥' or just 'CNY')
    case 'CHF': return 'Fr'; // Swiss Franc (or just 'CHF')
    case 'KRW': // South Korean Won
      return '₩';
    case 'INR': // Indian Rupee
      return '₹';
    case 'RUB': // Russian Ruble
      return '₽';
    case 'BRL': // Brazilian Real
      return 'R$';
    case 'TRY': // Turkish Lira
      return '₺';
    // Default for other Fiats and any unknown cases: return the code itself
    default:
      // This will catch all other fiats (PLN, ZAR, INR, etc.)
      // and any quote currency not covered above.
      // You could optionally check if it's in the FIAT array first:
      // if (FIAT.includes(quote)) { return quote; }
      // else { /* handle unknown */ return '?'; }
      // But simply returning the quote code is often the most practical fallback.
      return quote;
  }
});


// --- Emits ---
// 10: Define component emits
const emit = defineEmits(['toggle-details']);

// --- Methods ---
// 11: Function to ONLY emit the toggle event. Parent handles state.
function handleToggleDetailsClick() {
  emit('toggle-details'); // Let the parent handle the visibility change
}

// Helper to format symbol for display (e.g., BTCUSDT -> BTC/USDT)
const formatMarketSymbol = (symbol: string): string => {
  const quote = QUOTE_CURRENCIES_FIAT.find(q => symbol.endsWith(q));
  if (quote) {
    const base = symbol.slice(0, symbol.length - quote.length);
    return `${base}/${quote}`;
  }
  return symbol;
};

onMounted(() => {
  const defaultMarket = props.availableMarkets.find(m => m === asset.base + 'USDT');
  selectedMarket.value = defaultMarket ?? props.availableMarkets[0] ?? null;
});

</script>

<template>
  <div class="card-header">
    <div class="left-section">
      <div class="top-row">
        <div class="logo-container">
          <img :src="asset.iconUrl" alt="Logo" class="logo" />
        </div>
        <div class="asset-info">
          <div class="asset-name">{{ asset.name }}</div>
          <div class="asset-base-rank">{{ asset.base }} {{ asset.cmc?.rank ? '#' + asset.cmc.rank : '' }}</div>
        </div>
        <div class="market-selector">
          <select v-model="selectedMarket">
            <option :value="null" disabled v-if="!selectedMarket && availableMarkets.length === 0">Loading...</option>
            <option :value="null" disabled v-else-if="!selectedMarket">Select Market</option>
            <option v-for="market in availableMarkets" :key="market" :value="market">
              {{ formatMarketSymbol(market) }}
            </option>
          </select>
        </div>
      </div>

      <div class="middle-row">
        <div class="current-price">{{ displayPrice }}</div>
      </div>

      <div class="bottom-row">
        <div class="cmc-data" :class="liveChangeClass">
          {{ formattedLiveChangePercent }}%
        </div>
      </div>
    </div>

    <div class="right-section">
      <div class="current-possession">
        {{ currentPossessionValue }} {{ quoteCurrencySymbol }} </div>
      <div class="profit-difference">
        <span :class="{
          'positive': asset.profit > 0,
          'negative': asset.profit < 0,
          'neutral': asset.profit === 0
        }">
          {{ formattedProfit }}%
        </span>
        <span> (entry price: {{ formatPrice(asset.orders?.trade?.averageEntryPrice) }}$)</span>
      </div>
      <div class="total-buy">
        Total Buy: {{ formattedTotalBuy }}$
      </div>
      <div class="total-sell">
        Total Sell: {{ formattedTotalSell }}$
      </div>
      <div class="total-amount">
        Total Amount: {{ asset.orders?.trade?.totalAmountBuy }} {{ asset.base }}
      </div>
      <div class="in-order">
        In Order: {{ inOrderAmount.toFixed(8) }} {{ asset.base }} </div>
      <div class="details-button">
        <Button :icon="isDetailsVisible ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="expand-button"
          @click="handleToggleDetailsClick" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 1: Card header layout */
.card-header {
  display: flex;
  justify-content: space-between;
  background-color: #ddd;
  padding: 0.5rem;
}

/* 2: Left section styling */
.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 0.5rem;
}

/* 3: Right section styling */
.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 0.5rem;
  text-align: right;
}

/* 4: Top row layout */
.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

/* 5: Logo container styling */
.logo-container {
  flex-shrink: 0;
}

/* 6: Logo image styling */
.logo {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
}

/* 7: Asset info styling */
.asset-info {
  margin-left: 0.5rem;
}

/* 8: Asset name styling */
.asset-name {
  font-size: 1.2rem;
  font-weight: bold;
}

/* 9: Asset base and rank styling */
.asset-base-rank {
  font-size: 1rem;
  color: #555;
}

/* 10: Market selector styling */
.market-selector {
  margin-left: auto;
}

/* 11: Middle row for current price */
.middle-row {
  text-align: center;
  margin-bottom: 0.5rem;
}

/* 12: Current price styling */
.current-price {
  font-size: 2rem;
  font-weight: bold;
}

/* 13: Bottom row styling for CMC data */
.bottom-row {
  text-align: center;
}

/* 14: CMC data styling with conditional coloring */
.cmc-data {
  font-size: 1rem;
  font-weight: bold;
}

.cmc-data.positive {
  color: #4caf50;
}

.cmc-data.negative {
  color: #ff4c4c;
}

.cmc-data.neutral {
  color: #636963;
}

/* 15: Spacing for each div in right section */
.right-section>div {
  margin-bottom: 0.5rem;
}

/* 16: Current possession styling */
.current-possession {
  font-size: 2rem;
  font-weight: bold;
}

/* 17: Profit difference styling */
.profit-difference {
  font-size: 1rem;
  font-weight: bold;
}

/* 18: Smaller text for total and order info */
.total-buy,
.total-sell,
.total-amount,
.in-order {
  font-size: 0.8rem;
}

/* 19: Details button styling */
.details-button {
  text-align: right;
}

/* 20: Expand button styling */
.expand-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
}


/* Style the select dropdown */
.market-selector select {
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  border: 1px solid #aaa;
  /* Slightly darker border */
  background-color: white;
  min-width: 100px;
  /* Ensure minimum width */
  cursor: pointer;
  color: #333;
}

/* Ensure right-section items have consistent bottom margin */
.right-section>div:not(:last-child) {
  margin-bottom: 0.3rem;
  /* Adjust spacing */
}

.right-section>div:last-child {
  margin-bottom: 0;
  /* No margin for the button container */
}

/* Ensure button aligns well */
.details-button {
  line-height: 1;
  /* Adjust button alignment if needed */
  margin-top: auto;
  /* Push button towards the bottom if needed */
}

.expand-button {
  padding: 0.2rem;
  /* Add some padding if needed */
}

/* Add optional styling for positive/negative/neutral in profit difference */
.profit-difference .positive {
  color: #4caf50;
}

.profit-difference .negative {
  color: #ff4c4c;
}

.profit-difference .neutral {
  color: #636963;
}
</style>
